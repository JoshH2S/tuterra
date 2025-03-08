
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, File, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MaterialUploadStepProps {
  selectedFile: File | null;
  handleFileSelect: (file: File) => void;
  contentLength: number;
}

export const MaterialUploadStep = ({ 
  selectedFile, 
  handleFileSelect, 
  contentLength 
}: MaterialUploadStepProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemoveFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Create a null setter for selectedFile
    handleFileSelect(null as unknown as File);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Course Material</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload your course material to generate questions from
        </p>
      </div>

      {!selectedFile ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-xl p-8 transition-colors cursor-pointer",
            "hover:border-primary hover:bg-primary/5",
            "flex flex-col items-center justify-center text-center"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            className="hidden"
            accept=".pdf,.docx,.txt,.md"
          />
          <UploadCloud className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">
            Drop your file here or click to browse
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Upload your lecture notes, textbook chapters, or any course material to generate relevant quiz questions
          </p>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6 flex items-start space-x-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <File className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-lg truncate">{selectedFile.name}</h3>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · {selectedFile.type || 'Unknown type'}
                </p>
                {contentLength > 0 && (
                  <p className="text-sm text-gray-600">
                    Content length: {contentLength.toLocaleString()} characters
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
