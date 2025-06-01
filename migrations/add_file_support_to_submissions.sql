-- Add file support columns to internship_task_submissions table
ALTER TABLE internship_task_submissions
ADD COLUMN file_url TEXT,
ADD COLUMN file_name TEXT,
ADD COLUMN file_type TEXT,
ADD COLUMN file_size BIGINT,
ADD COLUMN content_type TEXT CHECK (content_type IN ('text', 'file', 'both'));

-- Create storage bucket for task submissions if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('user-uploads', 'user-uploads')
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the user-uploads bucket
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-uploads');

CREATE POLICY "Allow authenticated users to read their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'user-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Add RLS policies for the new columns
ALTER TABLE internship_task_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own submissions"
ON internship_task_submissions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own submissions"
ON internship_task_submissions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid()); 