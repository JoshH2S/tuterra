import { FileType } from "@/types/file";

export const processFileContent = async (file: File) => {
  try {
    // Determine file type from extension
    const fileType = getFileType(file.name);
    
    // Read file content based on type
    const content = await readFileContent(file, fileType);
    
    if (!content) {
      throw new Error('Unable to read file content');
    }

    // Sanitize content based on file type
    const sanitizedContent = sanitizeContent(content, fileType);
    
    if (!sanitizedContent) {
      throw new Error('File appears to be empty after processing');
    }

    const wasContentTrimmed = content.length !== sanitizedContent.length;
    
    return {
      content: sanitizedContent,
      wasContentTrimmed,
      originalLength: content.length,
      fileType
    };
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error(getErrorMessage(error));
  }
};

const getFileType = (fileName: string): FileType => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return 'pdf';
    case 'doc':
    case 'docx':
      return 'word';
    case 'txt':
      return 'text';
    default:
      throw new Error('Unsupported file type');
  }
};

const readFileContent = async (file: File, fileType: FileType): Promise<string> => {
  // For now, we'll use basic text reading
  // In a production environment, you'd want to use specific parsers for each file type
  return await file.text();
};

const sanitizeContent = (content: string, fileType: FileType): string => {
  let sanitized = content;
  
  // Basic sanitization for all file types
  sanitized = sanitized
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Remove control characters
    .replace(/^\uFEFF/, ''); // Remove BOM if present

  // Additional sanitization based on file type
  switch (fileType) {
    case 'text':
      // For text files, we can be more aggressive with cleaning
      sanitized = sanitized
        .replace(/[^\x20-\x7E\n\r]/g, '') // Keep only printable ASCII chars and newlines
        .trim();
      break;
    case 'pdf':
    case 'word':
      // For PDFs and Word docs, we need to be more lenient with special characters
      sanitized = sanitized
        .replace(/[\u2028\u2029]/g, '\n') // Replace line separators with newlines
        .trim();
      break;
  }

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