
-- Allow unauthenticated users to view departments (needed for registration page)
CREATE POLICY "Anyone can view departments"
ON public.departments
FOR SELECT
TO anon
USING (true);
