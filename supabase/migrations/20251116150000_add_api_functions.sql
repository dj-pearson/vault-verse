-- Migration: Add API functions for CLI and frontend integration
-- Description: Adds RPC functions for secret management, audit logging, sync operations, and CLI authentication

-- ============================================================================
-- CLI ACCESS TOKENS
-- ============================================================================

-- Create CLI access tokens table
CREATE TABLE public.cli_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Enable RLS
ALTER TABLE public.cli_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for CLI tokens
CREATE POLICY "Users can view their own tokens"
  ON public.cli_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tokens"
  ON public.cli_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens"
  ON public.cli_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- SYNC OPERATIONS (Encrypted Blobs)
-- ============================================================================

-- Create encrypted_blobs table for team sync
CREATE TABLE public.encrypted_blobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  encrypted_data TEXT NOT NULL, -- Base64 encoded encrypted blob
  checksum TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, version)
);

-- Enable RLS
ALTER TABLE public.encrypted_blobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for encrypted blobs
CREATE POLICY "Users can view blobs for accessible projects"
  ON public.encrypted_blobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_id AND (owner_id = auth.uid() OR public.has_project_access(auth.uid(), id))
    )
  );

CREATE POLICY "Users can upload blobs for accessible projects"
  ON public.encrypted_blobs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_id AND (owner_id = auth.uid() OR public.has_project_access(auth.uid(), id))
    ) AND uploaded_by = auth.uid()
  );

-- Create index for faster blob queries
CREATE INDEX idx_encrypted_blobs_project ON encrypted_blobs(project_id, version DESC);

-- ============================================================================
-- AUDIT LOGGING FUNCTIONS
-- ============================================================================

-- Enhanced audit log function
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_project_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (project_id, user_id, action, resource_type, resource_id, metadata)
  VALUES (p_project_id, auth.uid(), p_action, p_resource_type, p_resource_id, p_metadata)
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$$;

-- Trigger function to automatically log secret changes
CREATE OR REPLACE FUNCTION public.log_secret_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project_uuid UUID;
  action_text TEXT;
