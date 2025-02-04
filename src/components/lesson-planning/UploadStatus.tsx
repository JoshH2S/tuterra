import { AlertCircle, Check } from "lucide-react";

interface UploadStatusProps {
  fileName: string;
  error?: string;
}

export const UploadStatus = ({ fileName, error }: UploadStatusProps) => {
  return (
    <div className="mt-4 flex items-center justify-center">
      {error ? (
        <div className="flex items-center text-red-500">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      ) : (
        <div className="flex items-center text-green-500">
          <Check className="h-4 w-4 mr-2" />
          <span className="text-sm">{fileName} uploaded successfully</span>
        </div>
      )}
    </div>
  );
};