export const processFileContent = async (file: File) => {
  try {
    // First read the file as an ArrayBuffer to handle binary data properly
    const buffer = await file.arrayBuffer();
    const decoder = new TextDecoder('utf-8');
    let content = decoder.decode(buffer);
    
    // More thorough sanitization of problematic characters
    const sanitizedContent = content
      .replace(/\u0000/g, '') // Remove null bytes
      .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '') // Remove control characters
      .replace(/^\uFEFF/, '') // Remove BOM
      .replace(/[^\x20-\x7E\x0A\x0D\u00A0-\uFFFF]/g, ''); // Keep only printable characters
    
    // Check if content was significantly altered during sanitization
    const contentDifference = Math.abs(content.length - sanitizedContent.length);
    const contentChangeThreshold = content.length * 0.1; // 10% threshold
    
    if (contentDifference > contentChangeThreshold) {
      throw new Error('File contains too many invalid characters and could not be processed safely.');
    }
    
    return {
      content: sanitizedContent,
      wasContentTrimmed: content.length !== sanitizedContent.length,
      originalLength: content.length
    };
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error('Failed to process file content: ' + (error.message || 'Unknown error'));
  }
};