
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, Upload } from "lucide-react";
import { MAX_CONTENT_LENGTH } from "@/types/quiz-generation";

interface MaterialUploadStepProps {
  selectedFile: File | null;
  contentLength: number;
  handleFileSelect: (file: File) => void;
  isOptional?: boolean;
}

export const MaterialUploadStep = ({ 
  selectedFile, 
  contentLength, 
  handleFileSelect,
  isOptional = false,
}: MaterialUploadStepProps) => {
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const fileLabel = selectedFile ? selectedFile.name : "No file selected";
  const fileSizeInMB = selectedFile ? Math.round(selectedFile.size / (1024 * 1024) * 10) / 10 : 0;
  
  const fileTooLarge = contentLength > MAX_CONTENT_LENGTH;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Course Material Upload</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {isOptional 
            ? "Upload course material for more accurate questions (optional)" 
            : "Upload the course material you want to create a quiz for"}
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4 p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center">
            <FileUp className="h-10 w-10 text-gray-400" />
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">
                {isOptional ? "Upload Learning Material (Optional)" : "Upload Learning Material"}
              </h3>
              <p className="text-sm text-gray-500 max-w-md">
                Upload PDF, DOCX, or TXT files containing your course content.
                {isOptional && " If no file is uploaded, the quiz will be generated based on the topics alone."}
              </p>
            </div>
            
            <div>
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                className="relative"
              >
                <Upload className="w-4 h-4 mr-2" />
                Select File
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </Button>
            </div>
          </div>

          {selectedFile && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{fileLabel}</p>
                  <p className="text-sm text-gray-500">{fileSizeInMB} MB</p>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFileSelect(selectedFile)}
                >
                  Change
                </Button>
              </div>
              
              {fileTooLarge && (
                <p className="text-red-500 text-sm mt-2">
                  This file exceeds the maximum size limit. Only the first {MAX_CONTENT_LENGTH / 1024 / 1024}MB will be processed.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
