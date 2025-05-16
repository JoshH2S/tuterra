
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { FILE_LIMITS } from "@/utils/file-limits";

export interface FileValidationResult {
  isValid: boolean;
  message?: string;
  contentLength?: number;
  isWarning?: boolean;
}

export const useQuizFileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contentLength, setContentLength] = useState<number>(0);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const validateFileSize = (file: File): FileValidationResult => {
    if (file.size > FILE_LIMITS.MAX_FILE_SIZE) {
      return {
        isValid: false,
        message: `File too large. Maximum size is ${FILE_LIMITS.MAX_FILE_SIZE_MB}MB (approximately ${FILE_LIMITS.estimateWords(FILE_LIMITS.MAX_CHARACTERS)} words)`,
      };
    }
    return { isValid: true };
  };

  const validateFileContent = async (file: File): Promise<FileValidationResult> => {
    try {
      const content = await file.text();
      const length = content.length;
      
      // Hard limit check
      if (length > FILE_LIMITS.MAX_CHARACTERS) {
        return {
          isValid: false,
          message: `Content exceeds the ${FILE_LIMITS.MAX_CHARACTERS.toLocaleString()} character limit (approximately ${FILE_LIMITS.estimateWords(FILE_LIMITS.MAX_CHARACTERS).toLocaleString()} words)`,
          contentLength: length,
        };
      }
      
      // Warning threshold check
      if (length > FILE_LIMITS.WARNING_THRESHOLD) {
        return {
          isValid: true,
          isWarning: true,
          message: `Large content (${length.toLocaleString()} characters) may affect processing time`,
          contentLength: length,
        };
      }
      
      return {
        isValid: true,
        contentLength: length
      };
    } catch (error) {
      console.error("Error reading file:", error);
      return {
        isValid: false,
        message: "Error reading file content. Please try another file.",
      };
    }
  };

  const handleFileSelect = async (file: File | null) => {
    // Clear previous state
    setFileError(null);
    
    if (!file) {
      setSelectedFile(null);
      setContentLength(0);
      return;
    }

    setIsValidating(true);
    
    try {
      // First validate file size
      const sizeValidation = validateFileSize(file);
      if (!sizeValidation.isValid) {
        setFileError(sizeValidation.message || "Invalid file size");
        setIsValidating(false);
        toast({
          title: "Invalid file",
          description: sizeValidation.message,
          variant: "destructive",
        });
        return;
      }
      
      // Then validate content
      const contentValidation = await validateFileContent(file);
      
      if (!contentValidation.isValid) {
        setFileError(contentValidation.message || "Invalid file content");
        setIsValidating(false);
        toast({
          title: "Invalid file",
          description: contentValidation.message,
          variant: "destructive",
        });
        return;
      }
      
      // Set file and content length
      setSelectedFile(file);
      if (contentValidation.contentLength) {
        setContentLength(contentValidation.contentLength);
      }
      
      // Show warning if needed
      if (contentValidation.isWarning && contentValidation.message) {
        toast({
          title: "Warning",
          description: contentValidation.message,
          variant: "warning",
        });
      }
    } catch (error) {
      console.error("Error processing file:", error);
      setFileError("Error processing file. Please try again.");
      toast({
        title: "Error",
        description: "Failed to process file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setContentLength(0);
    setFileError(null);
  };

  return {
    selectedFile,
    contentLength,
    fileError,
    isValidating,
    handleFileSelect,
    clearFile,
  };
};
