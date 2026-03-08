
-- Update handle_new_user to require approval for ALL roles except the seeded admin email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, student_id, employee_id, department, approval_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'student_id',
    NEW.raw_user_meta_data->>'employee_id',
    NEW.raw_user_meta_data->>'department',
    CASE WHEN NEW.email = 'admin@bgctub.ac.bd' THEN 'approved' ELSE 'pending' END
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student'));
  RETURN NEW;
END;
$function$;

-- Add RLS policy for admins to update profiles (for approvals)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update all profiles' AND tablename = 'profiles'
  ) THEN
    CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;
