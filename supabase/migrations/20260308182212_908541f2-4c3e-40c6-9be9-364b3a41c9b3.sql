
-- Allow students to view notifications for their role
CREATE POLICY "Students can view notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), recipient_role));

-- Allow students/officers to mark their notifications as read
CREATE POLICY "Users can update own role notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), recipient_role));

-- Allow system inserts via security definer functions (already handled)
-- Allow authenticated users to insert notifications (for triggers/functions)
CREATE POLICY "Authenticated can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);
