-- Drop the overly permissive insert policy since the trigger uses SECURITY DEFINER
DROP POLICY "System can insert notifications" ON public.notifications;