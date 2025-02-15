
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

import { extractRelevantContent } from './content-processor';
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
    let content: string;
    
    if (file.type === 'application/pdf') {
      console.log('Processing PDF file');
      
      // Upload PDF to storage first
      const filePath = `${crypto.randomUUID()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('tutor_files')
        .upload(filePath, file);
        
      if (uploadError) {
        throw new Error(`Failed to upload PDF: ${uploadError.message}`);
      }
      
      // Process PDF using the Edge Function
      const { data, error } = await supabase.functions.invoke('process-pdf', {
        body: { filePath }
      });
      
      if (error) {
        throw new Error(`Failed to process PDF: ${error.message}`);
      }
      
      content = data.text;
    } else {
      console.log('Processing text file');
      const rawContent = await readTextFile(file);
      content = sanitizeContent(rawContent);
    }
    
    // Extract relevant content using the utility
    const { sections, keyTerms, totalLength } = extractRelevantContent(content);
    
    // Combine sections and key terms into a structured format
    const processedContent = sections.map(section => 
      `${section.title}\n${section.content}`
    ).join('\n\n') + '\n\nKey Terms:\n' + keyTerms.join('\n');
    
    console.log('Content processed:', {
      originalLength: content.length,
      processedLength: processedContent.length,
      sections: sections.length,
      keyTerms: keyTerms.length
    });

    if (!processedContent) {
      throw new Error('File appears to be empty');
    }

    const wasContentTrimmed = processedContent.length < content.length;

    return {
      content: processedContent,
      wasContentTrimmed,
      originalLength: content.length
    };
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error(`Failed to process file: ${error.message}`);
  }
};
