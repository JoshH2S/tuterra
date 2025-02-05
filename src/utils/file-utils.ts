import { FileType, ProcessedFile } from "@/types/file";

export const processFileContent = async (file: File) => {
  try {
    const content = await file.text();
    
    if (!content) {
      throw new Error('Unable to read file content');
    }

    // Sanitize content
    const sanitizedContent = sanitizeContent(content);
    
    if (!sanitizedContent) {
      throw new Error('File appears to be empty after processing');
    }

    const wasContentTrimmed = content.length !== sanitizedContent.length;
    
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
  
  // Basic sanitization for all file types
  sanitized = sanitized
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Remove control characters
    .replace(/^\uFEFF/, '') // Remove BOM if present
    .replace(/[^\x20-\x7E\n\r]/g, '') // Keep only printable ASCII chars and newlines
    .trim();

  return sanitized;
};

const getErrorMessage = (error: any): string => {
  if (error.message.includes('Unsupported file type')) {
    return 'This file type is not supported. Please upload a PDF, Word document, or text file.';
  }
  if (error.message.includes('null character')) {
    return 'The file contains invalid characters. Please ensure your file is properly formatted.';
  }
  return error.message || 'Failed to process file. Please try a different file or format.';
};