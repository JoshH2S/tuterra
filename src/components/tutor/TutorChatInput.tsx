
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PaperclipIcon, SendIcon, Sparkles, Smile } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { useIsMobile } from "@/hooks/use-mobile";
import { Subscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRef, useEffect } from "react";

interface TutorChatInputProps {
  message: string;
  isLoading: boolean;
  onMessageChange: (message: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFileUpload: (file: File) => Promise<void>;
  subscription?: Subscription;
}

export const TutorChatInput = ({
  message,
  isLoading,
  onMessageChange,
  onSubmit,
  onFileUpload,
  subscription = { 
    tier: "free", 
    features: { 
      smartNotes: false, 
      advancedModel: false, 
      learningPath: false, 
      streaming: false 
    } 
  }
}: TutorChatInputProps) => {
  const isMobile = useIsMobile();
  const isPremium = subscription.tier === "premium";
  const isPro = subscription.tier === "pro";
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = '0';
      const scrollHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = `${scrollHeight}px`;
    };

    textarea.addEventListener('input', adjustHeight);
    
    // Call once to initialize
    requestAnimationFrame(adjustHeight);

    return () => textarea.removeEventListener('input', adjustHeight);
  }, [message]);

  const uploadButton = (
    <Button 
      variant="ghost" 
      size="icon"
      className="flex-shrink-0 rounded-full text-muted-foreground hover:text-foreground"
      aria-label="Upload file"
      type="button"
      disabled={isLoading}
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
      <PaperclipIcon className="h-5 w-5" />
    </Button>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-2 w-full">
      <div className="flex items-end gap-2 w-full">
        {(isPremium || isPro) && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <FileUpload
              onFileSelect={onFileUpload}
              acceptedTypes=".txt,.pdf,.doc,.docx"
              trigger={uploadButton}
            />
          </motion.div>
        )}

        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder={isPremium ? "Ask anything with enhanced AI..." : "Ask me anything..."}
            className={cn(
              "resize-none min-h-[44px] pr-12 transition-all",
              isMobile ? "text-sm" : "",
              isPremium 
                ? "focus-visible:ring-amber-300" 
                : "",
              "rounded-full px-4 py-3 flex items-center"
            )}
            disabled={isLoading}
            onKeyDown={(e) => {
              // Submit form on Enter (but not with Shift+Enter)
              if (e.key === "Enter" && !e.shiftKey && !isMobile) {
                e.preventDefault();
                if (message.trim()) {
                  onSubmit(e);
                }
              }
            }}
            style={{ 
              paddingTop: '10px', 
              paddingBottom: '10px',
              lineHeight: '1.5'
            }}
          />
          
          {(isPremium || isPro) && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute right-12 bottom-1.5 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              <Smile className="h-5 w-5" />
            </Button>
          )}
          
          <Button 
            type="submit" 
            size="icon"
            disabled={isLoading || !message.trim()}
            className={cn(
              "absolute right-1 bottom-1.5 rounded-full h-8 w-8",
              isPremium ? "bg-amber-500 hover:bg-amber-600" : ""
            )}
            aria-label="Send message"
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
};
