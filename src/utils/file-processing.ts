
/**
 * Processes files in chunks to improve performance for large files
 */

export const processFileInChunks = async (file: File): Promise<string> => {
  const chunkSize = 1024 * 1024; // 1MB chunks
  const chunks = Math.ceil(file.size / chunkSize);
  
  let content = '';
  
  const readChunk = (chunkIndex: number): Promise<string> => {
    return new Promise((resolve) => {
      const chunk = file.slice(
        chunkIndex * chunkSize, 
        Math.min((chunkIndex + 1) * chunkSize, file.size)
      );
      
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string || '');
      };
      reader.readAsText(chunk);
    });
  };
  
  // Read chunks sequentially to avoid memory issues
  for (let i = 0; i < chunks; i++) {
    content += await readChunk(i);
    
    // Optional progress reporting
    const progress = Math.round(((i + 1) / chunks) * 100);
    console.log(`File processing: ${progress}%`);
  }
  
  return content;
};

export const getFileMetadata = (file: File) => {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified).toISOString(),
  };
};