BEGIN
  -- Get project ID
  SELECT e.project_id INTO project_uuid
  FROM environments e
  WHERE e.id = COALESCE(NEW.environment_id, OLD.environment_id);

  -- Determine action
  IF TG_OP = 'INSERT' THEN
    action_text := 'secret_created';
  ELSIF TG_OP = 'UPDATE' THEN
    action_text := 'secret_updated';
  ELSIF TG_OP = 'DELETE' THEN
    action_text := 'secret_deleted';
  END IF;

  -- Log the event
  PERFORM log_audit_event(
    project_uuid,
    action_text,
    'secret',
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'key', COALESCE(NEW.key, OLD.key),
      'environment_id', COALESCE(NEW.environment_id, OLD.environment_id)
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create audit triggers for secrets
CREATE TRIGGER audit_secret_changes
  AFTER INSERT OR UPDATE OR DELETE ON secrets
  FOR EACH ROW EXECUTE FUNCTION log_secret_changes();

-- ============================================================================
-- SECRET MANAGEMENT RPC FUNCTIONS
-- ============================================================================

-- Function to create or update a secret
CREATE OR REPLACE FUNCTION public.upsert_secret(
  p_environment_id UUID,
  p_key TEXT,
  p_value TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  secret_id UUID;
  project_uuid UUID;
BEGIN
  -- Verify access
  SELECT e.project_id INTO project_uuid
  FROM environments e
  JOIN projects p ON e.project_id = p.id
  WHERE e.id = p_environment_id
    AND (p.owner_id = auth.uid() OR public.has_project_access(auth.uid(), p.id));

  IF project_uuid IS NULL THEN
    RAISE EXCEPTION 'Access denied or environment not found';
  END IF;

  -- Insert or update secret
  INSERT INTO secrets (environment_id, key, value, created_by)
  VALUES (p_environment_id, p_key, p_value, auth.uid())
  ON CONFLICT (environment_id, key)
  DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = now()
  RETURNING id INTO secret_id;

  RETURN secret_id;
END;
$$;

-- Function to delete a secret
CREATE OR REPLACE FUNCTION public.delete_secret(
  p_environment_id UUID,
  p_key TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project_uuid UUID;
  deleted_count INTEGER;
BEGIN
  -- Verify access
  SELECT e.project_id INTO project_uuid
  FROM environments e
  JOIN projects p ON e.project_id = p.id
  WHERE e.id = p_environment_id
    AND (p.owner_id = auth.uid() OR public.has_project_access(auth.uid(), p.id));

  IF project_uuid IS NULL THEN
    RAISE EXCEPTION 'Access denied or environment not found';
  END IF;

  -- Delete secret
  DELETE FROM secrets
  WHERE environment_id = p_environment_id AND key = p_key;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count > 0;
END;
$$;

-- Function to get secrets for an environment (returns encrypted values)
CREATE OR REPLACE FUNCTION public.get_environment_secrets(
  p_environment_id UUID
)
RETURNS TABLE (
  id UUID,
  key TEXT,
  value TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify access
  IF NOT EXISTS (
    SELECT 1
    FROM environments e
    JOIN projects p ON e.project_id = p.id
    WHERE e.id = p_environment_id
      AND (p.owner_id = auth.uid() OR public.has_project_access(auth.uid(), p.id))
  ) THEN
    RAISE EXCEPTION 'Access denied or environment not found';
  END IF;

  -- Return secrets
  RETURN QUERY
  SELECT s.id, s.key, s.value, s.created_at, s.updated_at
  FROM secrets s
  WHERE s.environment_id = p_environment_id
  ORDER BY s.key;
END;
$$;

-- ============================================================================
-- ENVIRONMENT MANAGEMENT RPC FUNCTIONS
-- ============================================================================

-- Function to create environment
CREATE OR REPLACE FUNCTION public.create_environment(
  p_project_id UUID,
  p_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  env_id UUID;
BEGIN
  -- Verify access (must be project owner)
  IF NOT EXISTS (
    SELECT 1 FROM projects
    WHERE id = p_project_id AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied or project not found';
  END IF;

  -- Create environment
  INSERT INTO environments (project_id, name)
  VALUES (p_project_id, p_name)
  RETURNING id INTO env_id;

  -- Log audit event
  PERFORM log_audit_event(
    p_project_id,
    'environment_created',
    'environment',
    env_id,
    jsonb_build_object('name', p_name)
  );

  RETURN env_id;
END;
$$;

-- Function to delete environment
CREATE OR REPLACE FUNCTION public.delete_environment(
  p_environment_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project_uuid UUID;
  env_name TEXT;
  deleted_count INTEGER;
BEGIN
  -- Get environment info and verify access
  SELECT e.project_id, e.name INTO project_uuid, env_name
  FROM environments e
  JOIN projects p ON e.project_id = p.id
  WHERE e.id = p_environment_id AND p.owner_id = auth.uid();

  IF project_uuid IS NULL THEN
    RAISE EXCEPTION 'Access denied or environment not found';
  END IF;

  -- Delete environment (cascades to secrets)
  DELETE FROM environments WHERE id = p_environment_id;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  IF deleted_count > 0 THEN
    -- Log audit event
    PERFORM log_audit_event(
      project_uuid,
      'environment_deleted',
      'environment',
      p_environment_id,
      jsonb_build_object('name', env_name)
    );
  END IF;

  RETURN deleted_count > 0;
END;
$$;

-- Function to copy secrets between environments
CREATE OR REPLACE FUNCTION public.copy_environment_secrets(
  p_source_env_id UUID,
  p_target_env_id UUID,
  p_overwrite BOOLEAN DEFAULT false
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  source_project_id UUID;
  target_project_id UUID;
  copied_count INTEGER := 0;
  secret_record RECORD;
BEGIN
  -- Verify access to both environments
  SELECT e.project_id INTO source_project_id
  FROM environments e
  JOIN projects p ON e.project_id = p.id
  WHERE e.id = p_source_env_id
    AND (p.owner_id = auth.uid() OR public.has_project_access(auth.uid(), p.id));

  SELECT e.project_id INTO target_project_id
  FROM environments e
  JOIN projects p ON e.project_id = p.id
  WHERE e.id = p_target_env_id
    AND (p.owner_id = auth.uid() OR public.has_project_access(auth.uid(), p.id));

  IF source_project_id IS NULL OR target_project_id IS NULL THEN
    RAISE EXCEPTION 'Access denied or environments not found';
  END IF;

  -- Copy secrets
  FOR secret_record IN
    SELECT key, value
    FROM secrets
    WHERE environment_id = p_source_env_id
  LOOP
    IF p_overwrite THEN
      INSERT INTO secrets (environment_id, key, value, created_by)
      VALUES (p_target_env_id, secret_record.key, secret_record.value, auth.uid())
      ON CONFLICT (environment_id, key)
      DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = now();
      copied_count := copied_count + 1;
    ELSE
      INSERT INTO secrets (environment_id, key, value, created_by)
      VALUES (p_target_env_id, secret_record.key, secret_record.value, auth.uid())
      ON CONFLICT (environment_id, key) DO NOTHING;
      IF FOUND THEN
        copied_count := copied_count + 1;
      END IF;
    END IF;
  END LOOP;

  RETURN copied_count;
END;
$$;

-- ============================================================================
-- SYNC OPERATIONS RPC FUNCTIONS
-- ============================================================================

-- Function to push encrypted blob (for CLI sync)
CREATE OR REPLACE FUNCTION public.push_encrypted_blob(
  p_project_id UUID,
  p_encrypted_data TEXT,
  p_checksum TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_version INTEGER;
  blob_id UUID;
BEGIN
  -- Verify access
  IF NOT EXISTS (
    SELECT 1 FROM projects
    WHERE id = p_project_id
      AND (owner_id = auth.uid() OR public.has_project_access(auth.uid(), id))
  ) THEN
    RAISE EXCEPTION 'Access denied or project not found';
  END IF;

  -- Get next version number
  SELECT COALESCE(MAX(version), 0) + 1 INTO new_version
  FROM encrypted_blobs
  WHERE project_id = p_project_id;

  -- Insert new blob
  INSERT INTO encrypted_blobs (project_id, version, encrypted_data, checksum, uploaded_by)
  VALUES (p_project_id, new_version, p_encrypted_data, p_checksum, auth.uid())
  RETURNING id INTO blob_id;

  -- Log audit event
  PERFORM log_audit_event(
    p_project_id,
    'blob_pushed',
    'encrypted_blob',
    blob_id,
    jsonb_build_object('version', new_version, 'checksum', p_checksum)
  );

  RETURN json_build_object(
    'id', blob_id,
    'version', new_version,
    'uploaded_at', now()
  );
END;
$$;

-- Function to pull latest encrypted blob
CREATE OR REPLACE FUNCTION public.pull_encrypted_blob(
  p_project_id UUID,
  p_since_version INTEGER DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  blob_record RECORD;
BEGIN
  -- Verify access
  IF NOT EXISTS (
    SELECT 1 FROM projects
    WHERE id = p_project_id
      AND (owner_id = auth.uid() OR public.has_project_access(auth.uid(), id))
  ) THEN
    RAISE EXCEPTION 'Access denied or project not found';
  END IF;

  -- Get latest blob (or latest since version)
  SELECT id, version, encrypted_data, checksum, uploaded_at
  INTO blob_record
  FROM encrypted_blobs
  WHERE project_id = p_project_id
    AND (p_since_version IS NULL OR version > p_since_version)
  ORDER BY version DESC
  LIMIT 1;

  IF blob_record IS NULL THEN
    RETURN json_build_object('has_update', false);
  END IF;

  RETURN json_build_object(
    'has_update', true,
    'id', blob_record.id,
    'version', blob_record.version,
    'encrypted_data', blob_record.encrypted_data,
    'checksum', blob_record.checksum,
    'uploaded_at', blob_record.uploaded_at
  );
END;
$$;

-- ============================================================================
-- TEAM MANAGEMENT RPC FUNCTIONS
-- ============================================================================

-- Function to invite team member
CREATE OR REPLACE FUNCTION public.invite_team_member(
  p_project_id UUID,
  p_email TEXT,
  p_role app_role DEFAULT 'viewer'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_user_id UUID;
  member_id UUID;
BEGIN
  -- Verify project owner
  IF NOT EXISTS (
    SELECT 1 FROM projects
    WHERE id = p_project_id AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied or project not found';
  END IF;

  -- Find user by email
  SELECT id INTO member_user_id
  FROM auth.users
  WHERE email = p_email;

  IF member_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with email: %', p_email;
  END IF;

  -- Add team member
  INSERT INTO team_members (project_id, user_id, role, invited_by)
  VALUES (p_project_id, member_user_id, p_role, auth.uid())
  ON CONFLICT (project_id, user_id)
  DO UPDATE SET role = EXCLUDED.role
  RETURNING id INTO member_id;

  -- Log audit event
  PERFORM log_audit_event(
    p_project_id,
    'member_invited',
    'team_member',
    member_id,
    jsonb_build_object('email', p_email, 'role', p_role)
  );

  RETURN member_id;
END;
$$;

-- Function to remove team member
CREATE OR REPLACE FUNCTION public.remove_team_member(
  p_project_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Verify project owner
  IF NOT EXISTS (
    SELECT 1 FROM projects
    WHERE id = p_project_id AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied or project not found';
  END IF;

  -- Remove team member
  DELETE FROM team_members
  WHERE project_id = p_project_id AND user_id = p_user_id;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  IF deleted_count > 0 THEN
    -- Log audit event
    PERFORM log_audit_event(
      p_project_id,
      'member_removed',
      'team_member',
      NULL,
      jsonb_build_object('user_id', p_user_id)
    );
  END IF;

  RETURN deleted_count > 0;
END;
$$;

-- ============================================================================
-- CLI AUTHENTICATION FUNCTIONS
-- ============================================================================

-- Function to generate CLI token (returns the actual token, hash is stored)
CREATE OR REPLACE FUNCTION public.generate_cli_token(
  p_name TEXT,
  p_expires_in_days INTEGER DEFAULT 90
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  token_value TEXT;
  token_hash TEXT;
  token_id UUID;
  expires TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Generate random token (this is just for demo - in production use proper token generation)
  token_value := 'envt_' || encode(gen_random_bytes(32), 'hex');

  -- Hash the token for storage
  token_hash := encode(digest(token_value, 'sha256'), 'hex');

  -- Calculate expiration
  IF p_expires_in_days > 0 THEN
    expires := now() + (p_expires_in_days || ' days')::interval;
  ELSE
    expires := NULL; -- No expiration
  END IF;

  -- Store token hash
  INSERT INTO cli_tokens (user_id, token_hash, name, expires_at)
  VALUES (auth.uid(), token_hash, p_name, expires)
  RETURNING id INTO token_id;

  -- Return token (only shown once!)
  RETURN json_build_object(
    'id', token_id,
    'token', token_value,
    'name', p_name,
    'expires_at', expires,
    'warning', 'Save this token securely - it will not be shown again!'
  );
END;
$$;

-- Function to validate CLI token
CREATE OR REPLACE FUNCTION public.validate_cli_token(
  p_token TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  token_hash TEXT;
  user_uuid UUID;
  token_id UUID;
BEGIN
  -- Hash the provided token
  token_hash := encode(digest(p_token, 'sha256'), 'hex');

  -- Find and validate token
  SELECT ct.user_id, ct.id INTO user_uuid, token_id
  FROM cli_tokens ct
  WHERE ct.token_hash = token_hash
    AND (ct.expires_at IS NULL OR ct.expires_at > now());

  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired token';
  END IF;

  -- Update last used timestamp
  UPDATE cli_tokens
  SET last_used_at = now()
  WHERE id = token_id;

  RETURN user_uuid;
END;
$$;

-- Function to revoke CLI token
CREATE OR REPLACE FUNCTION public.revoke_cli_token(
  p_token_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM cli_tokens
  WHERE id = p_token_id AND user_id = auth.uid();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count > 0;
END;
$$;

-- Grant execute permissions on RPC functions
GRANT EXECUTE ON FUNCTION public.upsert_secret TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_secret TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_environment_secrets TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_environment TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_environment TO authenticated;
GRANT EXECUTE ON FUNCTION public.copy_environment_secrets TO authenticated;
GRANT EXECUTE ON FUNCTION public.push_encrypted_blob TO authenticated;
GRANT EXECUTE ON FUNCTION public.pull_encrypted_blob TO authenticated;
GRANT EXECUTE ON FUNCTION public.invite_team_member TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_team_member TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_cli_token TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_cli_token TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_cli_token TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit_event TO authenticated;
