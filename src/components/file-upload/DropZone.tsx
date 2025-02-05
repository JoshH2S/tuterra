import { Upload } from "lucide-react";

interface DropZoneProps {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  acceptedTypes: string;
  isDragActive?: boolean;
}

export const DropZone = ({ onFileSelect, acceptedTypes, isDragActive }: DropZoneProps) => {
  return (
    <label 
      className={`
        flex flex-col items-center justify-center w-full h-32
        border-2 border-dashed rounded-lg cursor-pointer
        transition-colors duration-200
        ${isDragActive 
          ? 'border-primary bg-primary/5' 
          : 'border-gray-300 hover:bg-gray-50'
        }
      `}
    >
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <Upload className="w-8 h-8 mb-2 text-gray-500" />
        <p className="mb-2 text-sm text-gray-500">
          <span className="font-semibold">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-500">
          Supported formats: {acceptedTypes.replace(/\./g, '').toUpperCase()}
        </p>
      </div>
      <input
        type="file"
        className="hidden"
        onChange={onFileSelect}
        accept={acceptedTypes}
      />
    </label>
  );
};