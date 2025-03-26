
import { useState } from "react";
import { ProcessedFile } from "@/types/file";

export const MAX_CONTENT_LENGTH = 50 * 1024 * 1024; // 50MB

export const useQuizFile = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contentLength, setContentLength] = useState<number>(0);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    const content = await file.text();
    setContentLength(content.length);
  };

  const processFile = async (): Promise<ProcessedFile | null> => {
    if (!selectedFile) return null;
    
    const fileContent = await selectedFile.text();
    const trimmedContent = fileContent.slice(0, MAX_CONTENT_LENGTH);
    
    return {
      content: trimmedContent,
      wasContentTrimmed: fileContent.length > MAX_CONTENT_LENGTH,
      originalLength: fileContent.length
    };
  };

  return {
    selectedFile,
    contentLength,
    handleFileSelect,
    processFile,
  };
};
