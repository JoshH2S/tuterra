
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import { AIInputWithLoading } from "@/components/ui/ai-input-with-loading";
import { useIsMobile } from "@/hooks/use-mobile";

interface TutorChatInputProps {
  message: string;
  isLoading: boolean;
  onMessageChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onFileUpload?: (file: File) => Promise<void>;
}

export const TutorChatInput = ({
  isLoading,
  onSubmit,
  onFileUpload,
  onMessageChange,
}: TutorChatInputProps) => {
  const isMobile = useIsMobile();
  
  const handleSubmit = async (value: string) => {
    onMessageChange(value);
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    onSubmit(fakeEvent);
  };

  return (
    <form className="flex gap-2 items-end" onSubmit={(e) => e.preventDefault()}>
      <div className="flex-1">
        <AIInputWithLoading
          placeholder="Ask a question..."
          onSubmit={handleSubmit}
          loadingDuration={3000}
          className={`mb-0 ${isMobile ? 'text-sm' : ''}`}
          disabled={isLoading}
        />
      </div>
      <div className="flex flex-col gap-2 mb-4">
        <FileUpload 
          onFileSelect={onFileUpload}
          acceptedTypes=".txt,.pdf,.doc,.docx"
          trigger={
            <Button
              type="button"
              variant="outline"
              size={isMobile ? "sm" : "icon"}
              className="self-end"
            >
              <Upload className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
            </Button>
          }
        />
      </div>
    </form>
  );
};
