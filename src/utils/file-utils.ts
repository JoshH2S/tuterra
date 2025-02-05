interface ProcessedContent {
  content: string;
  wasContentTrimmed: boolean;
  originalLength: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const readBinaryFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        // Convert ArrayBuffer to Base64 string
        const bytes = new Uint8Array(reader.result);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        resolve(btoa(binary));
      } else {
        reject(new Error('Failed to read binary file'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
};

const readTextFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read text file'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, 'UTF-8');
  });
};

const sanitizeContent = (content: string): string => {
  // Remove control characters except newlines and tabs
  return content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
};

export const processFileContent = async (file: File): Promise<ProcessedContent> => {
  console.log('Processing file:', {
    name: file.name,
    type: file.type,
    size: file.size
  });

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 10MB limit');
  }

  let content: string;
  const originalLength = file.size;

  try {
    if (file.type === 'application/pdf') {
      console.log('Processing PDF file');
      content = await readBinaryFile(file);
    } else {
      console.log('Processing text file');
      const rawContent = await readTextFile(file);
      content = sanitizeContent(rawContent);
      console.log('Content length after sanitization:', content.length);
    }

    if (!content) {
      throw new Error('File appears to be empty');
    }

    const wasContentTrimmed = content.length < originalLength;

    return {
      content,
      wasContentTrimmed,
      originalLength
    };
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error(`Failed to process file: ${error.message}`);
  }
};