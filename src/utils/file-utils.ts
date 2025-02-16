
interface ProcessedContent {
  content: string;
  wasContentTrimmed: boolean;
  originalLength: number;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const readTextFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read text file'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, 'UTF-8');
  });
};

const sanitizeContent = (content: string): string => {
  // Normalize unicode characters and remove only truly problematic characters
  return content
    .normalize('NFKC')
    // Remove only control characters that could cause issues
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Replace smart quotes with regular quotes
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    // Replace other common special characters
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
};

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
      .from('tutor_files')
      .upload(filePath, file);
      
    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }
    
    // Process file using GPT
    const { data, error } = await supabase.functions.invoke('process-with-gpt', {
      body: { filePath }
    });
    
    if (error) {
      throw new Error(`Failed to process file with GPT: ${error.message}`);
    }
    
    console.log('Content processed with GPT:', {
      processedLength: data.content.length
    });

    if (!data.content) {
      throw new Error('Failed to extract content from file');
    }

    return {
      content: data.content,
      wasContentTrimmed: false,
      originalLength: file.size
    };
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error(`Failed to process file: ${error.message}`);
  }
};
