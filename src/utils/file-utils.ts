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

    // For text files, read and process content
    console.log('Reading text file content...');
    const content = await file.text();
    
    if (!content) {
      console.warn('File appears to be empty');
      throw new Error('Unable to read file content');
    }

    console.log('Original content length:', content.length);
    const sanitizedContent = sanitizeContent(content);
    console.log('Sanitized content length:', sanitizedContent.length);
    
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

const sanitizeContent = (content: string): string => {
  let sanitized = content;
  
  // Remove only problematic characters while preserving content
  sanitized = sanitized
    .replace(/\0/g, '') // Remove null bytes
    .replace(/^\uFEFF/, '') // Remove BOM if present
    // Only remove control characters that could cause issues
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();

  // Preserve all other characters including:
  // - Unicode characters
  // - Special characters
  // - Line breaks and formatting
  // - Extended ASCII
  
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