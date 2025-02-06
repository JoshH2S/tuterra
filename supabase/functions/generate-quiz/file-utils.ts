
export async function processFileContent(file: File): Promise<string> {
  try {
    console.log('Processing file:', file.name, file.type);
    const content = await file.text();
    
    if (!content) {
      throw new Error('File appears to be empty');
    }

    // Basic sanitization
    const sanitizedContent = content
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .trim();

    console.log('File processed successfully:', {
      originalSize: content.length,
      processedSize: sanitizedContent.length
    });

    return sanitizedContent;
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error(`Failed to process file: ${error.message}`);
  }
}
