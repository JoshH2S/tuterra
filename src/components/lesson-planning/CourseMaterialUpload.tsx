import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FileUpload from "@/components/FileUpload";
import { toast } from "@/components/ui/use-toast";
import { processFileContent } from "@/utils/file-utils";
import { UploadStatus } from "./UploadStatus";

interface CourseMaterialUploadProps {
  onFileSelect: (file: File) => void;
  contentLength: number;
}

export const CourseMaterialUpload = ({ onFileSelect, contentLength }: CourseMaterialUploadProps) => {
  const [uploadStatus, setUploadStatus] = useState<{
    fileName?: string;
    error?: string;
  }>({});

  const handleFileSelect = async (file: File) => {
    try {
      const { content, wasContentTrimmed, originalLength } = await processFileContent(file);
      
      if (wasContentTrimmed) {
        toast({
          title: "Content will be trimmed",
          description: `Your file content (${originalLength} characters) exceeds the limit of ${contentLength} characters. Only the first ${contentLength} characters will be processed.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "File selected",
          description: `${file.name} has been selected for lesson planning.`,
        });
      }
      
      setUploadStatus({ fileName: file.name });
      onFileSelect(file);
    } catch (error) {
      setUploadStatus({ error: "Error processing file. Please try again." });
      toast({
        title: "Error",
        description: "Failed to process file. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Material</CardTitle>
        <CardDescription>Upload a new file or select from existing courses</CardDescription>
      </CardHeader>
      <CardContent>
        <FileUpload
          onFileSelect={handleFileSelect}
          acceptedTypes=".pdf,.doc,.docx,.txt"
        />
        {(uploadStatus.fileName || uploadStatus.error) && (
          <UploadStatus 
            fileName={uploadStatus.fileName || ''} 
            error={uploadStatus.error}
          />
        )}
      </CardContent>
    </Card>
  );
};