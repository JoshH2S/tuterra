export const processFileContent = async (file: File) => {
  try {
    const content = await file.text();
    return {
      content,
      wasContentTrimmed: false,
      originalLength: content.length
    };
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error('Failed to process file content');
  }
};