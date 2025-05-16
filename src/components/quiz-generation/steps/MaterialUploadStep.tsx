
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, File, X, AlertCircle, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { FILE_LIMITS } from "@/utils/file-limits";
import { UploadStatus } from "@/components/file-upload/UploadStatus";

interface MaterialUploadStepProps {
  selectedFile: File | null;
  handleFileSelect: (file: File | null) => void;
  contentLength: number;
  isProcessing?: boolean;
  processingProgress?: number;
  processingError?: string | null;
  fileError?: string | null;
  isValidating?: boolean;
}

export const MaterialUploadStep = ({ 
  selectedFile, 
  handleFileSelect, 
  contentLength,
  isProcessing = false,
  processingProgress = 0,
  processingError = null,
  fileError = null,
  isValidating = false
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
    handleFileSelect(null);
  };

  const isContentWarning = contentLength > FILE_LIMITS.WARNING_THRESHOLD && contentLength <= FILE_LIMITS.MAX_CHARACTERS;
  const contentPercentage = Math.min(Math.round((contentLength / FILE_LIMITS.MAX_CHARACTERS) * 100), 100);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Course Material</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload your course material to generate questions from (max {(FILE_LIMITS.MAX_CHARACTERS).toLocaleString()} characters, approximately {FILE_LIMITS.estimateWords(FILE_LIMITS.MAX_CHARACTERS).toLocaleString()} words)
        </p>
      </div>

      {fileError && (
        <div className="mb-4">
          <div className="flex items-center p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
            <AlertCircle className="flex-shrink-0 w-4 h-4 mr-2" />
            <span className="font-medium">{fileError}</span>
          </div>
        </div>
      )}

      {!selectedFile ? (
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 md:p-8 transition-colors cursor-pointer",
            "hover:border-primary hover:bg-primary/5",
            "flex flex-col items-center justify-center text-center",
            isValidating ? "opacity-70 pointer-events-none" : ""
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => !isValidating && fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            className="hidden"
            accept=".pdf,.docx,.txt,.md"
            disabled={isValidating}
          />
          
          {isValidating ? (
            <>
              <Loader2 className="h-10 w-10 md:h-12 md:w-12 text-primary animate-spin mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Validating file...
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Please wait while we check your file
              </p>
            </>
          ) : (
            <>
              <UploadCloud className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Drop your file here or tap to browse
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Upload your lecture notes, textbook chapters, or any course material to generate relevant quiz questions
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Maximum file size: {FILE_LIMITS.MAX_FILE_SIZE_MB}MB
              </p>
              <Button className="mt-4 md:hidden">Browse Files</Button>
            </>
          )}
        </motion.div>
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
                  {FILE_LIMITS.formatFileSize(selectedFile.size)} · {selectedFile.type || 'Unknown type'}
                </p>
                {contentLength > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Content length: {contentLength.toLocaleString()} characters
                      </p>
                      <p className="text-xs text-gray-500">
                        {contentPercentage}%
                      </p>
                    </div>
                    <Progress 
                      value={contentPercentage} 
                      className="h-1.5" 
                      indicatorClassName={cn(
                        isContentWarning ? "bg-amber-500" : "bg-primary"
                      )} 
                    />
                    
                    {isContentWarning && (
                      <div className="flex items-center mt-2 text-amber-500 text-sm">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        <span>Large content may affect processing time</span>
                      </div>
                    )}
                  </div>
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
                disabled={isProcessing}
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
