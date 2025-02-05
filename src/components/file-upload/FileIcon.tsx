import { File, FileText } from "lucide-react";

interface FileIconProps {
  fileName: string;
}

export const FileIcon = ({ fileName }: FileIconProps) => {
  const getFileIcon = () => {
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

  return getFileIcon();
};