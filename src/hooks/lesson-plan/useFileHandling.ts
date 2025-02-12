
import { useState } from "react";

export const MAX_CONTENT_LENGTH = 50 * 1024 * 1024; // 50MB

export const useFileHandling = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contentLength, setContentLength] = useState<number>(0);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    const content = await file.text();
    setContentLength(content.length);
  };

  const processFile = async () => {
    if (!selectedFile) return null;
    const fileContent = await selectedFile.text();
    return fileContent.slice(0, MAX_CONTENT_LENGTH);
  };

  return {
    selectedFile,
    contentLength,
    handleFileSelect,
    processFile,
  };
};
