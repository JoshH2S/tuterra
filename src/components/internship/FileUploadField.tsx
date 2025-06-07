import { useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadFieldProps {
  onFileUpload: (fileData: {
    url: string;
    name: string;
    type: string;
    size: number;
  }) => void;
  onFileRemove: () => void;
  taskId: string;
  sessionId: string;
  userId: string;
  acceptedTypes?: string;
}

export function FileUploadField({
  onFileUpload,
  onFileRemove,
  taskId,
  sessionId,
  userId,
  acceptedTypes = ".pdf,.docx,.pptx,.txt"
}: FileUploadFieldProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size must be less than 10MB");
      return;
    }

    setFile(selectedFile);
    setError(null);
    await uploadFile(selectedFile);
  };

  const uploadFile = async (selectedFile: File) => {
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Create a unique file path
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `task-submissions/${sessionId}/${taskId}/${fileName}`;
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from("task-submissions")
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);
      
      onFileUpload({
        url: publicUrl,
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size
      });
      
    } catch (error: any) {
      console.error("Error uploading file:", error);
      setError(error.message || "Failed to upload file");
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setError(null);
    setUploadProgress(0);
    onFileRemove();
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <div 
          className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept={acceptedTypes}
          />
          <div className="flex flex-col items-center">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground mt-1">
              Supported formats: PDF, DOCX, PPTX, TXT (Max 10MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {uploading && (
            <Progress value={uploadProgress} className="h-1" />
          )}
        </div>
      )}
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
} 