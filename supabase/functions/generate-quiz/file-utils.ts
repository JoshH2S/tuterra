
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export async function storeTemporaryFile(
  file: File,
  supabaseUrl: string,
  supabaseServiceKey: string,
  userId: string
): Promise<string> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Sanitize filename and generate unique path
  const sanitizedFileName = file.name.replace(/[^\x00-\x7F]/g, '');
  const fileExt = sanitizedFileName.split('.').pop();
  const uniqueFilePath = `${crypto.randomUUID()}.${fileExt}`;

  // Upload file to temporary storage
  const { error: uploadError } = await supabase.storage
    .from('temp_quiz_files')
    .upload(uniqueFilePath, file);

  if (uploadError) {
    console.error('Error uploading temporary file:', uploadError);
    throw new Error('Failed to upload temporary file');
  }

  // Insert record in temp_files table
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // File expires in 1 hour

  const { error: dbError } = await supabase
    .from('temp_files')
    .insert({
      file_path: uniqueFilePath,
      user_id: userId,
      expires_at: expiresAt.toISOString(),
    });

  if (dbError) {
    console.error('Error storing temp file metadata:', dbError);
    throw new Error('Failed to store temporary file metadata');
  }

  // Get the file URL
  const { data: { publicUrl } } = supabase.storage
    .from('temp_quiz_files')
    .getPublicUrl(uniqueFilePath);

  return publicUrl;
}

export async function cleanupTemporaryFile(
  filePath: string,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<void> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Delete file from storage
  const { error: deleteError } = await supabase.storage
    .from('temp_quiz_files')
    .remove([filePath]);

  if (deleteError) {
    console.error('Error deleting temporary file:', deleteError);
  }

  // Update record in temp_files table
  const { error: updateError } = await supabase
    .from('temp_files')
    .update({ processed: true })
    .eq('file_path', filePath);

  if (updateError) {
    console.error('Error updating temp file record:', updateError);
  }
}

export async function processFileContent(file: File): Promise<string> {
  try {
    console.log('Processing file:', file.name, file.type);
    const content = await file.text();
    
    if (!content) {
      throw new Error('File appears to be empty');
    }

    // Basic sanitization
    const sanitizedContent = content
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .trim();

    console.log('File processed successfully:', {
      originalSize: content.length,
      processedSize: sanitizedContent.length
    });

    return sanitizedContent;
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error(`Failed to process file: ${error.message}`);
  }
}
