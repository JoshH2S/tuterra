
import { useState } from "react";
import { CONTENT_LIMITS } from "@/types/quiz-generation";
import { processFileInChunks, getFileMetadata } from "@/utils/file-processing";

interface FileProcessingState {
  isProcessing: boolean;
  progress: number;
  error: string | null;
}

export const useQuizFileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contentLength, setContentLength] = useState<number>(0);
  const [processingState, setProcessingState] = useState<FileProcessingState>({
    isProcessing: false,
    progress: 0,
    error: null
  });

  const handleFileSelect = async (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setContentLength(0);
      setProcessingState({
        isProcessing: false,
        progress: 0,
        error: null
      });
      return;
    }
    
    try {
      setProcessingState({
        isProcessing: true,
        progress: 0,
        error: null
      });
      
      setSelectedFile(file);
      
      // Process in chunks for better performance
      const content = await processFileInChunks(file);
      
      // Track content length within limits
      setContentLength(Math.min(content.length, CONTENT_LIMITS.MAX_CHARACTERS));
      
      setProcessingState({
        isProcessing: false,
        progress: 100,
        error: null
      });
    } catch (error) {
      console.error("Error processing file:", error);
      setProcessingState({
        isProcessing: false,
        progress: 0,
        error: error instanceof Error ? error.message : "Failed to process file"
      });
    }
  };

  // Add the missing processFile method
  const processFile = async () => {
    if (!selectedFile) {
      return null;
    }
    
    try {
      const content = await processFileInChunks(selectedFile);
      
      return {
        content,
        wasContentTrimmed: content.length > CONTENT_LIMITS.MAX_CHARACTERS,
        originalLength: content.length
      };
    } catch (error) {
      console.error("Error processing file:", error);
      setProcessingState({
        isProcessing: false,
        progress: 0,
        error: error instanceof Error ? error.message : "Failed to process file"
      });
      return null;
    }
  };

  return {
    selectedFile,
    contentLength,
    handleFileSelect,
    fileMetadata: selectedFile ? getFileMetadata(selectedFile) : null,
    isProcessing: processingState.isProcessing,
    processingProgress: processingState.progress,
    processingError: processingState.error,
    processFile // Export the new method
  };
};
