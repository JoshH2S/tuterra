
interface ProcessedContent {
  content: string;
  wasContentTrimmed: boolean;
  originalLength: number;
  fileId?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

import { supabase } from '@/integrations/supabase/client';

export const processFileContent = async (file: File): Promise<ProcessedContent> => {
  console.log('Processing file:', {
    name: file.name,
    type: file.type,
    size: file.size
  });

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 50MB limit');
  }

  try {
    // Upload file to storage first
    const filePath = `${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('textbooks')
      .upload(filePath, file);
      
    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }
    
    console.log('File uploaded successfully, processing with OpenAI...');
    
    // Process file using OpenAI
    const { data, error } = await supabase.functions.invoke('process-with-openai', {
      body: { filePath }
    });
    
    if (error) {
      console.error('OpenAI processing error:', error);
      throw new Error(`Failed to process file: ${error.message}`);
    }

    console.log('File processed with OpenAI:', data);

    return {
      content: "",  // Return empty content since we don't want to send a message yet
      wasContentTrimmed: false,
      originalLength: file.size,
      fileId: data.fileId  // Return the fileId for later use
    };
  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }
};
