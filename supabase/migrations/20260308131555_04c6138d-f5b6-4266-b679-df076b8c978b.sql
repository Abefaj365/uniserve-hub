
-- Add employee_id column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS employee_id text;

-- Update handle_new_user to also save student_id, department, and employee_id from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, student_id, employee_id, department)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'student_id',
    NEW.raw_user_meta_data->>'employee_id',
    NEW.raw_user_meta_data->>'department'
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student'));
  RETURN NEW;
END;
$function$;
