-- Create CLI tokens table
CREATE TABLE IF NOT EXISTS public.cli_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on cli_tokens
ALTER TABLE public.cli_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies for cli_tokens
CREATE POLICY "Users can view their own CLI tokens"
  ON public.cli_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CLI tokens"
  ON public.cli_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_cli_tokens_user_id ON public.cli_tokens(user_id);
CREATE INDEX idx_cli_tokens_token_hash ON public.cli_tokens(token_hash);

-- Add updated_at trigger for cli_tokens
CREATE TRIGGER update_cli_tokens_updated_at
  BEFORE UPDATE ON public.cli_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to generate CLI token
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
  v_token TEXT;
  v_token_hash TEXT;
  v_token_id UUID;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Generate a secure random token (64 characters)
  v_token := encode(gen_random_bytes(32), 'base64');
  v_token := replace(replace(replace(v_token, '+', '-'), '/', '_'), '=', '');
  
  -- Hash the token for storage
  v_token_hash := encode(digest(v_token, 'sha256'), 'hex');
  
  -- Calculate expiration
  IF p_expires_in_days > 0 THEN
    v_expires_at := now() + (p_expires_in_days || ' days')::interval;
  END IF;
  
  -- Insert token record
  INSERT INTO public.cli_tokens (user_id, token_hash, name, expires_at)
  VALUES (auth.uid(), v_token_hash, p_name, v_expires_at)
  RETURNING id INTO v_token_id;
  
  -- Return token details (token is only shown once)
  RETURN json_build_object(
    'id', v_token_id,
    'token', 'evt_' || v_token,
    'name', p_name,
    'expires_at', v_expires_at,
    'warning', 'Save this token securely - it will not be shown again!'
  );
END;
$$;

