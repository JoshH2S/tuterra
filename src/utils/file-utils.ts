export const processFileContent = async (file: File) => {
  try {
    const content = await file.text();
    // Remove null bytes and other problematic Unicode characters
    const sanitizedContent = content
      .replace(/\u0000/g, '') // Remove null bytes
      .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, ''); // Remove control characters
    
    return {
      content: sanitizedContent,
      wasContentTrimmed: false,
      originalLength: content.length
    };
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error('Failed to process file content');
  }
};