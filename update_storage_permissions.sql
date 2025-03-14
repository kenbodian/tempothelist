-- First, let's ensure the bucket exists
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
  VALUES (
    'pilot-ids',
    'pilot-ids',
    true,  -- Making it public
    false,
    5242880, -- 5MB size limit
    ARRAY['image/jpeg', 'image/png', 'image/jpg']::text[]
  )
  ON CONFLICT (id) DO UPDATE
  SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/jpg']::text[];
END
$$;

-- Now, let's ensure the storage policies allow public access to view files
-- First, remove any existing policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- Create a policy to allow public read access to all files in pilot-ids bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'pilot-ids');

-- Create a policy for authenticated users to upload files to pilot-ids bucket
DROP POLICY IF EXISTS "Authenticated Users can upload" ON storage.objects;
CREATE POLICY "Authenticated Users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pilot-ids');

-- Allow authenticated users to update and delete their own files
DROP POLICY IF EXISTS "Authenticated Users can update own files" ON storage.objects;
CREATE POLICY "Authenticated Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'pilot-ids' AND (owner = auth.uid()));

DROP POLICY IF EXISTS "Authenticated Users can delete own files" ON storage.objects;
CREATE POLICY "Authenticated Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'pilot-ids' AND (owner = auth.uid())); 