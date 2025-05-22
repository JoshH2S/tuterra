
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, File, X, AlertCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { CONTENT_LIMITS } from "@/types/quiz-generation";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useQuizLimits } from "@/hooks/quiz/useQuizLimits";

interface MaterialUploadStepProps {
  selectedFile: File | null;
  handleFileSelect: (file: File) => void;
  contentLength: number;
  isProcessing?: boolean;
  processingProgress?: number;
  processingError?: string | null;
  fileError?: string | null;
}

export const MaterialUploadStep = ({ 
  selectedFile, 
  handleFileSelect, 
  contentLength,
  isProcessing = false,
  processingProgress = 0,
  processingError = null,
  fileError = null
}: MaterialUploadStepProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { contentLimits } = useQuizLimits();
  
  const MAX_SAFE_CONTENT_LENGTH = contentLimits.MAX_CONTENT_LENGTH;
  const WARNING_THRESHOLD = contentLimits.RECOMMENDED_LENGTH;

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

  const isContentWarning = contentLength > WARNING_THRESHOLD && contentLength <= MAX_SAFE_CONTENT_LENGTH;
  const isContentError = contentLength > MAX_SAFE_CONTENT_LENGTH;
  const contentPercentage = Math.min(Math.round((contentLength / MAX_SAFE_CONTENT_LENGTH) * 100), 100);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Course Material</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload your course material to generate questions from (recommended {Math.round(WARNING_THRESHOLD / 1000)}K characters, max {Math.round(MAX_SAFE_CONTENT_LENGTH / 1000)}K characters)
        </p>
      </div>

      {fileError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{fileError}</AlertDescription>
        </Alert>
      )}
      
      {isContentError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Content Too Large</AlertTitle>
          <AlertDescription>
            Your content exceeds the maximum allowed length of {Math.round(MAX_SAFE_CONTENT_LENGTH / 1000)}K characters.
            Please reduce your content size or split it into multiple quiz generations.
          </AlertDescription>
        </Alert>
      )}

      {!selectedFile ? (
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
          <p className="text-xs text-gray-500 mt-2">
            Recommended: {Math.round(WARNING_THRESHOLD / 1000)}K characters ({Math.round(WARNING_THRESHOLD / 6 / 1000)}K words)
          </p>
          <p className="text-xs text-gray-500">
            Maximum: {Math.round(MAX_SAFE_CONTENT_LENGTH / 1000)}K characters ({Math.round(MAX_SAFE_CONTENT_LENGTH / 6 / 1000)}K words)
          </p>
          <Button className="mt-4 touch-manipulation active:scale-95 transition-transform">
            Browse Files
          </Button>
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
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · {selectedFile.type || 'Unknown type'}
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
                        isContentError ? "bg-red-500" :
                        isContentWarning ? "bg-amber-500" : 
                        "bg-primary"
                      )} 
                    />
                    
                    {isContentWarning && (
                      <div className="flex items-center mt-2 text-amber-500 text-sm">
                        <AlertTriangle className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>Large content may affect processing time and question quality</span>
                      </div>
                    )}
                    
                    {isContentError && (
                      <div className="flex items-center mt-2 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>Content exceeds maximum size. Please reduce or split content.</span>
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
                    <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="break-words">{processingError}</span>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                className="text-gray-500 hover:text-gray-700 touch-manipulation active:scale-95 transition-transform"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
