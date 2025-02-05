import { ProcessedFile } from "@/types/file";

export const processFileContent = async (file: File): Promise<ProcessedFile> => {
  try {
    // Handle different file types
    const fileType = file.type.toLowerCase();
    
    // For binary files (PDF, DOC, etc.), just validate the file
    if (fileType.includes('pdf') || 
        fileType.includes('msword') || 
        fileType.includes('officedocument')) {
      return {
        content: '', // Binary content will be handled separately
        wasContentTrimmed: false,
        originalLength: file.size
      };
    }

    // For text files, read and sanitize content
    const content = await file.text();
    
    if (!content) {
      throw new Error('Unable to read file content');
    }

    const sanitizedContent = sanitizeContent(content);
    
    if (!sanitizedContent) {
      throw new Error('File appears to be empty after processing');
    }

    return {
      content: sanitizedContent,
      wasContentTrimmed: content.length !== sanitizedContent.length,
      originalLength: content.length
    };
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error(getErrorMessage(error));
  }
};

const sanitizeContent = (content: string): string => {
  let sanitized = content;
  
  // Only remove truly problematic characters while preserving formatting
  sanitized = sanitized
    .replace(/\0/g, '') // Remove null bytes
    .replace(/^\uFEFF/, '') // Remove BOM if present
    // Preserve more Unicode characters, only remove control chars
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
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