
interface ProcessedContent {
  content: string;
  wasContentTrimmed: boolean;
  originalLength: number;
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
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }
    
    // Process file using OpenAI
    const { data, error } = await supabase.functions.invoke('process-with-openai', {
      body: { filePath }
    });
    
    if (error) {
      throw new Error(`Failed to process file: ${error.message}`);
    }

    console.log('File processed with OpenAI:', data);

    return {
      content: `File uploaded successfully. OpenAI File ID: ${data.fileId}`,
      wasContentTrimmed: false,
      originalLength: file.size
    };
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error(`Failed to process file: ${error.message}`);
  }
};
