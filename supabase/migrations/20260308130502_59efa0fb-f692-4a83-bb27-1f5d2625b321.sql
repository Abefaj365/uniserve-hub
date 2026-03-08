
-- Fix search_path on generate_complaint_id
CREATE OR REPLACE FUNCTION public.generate_complaint_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.complaint_id := 'CMP-' || LPAD(nextval('public.complaint_seq')::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Storage bucket for attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('complaint-attachments', 'complaint-attachments', true);
CREATE POLICY "Authenticated users can upload attachments" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'complaint-attachments');
CREATE POLICY "Anyone can view complaint attachments" ON storage.objects FOR SELECT
  USING (bucket_id = 'complaint-attachments');
