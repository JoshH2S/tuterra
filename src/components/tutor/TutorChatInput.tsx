
import { Send, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/components/FileUpload";

interface TutorChatInputProps {
  message: string;
  isLoading: boolean;
  onMessageChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onFileUpload?: (file: File) => Promise<void>;
}

export const TutorChatInput = ({
  message,
  isLoading,
  onMessageChange,
  onSubmit,
  onKeyPress,
  onFileUpload,
}: TutorChatInputProps) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyDown={onKeyPress}
          placeholder="Ask a question... (Press Enter to send)"
          className="flex-1 min-h-[60px]"
        />
        <div className="flex flex-col gap-2 self-end">
          <FileUpload 
            onFileSelect={onFileUpload}
            acceptedTypes=".txt,.pdf,.doc,.docx"
            trigger={
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="self-end"
              >
                <Upload className="h-4 w-4" />
              </Button>
            }
          />
          <Button 
            type="submit" 
            disabled={isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
};
