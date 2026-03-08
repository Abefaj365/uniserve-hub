-- Create notifications table for admin alerts
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_role app_role NOT NULL DEFAULT 'admin',
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Admins can view all notifications
CREATE POLICY "Admins can view notifications"
  ON public.notifications FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update (mark as read)
CREATE POLICY "Admins can update notifications"
  ON public.notifications FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow trigger to insert (security definer function)
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger function: auto-create notification when a pending profile is inserted
CREATE OR REPLACE FUNCTION public.notify_admin_on_pending_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  role_val text;
BEGIN
  IF NEW.approval_status = 'pending' THEN
    SELECT role INTO role_val FROM public.user_roles WHERE user_id = NEW.user_id LIMIT 1;
    
    INSERT INTO public.notifications (recipient_role, title, message, link)
    VALUES (
      'admin',
      'New Registration Pending',
      COALESCE(NEW.full_name, 'A user') || ' (' || COALESCE(role_val, 'unknown') || ') has registered and is awaiting approval.',
      '/admin/approvals'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_pending_registration
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_pending_registration();