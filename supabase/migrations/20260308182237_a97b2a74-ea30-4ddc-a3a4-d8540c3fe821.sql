
CREATE OR REPLACE FUNCTION public.notify_student_on_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.notifications (recipient_role, title, message, link)
    VALUES (
      'student',
      'Complaint Status Updated',
      'Your complaint "' || NEW.title || '" has been updated to ' || NEW.status || '.',
      '/student/complaints'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_complaint_status_change
AFTER UPDATE ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION public.notify_student_on_status_change();
