-- Create storage bucket for ID verifications if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('id-verifications', 'id-verifications', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for authenticated users to upload their own IDs
CREATE POLICY "Users can upload their own IDs" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'id-verifications' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create storage policy for authenticated users to read their own IDs
CREATE POLICY "Users can view their own IDs" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (bucket_id = 'id-verifications' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Add ID verification fields to users table if they don't exist
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS id_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS id_verification_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS id_image_path text;
