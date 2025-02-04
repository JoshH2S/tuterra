import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FileUpload from "@/components/FileUpload";
import { toast } from "@/components/ui/use-toast";

interface CourseMaterialUploadProps {
  onFileSelect: (file: File) => void;
  contentLength: number;
}

const MAX_CONTENT_LENGTH = 5000;

export const CourseMaterialUpload = ({ onFileSelect, contentLength }: CourseMaterialUploadProps) => {
  const handleFileSelect = async (file: File) => {
    const content = await file.text();
    
    if (content.length > MAX_CONTENT_LENGTH) {
      toast({
        title: "Content will be trimmed",
        description: `Your file content (${content.length} characters) exceeds the limit of ${MAX_CONTENT_LENGTH} characters. Only the first ${MAX_CONTENT_LENGTH} characters will be processed.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "File selected",
        description: `${file.name} has been selected for lesson planning.`,
      });
    }
    
    onFileSelect(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Material</CardTitle>
        <CardDescription>Upload a new file or select from existing courses</CardDescription>
      </CardHeader>
      <CardContent>
        <FileUpload
          onFileSelect={handleFileSelect}
          acceptedTypes=".pdf,.doc,.docx,.txt"
        />
      </CardContent>
    </Card>
  );
};