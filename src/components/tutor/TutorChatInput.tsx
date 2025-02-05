import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface TutorChatInputProps {
  message: string;
  isLoading: boolean;
  onMessageChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const TutorChatInput = ({
  message,
  isLoading,
  onMessageChange,
  onSubmit,
}: TutorChatInputProps) => {
  return (
    <form onSubmit={onSubmit} className="p-4 border-t">
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 min-h-[60px]"
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          className="self-end"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};