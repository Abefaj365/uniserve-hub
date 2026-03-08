
-- Drop existing student select policy and replace with one that lets students see ALL complaints
DROP POLICY IF EXISTS "Students can view own complaints" ON public.complaints;

CREATE POLICY "Students can view all complaints"
ON public.complaints
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'student'));

-- Also allow students to view any complaint's status history (not just their own)
DROP POLICY IF EXISTS "View complaint history" ON public.complaint_status_history;

CREATE POLICY "Anyone authenticated can view history"
ON public.complaint_status_history
FOR SELECT
TO authenticated
USING (true);

-- Allow students to view attachments on any complaint
DROP POLICY IF EXISTS "Users can view attachments" ON public.attachments;

CREATE POLICY "Authenticated can view attachments"
ON public.attachments
FOR SELECT
TO authenticated
USING (true);
