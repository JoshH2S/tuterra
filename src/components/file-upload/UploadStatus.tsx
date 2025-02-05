import { Check, AlertCircle } from "lucide-react";

interface UploadStatusProps {
  isSuccess: boolean;
  isError: boolean;
  errorMessage?: string;
}

export const UploadStatus = ({ isSuccess, isError, errorMessage }: UploadStatusProps) => {
  if (isSuccess) {
    return (
      <div className="flex items-center text-green-600">
        <Check className="mr-2" />
        <span>File uploaded successfully</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center text-red-600">
        <AlertCircle className="mr-2" />
        <span>{errorMessage || 'Error uploading file'}</span>
      </div>
    );
  }

  return null;
};