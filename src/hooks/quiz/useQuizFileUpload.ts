
import { useState } from "react";
import { CONTENT_LIMITS } from "@/types/quiz-generation";

export const useQuizFileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contentLength, setContentLength] = useState<number>(0);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    const content = await file.text();
    setContentLength(Math.min(content.length, CONTENT_LIMITS.MAX_CHARACTERS));
  };

  return {
    selectedFile,
    contentLength,
    handleFileSelect,
  };
};
