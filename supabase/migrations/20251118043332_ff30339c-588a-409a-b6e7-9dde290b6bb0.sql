-- Make pearsonperformance@gmail.com a root admin
-- Insert admin role for the specific user
INSERT INTO public.user_roles (user_id, role)
VALUES ('c50a4906-2cae-4c00-8a5b-0876e8d809b7', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Ensure the user has a profile
INSERT INTO public.profiles (id, email, full_name)
VALUES (
  'c50a4906-2cae-4c00-8a5b-0876e8d809b7',
  'pearsonperformance@gmail.com',
  'Root Admin'
)
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;