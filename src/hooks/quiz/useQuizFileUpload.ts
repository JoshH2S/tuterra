
import { useState } from "react";
import { MAX_CONTENT_LENGTH } from "@/types/quiz-generation";

export const useQuizFileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contentLength, setContentLength] = useState<number>(0);

  const handleFileSelect = async (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setContentLength(0);
      return;
    }
    
    setSelectedFile(file);
    const content = await file.text();
    setContentLength(Math.min(content.length, MAX_CONTENT_LENGTH));
  };

  return {
    selectedFile,
    contentLength,
    handleFileSelect,
  };
};
