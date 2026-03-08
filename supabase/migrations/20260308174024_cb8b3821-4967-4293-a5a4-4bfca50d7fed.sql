-- Allow admins to delete profiles and user_roles
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete user_roles"
  ON public.user_roles FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));