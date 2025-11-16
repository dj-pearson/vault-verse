-- Create function to create default environments for new projects
CREATE OR REPLACE FUNCTION public.create_default_environments()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Create trigger to automatically create environments when a project is created
CREATE TRIGGER create_environments_on_project_creation
  AFTER INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_environments();