
-- Create submissions table for asset assignment form
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_name TEXT NOT NULL,
  employee_email TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  department TEXT NOT NULL,
  designation TEXT NOT NULL,
  selected_assets TEXT[] NOT NULL DEFAULT '{}',
  asset_details JSONB NOT NULL DEFAULT '{}',
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  confirmed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Public can insert (form submissions)
CREATE POLICY "Anyone can submit asset form"
ON public.submissions
FOR INSERT
WITH CHECK (true);

-- Only authenticated users (admins) can read
CREATE POLICY "Authenticated users can view submissions"
ON public.submissions
FOR SELECT
USING (auth.role() = 'authenticated');

-- Only authenticated users can delete
CREATE POLICY "Authenticated users can delete submissions"
ON public.submissions
FOR DELETE
USING (auth.role() = 'authenticated');

-- Create storage bucket for asset images
INSERT INTO storage.buckets (id, name, public) VALUES ('asset-images', 'asset-images', true);

-- Anyone can upload to asset-images bucket
CREATE POLICY "Anyone can upload asset images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'asset-images');

-- Anyone can view asset images (public bucket)
CREATE POLICY "Anyone can view asset images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'asset-images');

-- Authenticated users can delete asset images
CREATE POLICY "Authenticated users can delete asset images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'asset-images' AND auth.role() = 'authenticated');

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_submissions_updated_at
BEFORE UPDATE ON public.submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