-- Function to revoke CLI token
CREATE OR REPLACE FUNCTION public.revoke_cli_token(p_token_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.cli_tokens
  WHERE id = p_token_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

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
  v_environment_id UUID;
BEGIN
  -- Check if user has access to project
  IF NOT has_project_access(auth.uid(), p_project_id) THEN
    RAISE EXCEPTION 'Access denied to project';
  END IF;
  
  -- Create environment
  INSERT INTO public.environments (project_id, name)
  VALUES (p_project_id, p_name)
  RETURNING id INTO v_environment_id;
  
  -- Log action
  INSERT INTO public.audit_logs (project_id, user_id, resource_type, resource_id, action, metadata)
  VALUES (p_project_id, auth.uid(), 'environment', v_environment_id, 'created', 
          json_build_object('name', p_name));
  
  RETURN v_environment_id;
END;
$$;

-- Function to delete environment
CREATE OR REPLACE FUNCTION public.delete_environment(p_environment_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id UUID;
  v_env_name TEXT;
BEGIN
  -- Get project_id and check access
  SELECT e.project_id, e.name INTO v_project_id, v_env_name
  FROM public.environments e
  JOIN public.projects p ON e.project_id = p.id
  WHERE e.id = p_environment_id AND p.owner_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Environment not found or access denied';
  END IF;
  
  -- Delete environment (cascades to secrets)
  DELETE FROM public.environments WHERE id = p_environment_id;
  
  -- Log action
  INSERT INTO public.audit_logs (project_id, user_id, resource_type, resource_id, action, metadata)
  VALUES (v_project_id, auth.uid(), 'environment', p_environment_id, 'deleted',
          json_build_object('name', v_env_name));
  
  RETURN TRUE;
END;
$$;

-- Function to copy environment secrets
CREATE OR REPLACE FUNCTION public.copy_environment_secrets(
  p_source_env_id UUID,
  p_target_env_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_copied_count INTEGER := 0;
  v_project_id UUID;
BEGIN
  -- Check if user has access to both environments
  SELECT DISTINCT e.project_id INTO v_project_id
  FROM public.environments e
  WHERE e.id IN (p_source_env_id, p_target_env_id)
    AND has_project_access(auth.uid(), e.project_id);
  
  IF v_project_id IS NULL THEN
    RAISE EXCEPTION 'Access denied to environments';
  END IF;
  
  -- Copy secrets
  INSERT INTO public.secrets (environment_id, key, value, created_by)
  SELECT p_target_env_id, s.key, s.value, auth.uid()
  FROM public.secrets s
  WHERE s.environment_id = p_source_env_id
  ON CONFLICT (environment_id, key) DO UPDATE
  SET value = EXCLUDED.value, updated_at = now();
  
  GET DIAGNOSTICS v_copied_count = ROW_COUNT;
  
  -- Log action
  INSERT INTO public.audit_logs (project_id, user_id, resource_type, action, metadata)
  VALUES (v_project_id, auth.uid(), 'environment', 'secrets_copied',
          json_build_object('source_env_id', p_source_env_id, 'target_env_id', p_target_env_id, 'count', v_copied_count));
  
  RETURN v_copied_count;
END;
$$;

-- Function to get environment secrets (with decryption handled client-side)
CREATE OR REPLACE FUNCTION public.get_environment_secrets(p_environment_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_secrets JSON;
BEGIN
  -- Check access
  IF NOT EXISTS (
    SELECT 1 FROM public.environments e
    WHERE e.id = p_environment_id
      AND has_project_access(auth.uid(), e.project_id)
  ) THEN
    RAISE EXCEPTION 'Access denied to environment';
  END IF;
  
  -- Get secrets
  SELECT json_agg(json_build_object(
    'id', s.id,
    'key', s.key,
    'value', s.value,
    'created_at', s.created_at,
    'updated_at', s.updated_at
  ) ORDER BY s.key)
  INTO v_secrets
  FROM public.secrets s
  WHERE s.environment_id = p_environment_id;
  
  RETURN COALESCE(v_secrets, '[]'::json);
END;
$$;

-- Function to upsert secret
CREATE OR REPLACE FUNCTION public.upsert_secret(
  p_environment_id UUID,
  p_key TEXT,
  p_value TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_secret_id UUID;
  v_project_id UUID;
  v_action TEXT;
BEGIN
  -- Check access
  SELECT e.project_id INTO v_project_id
  FROM public.environments e
  WHERE e.id = p_environment_id
    AND has_project_access(auth.uid(), e.project_id);
  
  IF v_project_id IS NULL THEN
    RAISE EXCEPTION 'Access denied to environment';
  END IF;
  
  -- Upsert secret
  INSERT INTO public.secrets (environment_id, key, value, created_by)
  VALUES (p_environment_id, p_key, p_value, auth.uid())
  ON CONFLICT (environment_id, key) DO UPDATE
  SET value = EXCLUDED.value, updated_at = now()
  RETURNING id, (xmax = 0) INTO v_secret_id, v_action;
  
  -- Log action
  INSERT INTO public.audit_logs (project_id, user_id, resource_type, resource_id, action, metadata)
  VALUES (v_project_id, auth.uid(), 'secret', v_secret_id, 
          CASE WHEN v_action THEN 'created' ELSE 'updated' END,
          json_build_object('key', p_key, 'environment_id', p_environment_id));
  
  RETURN v_secret_id;
END;
$$;

-- Function to delete secret
CREATE OR REPLACE FUNCTION public.delete_secret(p_secret_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id UUID;
  v_key TEXT;
BEGIN
  -- Get project_id and check access
  SELECT e.project_id, s.key INTO v_project_id, v_key
  FROM public.secrets s
  JOIN public.environments e ON s.environment_id = e.id
  WHERE s.id = p_secret_id
    AND has_project_access(auth.uid(), e.project_id);
  
  IF v_project_id IS NULL THEN
    RAISE EXCEPTION 'Secret not found or access denied';
  END IF;
  
  -- Delete secret
  DELETE FROM public.secrets WHERE id = p_secret_id;
  
  -- Log action
  INSERT INTO public.audit_logs (project_id, user_id, resource_type, resource_id, action, metadata)
  VALUES (v_project_id, auth.uid(), 'secret', p_secret_id, 'deleted',
          json_build_object('key', v_key));
  
  RETURN TRUE;
END;
$$;

-- Add unique constraint for secrets (environment_id, key)
ALTER TABLE public.secrets ADD CONSTRAINT secrets_environment_key_unique UNIQUE (environment_id, key);