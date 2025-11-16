-- Migration: Add Rate Limiting
-- Description: Implements rate limiting to prevent abuse and brute force attacks
-- Date: 2025-11-17

-- Rate limiting table to track requests
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes for performance
  CONSTRAINT rate_limits_user_endpoint_window UNIQUE (user_id, endpoint, window_start),
  CONSTRAINT rate_limits_ip_endpoint_window UNIQUE (ip_address, endpoint, window_start)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint
  ON public.rate_limits(user_id, endpoint, window_start DESC);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_endpoint
  ON public.rate_limits(ip_address, endpoint, window_start DESC);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window
  ON public.rate_limits(window_start DESC);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can manage rate limits
CREATE POLICY "Service role can manage rate limits"
  ON public.rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_endpoint TEXT,
  p_max_requests INTEGER,
  p_window_seconds INTEGER DEFAULT 60
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_ip_address INET;
  v_count INTEGER;
  v_window_start TIMESTAMPTZ;
BEGIN
  -- Get current user and IP
  v_user_id := auth.uid();
  v_ip_address := inet_client_addr();

  -- Calculate window start (round down to window boundary)
  v_window_start := date_trunc('minute', NOW()) -
                    ((EXTRACT(SECOND FROM NOW())::INTEGER / p_window_seconds) * p_window_seconds || ' seconds')::INTERVAL;

  -- Count requests in current window for this user/IP
  SELECT COALESCE(SUM(request_count), 0) INTO v_count
  FROM public.rate_limits
  WHERE endpoint = p_endpoint
    AND window_start >= v_window_start
    AND (
      (v_user_id IS NOT NULL AND user_id = v_user_id) OR
      (v_user_id IS NULL AND ip_address = v_ip_address)
    );

  -- Check if limit exceeded
  IF v_count >= p_max_requests THEN
    RETURN FALSE;
  END IF;

  -- Record this request (upsert)
  INSERT INTO public.rate_limits (user_id, ip_address, endpoint, window_start, request_count)
  VALUES (v_user_id, v_ip_address, p_endpoint, v_window_start, 1)
  ON CONFLICT (user_id, endpoint, window_start)
    WHERE user_id IS NOT NULL
    DO UPDATE SET request_count = rate_limits.request_count + 1
  ON CONFLICT (ip_address, endpoint, window_start)
    WHERE user_id IS NULL
    DO UPDATE SET request_count = rate_limits.request_count + 1;

  RETURN TRUE;
END;
$$;

