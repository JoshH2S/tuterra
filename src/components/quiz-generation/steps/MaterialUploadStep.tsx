
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, File, X, AlertCircle, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface MaterialUploadStepProps {
  selectedFile: File | null;
  handleFileSelect: (file: File) => void;
  contentLength: number;
  isProcessing?: boolean;
  processingProgress?: number;
  processingError?: string | null;
  isOptional?: boolean;
}

export const MaterialUploadStep = ({ 
  selectedFile, 
  handleFileSelect, 
  contentLength,
  isProcessing = false,
  processingProgress = 0,
  processingError = null,
  isOptional = false
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
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold mb-2">Course Material</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Upload your course material to generate questions from
          </p>
        </div>
        
        {isOptional && (
          <Badge variant="outline" className="self-start sm:self-center bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
            Optional
          </Badge>
        )}
      </div>

      {!selectedFile ? (
        <div className="space-y-4">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className={cn(
              "border-2 border-dashed rounded-xl p-6 md:p-8 transition-colors cursor-pointer",
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
            <UploadCloud className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Drop your file here or tap to browse
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Upload your lecture notes, textbook chapters, or any course material to generate relevant quiz questions
            </p>
            <Button className="mt-4 md:hidden">Browse Files</Button>
          </motion.div>
          
          {isOptional && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
              <FileCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-300">Material upload is optional</h4>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  If you skip this step, your quiz will be based only on the topics you specify in the next step. 
                  For more targeted and accurate questions, we recommend uploading course material.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 md:p-6 flex items-start space-x-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <File className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-lg truncate">{selectedFile.name}</h3>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · {selectedFile.type || 'Unknown type'}
                </p>
                {contentLength > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    Content length: {contentLength.toLocaleString()} characters
                  </p>
                )}
                
                {isProcessing && (
                  <div className="mt-3">
                    <Progress value={processingProgress} className="h-1.5" />
                    <p className="text-xs text-gray-500 mt-1">Processing file: {processingProgress}%</p>
                  </div>
                )}
                
                {processingError && (
                  <div className="flex items-center mt-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {processingError}
                  </div>
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
