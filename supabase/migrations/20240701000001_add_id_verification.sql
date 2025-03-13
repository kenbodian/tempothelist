-- Add ID verification fields to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS id_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS id_verification_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS id_image_path TEXT;

-- Create storage bucket for ID verification images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('id-verifications', 'id-verifications', false)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the id-verifications bucket
CREATE POLICY "Users can upload their own ID" 
ON storage.objects 
FOR INSERT 
TO authenticated 
USING (bucket_id = 'id-verifications' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Only admins can view IDs" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (bucket_id = 'id-verifications' AND auth.uid() IN (SELECT id FROM auth.users WHERE auth.uid() = id));

-- Add webhook_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  type TEXT NOT NULL,
  stripe_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  modified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data JSONB
);

-- Enable realtime for webhook_events
ALTER PUBLICATION supabase_realtime ADD TABLE webhook_events;
