-- Fix all function search paths using ALTER statement
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path TO 'public';
ALTER FUNCTION public.has_project_access(uuid, uuid) SET search_path TO 'public';
ALTER FUNCTION public.handle_new_user() SET search_path TO 'public';
ALTER FUNCTION public.handle_updated_at() SET search_path TO 'public';