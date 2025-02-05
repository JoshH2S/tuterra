import { useState } from "react";
import { Upload, Check, AlertCircle, FileText, File } from "lucide-react";
import { FileType } from "@/types/file";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string;
}

const FileUpload = ({ onFileSelect, acceptedTypes = ".pdf,.doc,.docx,.txt" }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <File className="h-12 w-12 text-red-500" />;
      case 'doc':
      case 'docx':
        return <File className="h-12 w-12 text-blue-500" />;
      default:
        return <FileText className="h-12 w-12 text-gray-500" />;
    }
  };

  const handleFiles = (files: FileList) => {
    if (files.length > 0) {
      const file = files[0];
      const fileType = file.name.split(".").pop()?.toLowerCase();
      const acceptedExtensions = acceptedTypes.split(",").map(type => type.replace(".", ""));
      
      if (acceptedExtensions.includes(fileType || "")) {
        // Validate file size (e.g., max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
          setError("File size too large. Maximum size is 10MB.");
          return;
        }

        setFile(file);
        setError("");
        onFileSelect(file);
      } else {
        setError(`Invalid file type. Supported formats: ${acceptedTypes}`);
      }
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center ${
        isDragging ? "border-primary-500 bg-primary-100" : "border-gray-300"
      } transition-colors duration-200 ease-in-out`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept={acceptedTypes}
        onChange={handleFileInput}
      />
      
      <label
        htmlFor="file-upload"
        className="cursor-pointer flex flex-col items-center justify-center"
      >
        {file ? (
          <div className="flex flex-col items-center space-y-2">
            {getFileIcon(file.name)}
            <p className="text-sm text-gray-600">{file.name}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Upload className="h-12 w-12 text-gray-400" />
            <p className="text-lg font-medium text-gray-700">
              Drag and drop your file here
            </p>
            <p className="text-sm text-gray-500">
              or click to select a file
            </p>
            <p className="text-xs text-gray-400">
              Supported formats: PDF, Word documents, Text files
            </p>
            <p className="text-xs text-gray-400">
              Maximum file size: 10MB
            </p>
          </div>
        )}
      </label>

      {error && (
        <div className="mt-4 flex items-center justify-center text-red-500">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;