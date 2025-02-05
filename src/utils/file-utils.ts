import { ProcessedFile } from "@/types/file";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

export const processFileContent = async (file: File): Promise<ProcessedFile> => {
  try {
    console.log('Processing file:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }

    // Handle different file types
    const fileType = file.type.toLowerCase();
    
    // For binary files, return empty content but preserve metadata
    if (fileType.includes('pdf') || 
        fileType.includes('msword') || 
        fileType.includes('officedocument')) {
      console.log('Binary file detected, skipping content processing');
      return {
        content: '',
        wasContentTrimmed: false,
        originalLength: file.size
      };
    }

    // For text files, read and process content with UTF-8 encoding
    console.log('Reading text file content...');
    const content = await readFileAsText(file);
    
    if (!content) {
      console.warn('File appears to be empty');
      throw new Error('Unable to read file content');
    }

    console.log('Original content length:', content.length);
    console.log('Sample of original content:', content.substring(0, 100));
    
    const sanitizedContent = sanitizeContent(content);
    
    console.log('Sanitized content length:', sanitizedContent.length);
    console.log('Sample of sanitized content:', sanitizedContent.substring(0, 100));
    
    if (!sanitizedContent) {
      throw new Error('File appears to be empty after processing');
    }

    const wasContentTrimmed = content.length !== sanitizedContent.length;
    if (wasContentTrimmed) {
      console.log('Content was trimmed during processing');
      console.log('Characters removed:', content.length - sanitizedContent.length);
    }

    return {
      content: sanitizedContent,
      wasContentTrimmed,
      originalLength: content.length
    };
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error(getErrorMessage(error));
  }
};

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, 'UTF-8'); // Explicitly specify UTF-8 encoding
  });
};

const sanitizeContent = (content: string): string => {
  let sanitized = content;
  
  // Remove problematic and hidden characters while preserving content
  sanitized = sanitized
    // Remove UTF-8 BOM
    .replace(/^\uFEFF/, '')
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove all C0 control characters (0x00-0x1F) except allowed whitespace
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    // Remove all C1 control characters (0x80-0x9F)
    .replace(/[\x80-\x9F]/g, '')
    // Remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Remove other problematic Unicode characters
    .replace(/[\u2028\u2029\uFFF9-\uFFFB]/g, '')
    .trim();

  // Preserve:
  // - Regular Unicode characters
  // - Whitespace (\n, \r, \t, space)
  // - Special characters
  // - Extended ASCII (printable)
  
  return sanitized;
};

const getErrorMessage = (error: any): string => {
  if (error.message.includes('exceeds')) {
    return `File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`;
  }
  if (error.message.includes('Unable to read')) {
    return 'Could not read file content. Please ensure the file is not corrupted.';
  }
  if (error.message.includes('empty after processing')) {
    return 'The file appears to be empty after processing. Please check the file content.';
  }
  return error.message || 'Failed to process file. Please try a different file or format.';
};