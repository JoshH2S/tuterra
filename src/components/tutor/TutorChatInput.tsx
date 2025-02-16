
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { useIsMobile } from "@/hooks/use-mobile";

interface TutorChatInputProps {
  message: string;
  isLoading: boolean;
  onMessageChange: (message: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFileUpload: (file: File) => Promise<void>;
}

export const TutorChatInput = ({
  message,
  isLoading,
  onMessageChange,
  onSubmit,
  onFileUpload,
}: TutorChatInputProps) => {
  const isMobile = useIsMobile();

  const uploadButton = (
    <Button 
      variant="ghost" 
      size="icon"
      className="flex-shrink-0"
      aria-label="Upload file"
      type="button"
      onClick={(e) => {
        // Prevent the button's default action
        e.preventDefault();
        // Let the label's click event handle the file input
        const fileInput = document.getElementById('file-upload');
        if (fileInput) {
          fileInput.click();
        }
      }}
    >
      <Upload className="h-5 w-5" />
    </Button>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex gap-2">
        <FileUpload
          onFileSelect={onFileUpload}
          acceptedTypes=".txt,.pdf,.doc,.docx"
          trigger={uploadButton}
        />
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Ask me anything..."
            className={`resize-none ${isMobile ? 'h-[80px]' : 'h-[60px]'}`}
          />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading || !message.trim()}
          className="flex-shrink-0"
        >
          {isLoading ? "Sending..." : "Send"}
        </Button>
      </div>
    </form>
  );
};
