-- Fix search path issue by being more explicit
DROP TRIGGER IF EXISTS create_environments_on_project_creation ON public.projects;
DROP FUNCTION IF EXISTS public.create_default_environments();

-- Recreate function with proper security
CREATE OR REPLACE FUNCTION public.create_default_environments()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create three default environments
  INSERT INTO public.environments (project_id, name)
  VALUES 
    (NEW.id, 'development'),
    (NEW.id, 'staging'),
    (NEW.id, 'production');
  
  RETURN NEW;
END;
$$;

-- Set search path explicitly after creation
ALTER FUNCTION public.create_default_environments() SET search_path TO 'public';

-- Recreate trigger
CREATE TRIGGER create_environments_on_project_creation
  AFTER INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_environments();