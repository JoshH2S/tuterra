
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import { Textarea } from "@/components/ui/textarea";

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
    <form className="flex gap-2 items-end" onSubmit={onSubmit}>
      <div className="flex-1">
        <Textarea
          placeholder="Ask a question..."
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyDown={onKeyPress}
          className="min-h-[50px] resize-none"
          disabled={isLoading}
        />
      </div>
      <div className="flex flex-col gap-2 mb-4">
        <Button 
          type="submit" 
          disabled={isLoading || !message.trim()}
          className="self-end"
        >
          Send
        </Button>
        <FileUpload 
          onFileSelect={onFileUpload}
          acceptedTypes=".txt,.pdf,.doc,.docx"
          trigger={
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="self-end"
              disabled={isLoading}
            >
              <Upload className="h-4 w-4" />
            </Button>
          }
        />
      </div>
    </form>
  );
};
