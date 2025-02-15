
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
  // Remove control characters except newlines and tabs
  return content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
};

import { extractRelevantContent } from './content-processor';

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
    console.log('Processing text file');
    const rawContent = await readTextFile(file);
    const content = sanitizeContent(rawContent);
    
    // Extract relevant content using the utility
    const { sections, keyTerms, totalLength } = extractRelevantContent(content);
    
    // Combine sections and key terms into a structured format
    const processedContent = sections.map(section => 
      `${section.title}\n${section.content}`
    ).join('\n\n') + '\n\nKey Terms:\n' + keyTerms.join('\n');
    
    console.log('Content processed:', {
      originalLength: rawContent.length,
      processedLength: processedContent.length,
      sections: sections.length,
      keyTerms: keyTerms.length
    });

    if (!processedContent) {
      throw new Error('File appears to be empty');
    }

    const wasContentTrimmed = processedContent.length < rawContent.length;

    return {
      content: processedContent,
      wasContentTrimmed,
      originalLength: rawContent.length
    };
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error(`Failed to process file: ${error.message}`);
  }
};
