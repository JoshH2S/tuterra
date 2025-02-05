import { useState } from "react";
import { FileIcon } from "./file-upload/FileIcon";
import { UploadStatus } from "./file-upload/UploadStatus";
import { DropZone } from "./file-upload/DropZone";
import { FileType } from "@/types/file";

interface FileUploadProps {
  onFileSelect: (file: File) => Promise<void>;
  acceptedTypes: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const FileUpload = ({ onFileSelect, acceptedTypes }: FileUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setUploadError("File size exceeds 50MB limit");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadSuccess(false);
      setSelectedFile({ name: file.name, size: file.size });
      
      await onFileSelect(file);
      
      setUploadSuccess(true);
      setUploadError(null);
    } catch (error) {
      setUploadError(error.message);
      setUploadSuccess(false);
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {selectedFile ? (
        <div className="flex items-center justify-center">
          <FileIcon fileName={selectedFile.name} />
        </div>
      ) : (
        <DropZone
          onFileSelect={handleFileSelect}
          acceptedTypes={acceptedTypes}
          isDragActive={isDragActive}
        />
      )}
      
      <UploadStatus
        isSuccess={uploadSuccess}
        isError={!!uploadError}
        errorMessage={uploadError || undefined}
      />
    </div>
  );
};

export default FileUpload;