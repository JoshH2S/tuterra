export const processFileContent = async (file: File) => {
  try {
    // First read the file as text to handle encoding properly
    const text = await file.text();
    
    // Remove null bytes and other problematic characters
    const sanitizedContent = text
      .replace(/\0/g, '') // Remove null bytes
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Remove control characters
      .replace(/^\uFEFF/, '') // Remove BOM if present
      .trim(); // Remove leading/trailing whitespace
    
    // Check if the content is empty after sanitization
    if (!sanitizedContent || sanitizedContent.length === 0) {
      throw new Error('File appears to be empty after processing');
    }

    // Calculate how much content was removed during sanitization
    const contentDifference = Math.abs(text.length - sanitizedContent.length);
    const contentChangeThreshold = text.length * 0.1; // 10% threshold
    
    // If too much content was removed during sanitization, warn the user
    const wasContentTrimmed = contentDifference > 0;
    
    if (contentDifference > contentChangeThreshold) {
      throw new Error('File contains too many invalid characters. Please ensure your file is a valid text document.');
    }
    
    return {
      content: sanitizedContent,
      wasContentTrimmed,
      originalLength: text.length
    };
  } catch (error) {
    if (error.message.includes('null character')) {
      throw new Error('The file contains invalid characters. Please ensure your file is a valid text document.');
    }
    console.error('Error processing file:', error);
    throw new Error('Failed to process file: ' + error.message);
  }
};