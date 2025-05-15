
import { useState, useRef } from "react";
import { Upload, File, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TaskFileUploadProps {
  taskId: string;
  onFileUpload: (fileUrl: string, fileName: string) => void;
  maxSizeMB?: number;
  allowedFileTypes?: string[];
}

export function TaskFileUpload({ 
  taskId, 
  onFileUpload, 
  maxSizeMB = 5, 
  allowedFileTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.jpg', '.jpeg', '.png'] 
}: TaskFileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024; // Convert MB to bytes
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file size
      if (selectedFile.size > maxSizeBytes) {
        setError(`File is too large. Maximum size is ${maxSizeMB}MB.`);
        e.target.value = '';
        return;
      }
      
      // Validate file type
      const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
      if (!allowedFileTypes.includes(fileExtension)) {
        setError(`Invalid file type. Allowed types: ${allowedFileTypes.join(', ')}`);
        e.target.value = '';
        return;
      }
      
      setFile(selectedFile);
    }
  };
  
  const uploadFile = async () => {
    if (!file || !taskId) return;
    
    try {
      setUploading(true);
      setProgress(0);
      
      // Create a safe file name with task ID prefix
      const fileExt = file.name.split('.').pop();
      const fileName = `task_${taskId}_${Date.now()}.${fileExt}`;
      const filePath = `internship_deliverables/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('internship')
        .upload(filePath, file, {
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setProgress(percent);
          }
        });
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: publicURL } = supabase.storage
        .from('internship')
        .getPublicUrl(filePath);
        
      // Pass the URL and filename back
      onFileUpload(publicURL.publicUrl, file.name);
      
      // Reset state
      setFile(null);
      setProgress(100);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Error uploading file. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  const cancelUpload = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Format bytes to human-readable size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-center justify-center w-full">
        {!file ? (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                Supported formats: {allowedFileTypes.join(', ')}
              </p>
              <p className="text-xs text-gray-500">
                Max size: {maxSizeMB}MB
              </p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileChange} 
              ref={fileInputRef}
              accept={allowedFileTypes.join(',')}
            />
          </label>
        ) : (
          <div className="w-full bg-gray-50 rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <File className="h-6 w-6 mr-2 text-blue-500" />
                <div>
                  <p className="text-sm font-medium truncate max-w-[220px]">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-7 w-7 text-gray-500 hover:text-gray-700"
                      onClick={cancelUpload}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove file</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {uploading && (
              <Progress value={progress} className="h-2 mb-2" />
            )}
            
            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={uploading}
                onClick={uploadFile}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
