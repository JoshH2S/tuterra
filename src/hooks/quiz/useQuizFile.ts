
import { useState } from "react";
import { CONTENT_LIMITS } from "@/types/quiz-generation";

export const useQuizFile = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contentLength, setContentLength] = useState<number>(0);
  const [fileError, setFileError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    if (file.size > CONTENT_LIMITS.MAX_FILE_SIZE) {
      setFileError(`File too large. Maximum size is ${CONTENT_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB (approximately ${Math.round(CONTENT_LIMITS.MAX_CHARACTERS / 6)} words)`);
      return false;
    }
    setFileError(null);
    return true;
  };

  const handleFileSelect = async (file: File) => {
    if (!validateFile(file)) return;
    
    setSelectedFile(file);
    try {
      const content = await file.text();
      setContentLength(Math.min(content.length, CONTENT_LIMITS.MAX_CHARACTERS));
    } catch (error) {
      console.error("Error reading file:", error);
      setFileError("Error reading file. Please try again.");
    }
  };

  return {
    selectedFile,
    contentLength,
    fileError,
    handleFileSelect,
  };
};
