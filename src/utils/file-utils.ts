export const MAX_CONTENT_LENGTH = 5000;

export const processFileContent = async (file: File) => {
  try {
    const content = await file.text();
    const trimmedContent = content.slice(0, MAX_CONTENT_LENGTH);
    
    return {
      content: trimmedContent,
      wasContentTrimmed: content.length > MAX_CONTENT_LENGTH,
      originalLength: content.length
    };
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error('Failed to process file content');
  }
};