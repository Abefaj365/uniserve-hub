
-- Add approval_status to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending';

-- Auto-approve non-student registrations by updating the handle_new_user function
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
    CASE WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'student' THEN 'pending' ELSE 'approved' END
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student'));
  RETURN NEW;
END;
$function$;

-- Update complaint ID generation to use student ID
CREATE OR REPLACE FUNCTION public.generate_complaint_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  student_id_val text;
  complaint_count integer;
BEGIN
  -- Get the student_id_number from the insert
  student_id_val := NEW.student_id_number;
  
  IF student_id_val IS NOT NULL AND student_id_val != '' THEN
    -- Count existing complaints by this student
    SELECT COUNT(*) + 1 INTO complaint_count
    FROM public.complaints
    WHERE student_id_number = student_id_val;
    
    NEW.complaint_id := student_id_val || '-CMP-' || LPAD(complaint_count::TEXT, 3, '0');
  ELSE
    NEW.complaint_id := 'CMP-' || LPAD(nextval('public.complaint_seq')::TEXT, 3, '0');
  END IF;
  
  RETURN NEW;
END;
$function$;