-- Function to get current rate limit status for debugging
CREATE OR REPLACE FUNCTION public.get_rate_limit_status(
  p_endpoint TEXT,
  p_max_requests INTEGER,
  p_window_seconds INTEGER DEFAULT 60
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_ip_address INET;
  v_count INTEGER;
  v_window_start TIMESTAMPTZ;
  v_remaining INTEGER;
  v_reset_at TIMESTAMPTZ;
BEGIN
  v_user_id := auth.uid();
  v_ip_address := inet_client_addr();

  v_window_start := date_trunc('minute', NOW()) -
                    ((EXTRACT(SECOND FROM NOW())::INTEGER / p_window_seconds) * p_window_seconds || ' seconds')::INTERVAL;

  SELECT COALESCE(SUM(request_count), 0) INTO v_count
  FROM public.rate_limits
  WHERE endpoint = p_endpoint
    AND window_start >= v_window_start
    AND (
      (v_user_id IS NOT NULL AND user_id = v_user_id) OR
      (v_user_id IS NULL AND ip_address = v_ip_address)
    );

  v_remaining := GREATEST(0, p_max_requests - v_count);
  v_reset_at := v_window_start + (p_window_seconds || ' seconds')::INTERVAL;

  RETURN json_build_object(
    'limit', p_max_requests,
    'remaining', v_remaining,
    'used', v_count,
    'reset_at', v_reset_at,
    'retry_after', GREATEST(0, EXTRACT(EPOCH FROM (v_reset_at - NOW()))::INTEGER)
  );
END;
$$;

-- Clean up old rate limit records (run periodically via cron)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete records older than 1 hour
  DELETE FROM public.rate_limits
  WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$;

-- Apply rate limiting to existing RPC functions
-- Update upsert_secret with rate limiting
CREATE OR REPLACE FUNCTION public.upsert_secret(
  p_environment_id UUID,
  p_key TEXT,
  p_value TEXT,
  p_description TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_secret_id UUID;
  v_project_id UUID;
BEGIN
  -- Rate limit: 50 requests per minute
  IF NOT check_rate_limit('upsert_secret', 50, 60) THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again in a few moments.';
  END IF;

  -- Verify user has access to this environment's project
  SELECT e.project_id INTO v_project_id
  FROM public.environments e
  INNER JOIN public.projects p ON e.project_id = p.id
  WHERE e.id = p_environment_id
    AND (
      p.owner_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.project_id = p.id
          AND tm.user_id = auth.uid()
          AND tm.role IN ('admin', 'developer')
      )
    );

  IF v_project_id IS NULL THEN
    RAISE EXCEPTION 'Access denied or environment not found';
  END IF;

  -- Insert or update secret
  INSERT INTO public.secrets (environment_id, key, value, description, created_by)
  VALUES (p_environment_id, p_key, p_value, p_description, auth.uid())
  ON CONFLICT (environment_id, key)
  DO UPDATE SET
    value = EXCLUDED.value,
    description = COALESCE(EXCLUDED.description, secrets.description),
    updated_at = NOW(),
    updated_by = auth.uid()
  RETURNING id INTO v_secret_id;

  RETURN v_secret_id;
END;
$$;

-- Update other critical RPC functions with rate limiting

-- get_environment_secrets: 100 requests per minute
CREATE OR REPLACE FUNCTION public.get_environment_secrets(
  p_environment_id UUID
) RETURNS TABLE (
  id UUID,
  environment_id UUID,
  key TEXT,
  value TEXT,
  description TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Rate limit: 100 requests per minute (read operation)
  IF NOT check_rate_limit('get_environment_secrets', 100, 60) THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again in a few moments.';
  END IF;

  -- Verify access
  IF NOT EXISTS (
    SELECT 1 FROM public.environments e
    INNER JOIN public.projects p ON e.project_id = p.id
    WHERE e.id = p_environment_id
      AND (
        p.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.project_id = p.id AND tm.user_id = auth.uid()
        )
      )
  ) THEN
    RAISE EXCEPTION 'Access denied or environment not found';
  END IF;

  -- Return secrets
  RETURN QUERY
  SELECT s.id, s.environment_id, s.key, s.value, s.description, s.created_at, s.updated_at
  FROM public.secrets s
  WHERE s.environment_id = p_environment_id
  ORDER BY s.key;
END;
$$;

-- generate_cli_token: 5 requests per 15 minutes (auth operation)
CREATE OR REPLACE FUNCTION public.generate_cli_token(
  p_name TEXT,
  p_expires_in_days INTEGER DEFAULT 90
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token TEXT;
  v_token_id UUID;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Rate limit: 5 requests per 15 minutes (prevent token spam)
  IF NOT check_rate_limit('generate_cli_token', 5, 900) THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;

  -- Generate random token
  v_token := encode(gen_random_bytes(32), 'base64');
  v_expires_at := NOW() + (p_expires_in_days || ' days')::INTERVAL;

  -- Store token (hashed)
  INSERT INTO public.cli_tokens (user_id, name, token_hash, expires_at)
  VALUES (
    auth.uid(),
    p_name,
    digest(v_token, 'sha256'),
    v_expires_at
  )
  RETURNING id INTO v_token_id;

  RETURN json_build_object(
    'token_id', v_token_id,
    'token', v_token,
    'name', p_name,
    'expires_at', v_expires_at,
    'warning', 'Store this token securely. It will not be shown again.'
  );
END;
$$;

-- validate_cli_token: 20 requests per minute (auth validation)
CREATE OR REPLACE FUNCTION public.validate_cli_token(
  p_token TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_token_hash BYTEA;
BEGIN
  -- Rate limit: 20 requests per minute
  IF NOT check_rate_limit('validate_cli_token', 20, 60) THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again in a few moments.';
  END IF;

  v_token_hash := digest(p_token, 'sha256');

  -- Find valid token
  SELECT user_id INTO v_user_id
  FROM public.cli_tokens
  WHERE token_hash = v_token_hash
    AND expires_at > NOW()
    AND revoked_at IS NULL;

  IF v_user_id IS NULL THEN
    -- Log failed attempt
    INSERT INTO public.audit_logs (user_id, action, resource_type, details)
    VALUES (NULL, 'cli_token_validation_failed', 'cli_token',
            json_build_object('ip', inet_client_addr()::TEXT));

    RAISE EXCEPTION 'Invalid or expired token';
  END IF;

  -- Update last used
  UPDATE public.cli_tokens
  SET last_used_at = NOW()
  WHERE token_hash = v_token_hash;

  RETURN v_user_id;
END;
$$;

-- push_encrypted_blob: 10 requests per minute (expensive operation)
CREATE OR REPLACE FUNCTION public.push_encrypted_blob(
  p_project_id UUID,
  p_encrypted_data TEXT,
  p_checksum TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_version INTEGER;
  v_blob_id UUID;
BEGIN
  -- Rate limit: 10 requests per minute (sync is expensive)
  IF NOT check_rate_limit('push_encrypted_blob', 10, 60) THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again in a few moments.';
  END IF;

  -- Verify project access
  IF NOT EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = p_project_id
      AND (
        p.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.project_id = p.id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('admin', 'developer')
        )
      )
  ) THEN
    RAISE EXCEPTION 'Access denied or project not found';
  END IF;

  -- Get next version
  SELECT COALESCE(MAX(version), 0) + 1 INTO v_version
  FROM public.encrypted_blobs
  WHERE project_id = p_project_id;

  -- Insert blob
  INSERT INTO public.encrypted_blobs (project_id, version, encrypted_data, checksum, uploaded_by)
  VALUES (p_project_id, v_version, p_encrypted_data, p_checksum, auth.uid())
  RETURNING id INTO v_blob_id;

  RETURN json_build_object(
    'blob_id', v_blob_id,
    'version', v_version,
    'checksum', p_checksum
  );
END;
$$;

-- pull_encrypted_blob: 20 requests per minute
CREATE OR REPLACE FUNCTION public.pull_encrypted_blob(
  p_project_id UUID,
  p_since_version INTEGER DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_blob RECORD;
BEGIN
  -- Rate limit: 20 requests per minute
  IF NOT check_rate_limit('pull_encrypted_blob', 20, 60) THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again in a few moments.';
  END IF;

  -- Verify project access
  IF NOT EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = p_project_id
      AND (
        p.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.project_id = p.id AND tm.user_id = auth.uid()
        )
      )
  ) THEN
    RAISE EXCEPTION 'Access denied or project not found';
  END IF;

  -- Get latest blob
  SELECT * INTO v_blob
  FROM public.encrypted_blobs
  WHERE project_id = p_project_id
    AND (p_since_version IS NULL OR version > p_since_version)
  ORDER BY version DESC
  LIMIT 1;

  IF v_blob.id IS NULL THEN
    RETURN json_build_object(
      'version', NULL,
      'encrypted_data', NULL,
      'checksum', NULL,
      'has_updates', FALSE
    );
  END IF;

  RETURN json_build_object(
    'version', v_blob.version,
    'encrypted_data', v_blob.encrypted_data,
    'checksum', v_blob.checksum,
    'has_updates', TRUE,
    'uploaded_at', v_blob.created_at,
    'uploaded_by', v_blob.uploaded_by
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_rate_limit TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_rate_limit_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_rate_limits TO service_role;

-- Comment documentation
COMMENT ON TABLE public.rate_limits IS 'Tracks API request counts for rate limiting';
COMMENT ON FUNCTION public.check_rate_limit IS 'Checks if request is within rate limit and records the request';
COMMENT ON FUNCTION public.get_rate_limit_status IS 'Returns current rate limit status for debugging';
COMMENT ON FUNCTION public.cleanup_old_rate_limits IS 'Removes old rate limit records (should be run via cron)';
