
import { useState } from "react";
import { ProcessedFile } from "@/types/file";
import { CONTENT_LIMITS } from "@/types/quiz-generation";
import { toast } from "@/components/ui/use-toast";

export const useQuizFile = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contentLength, setContentLength] = useState<number>(0);

  const validateFile = async (file: File): Promise<string> => {
    if (file.size > CONTENT_LIMITS.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${CONTENT_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
    }

    const content = await file.text();
    if (content.length > CONTENT_LIMITS.MAX_CHARACTERS) {
      throw new Error(
        `Content length (${content.length.toLocaleString()} characters) exceeds the limit of ` +
        `${CONTENT_LIMITS.MAX_CHARACTERS.toLocaleString()} characters`
      );
    }

    return content;
  };

  const handleFileSelect = async (file: File) => {
    try {
      setSelectedFile(file);
      const content = await validateFile(file);
      setContentLength(content.length);
      
      if (content.length > CONTENT_LIMITS.WARNING_THRESHOLD) {
        toast({
          title: "Large file detected",
          description: `Your file is ${content.length.toLocaleString()} characters, which may affect processing time.`,
          variant: "default"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive"
      });
      setSelectedFile(null);
      setContentLength(0);
    }
  };

  const processFile = async (): Promise<ProcessedFile | null> => {
    if (!selectedFile) return null;
    
    try {
      const content = await validateFile(selectedFile);
      
      return {
        content,
        wasContentTrimmed: false,
        originalLength: content.length
      };
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    selectedFile,
    contentLength,
    handleFileSelect,
    processFile,
    validateFile
  };
};
