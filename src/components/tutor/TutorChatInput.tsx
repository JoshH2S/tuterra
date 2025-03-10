
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PaperclipIcon, SendIcon, Smile, Sparkles } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { useIsMobile } from "@/hooks/use-mobile";
import { Subscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";

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
  const [inputHeight, setInputHeight] = useState<number>(44); // Default minimum height
  
  // Debug mode to help with alignment troubleshooting
  const [debugMode, setDebugMode] = useState(false);

  // Auto-resize the textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
      setInputHeight(newHeight);
      
      // Debug logging for alignment troubleshooting
      if (debugMode) {
        console.log('Textarea metrics:', {
          scrollHeight: textarea.scrollHeight,
          clientHeight: textarea.clientHeight,
          offsetHeight: textarea.offsetHeight,
          lineHeight: window.getComputedStyle(textarea).lineHeight,
          padding: window.getComputedStyle(textarea).padding,
          border: window.getComputedStyle(textarea).borderWidth
        });
      }
    };

    textarea.addEventListener('input', adjustHeight);
    // Initial adjustment when component mounts or message changes
    adjustHeight();

    return () => textarea.removeEventListener('input', adjustHeight);
  }, [message, debugMode]);

  const uploadButton = (
    <Button 
      variant="ghost" 
      size="icon"
      className="flex-shrink-0 rounded-full h-9 w-9 text-muted-foreground hover:text-foreground flex items-center justify-center"
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
      <PaperclipIcon className="h-[18px] w-[18px]" />
    </Button>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="flex items-end gap-2">
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
              "resize-none min-h-[44px] rounded-full",
              "px-4 pr-[90px] py-0", // Remove vertical padding to better control centering
              "flex items-center leading-normal",
              isMobile ? "text-sm" : "",
              isPremium ? "focus-visible:ring-amber-300" : ""
            )}
            style={{
              // Use inline styles to dynamically set height and padding
              height: `${inputHeight}px`,
              paddingTop: '12px',   // Explicit padding to center text vertically
              paddingBottom: '12px'
            }}
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
          />
          
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 pr-1">
            {(isPremium || isPro) && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground flex items-center justify-center"
                disabled={isLoading}
                aria-label="Add emoji"
              >
                <Smile className="h-[18px] w-[18px]" />
              </Button>
            )}
            
            <Button 
              type="submit" 
              size="icon"
              disabled={isLoading || !message.trim()}
              className={cn(
                "rounded-full h-8 w-8 flex items-center justify-center",
                isPremium ? "bg-amber-500 hover:bg-amber-600" : ""
              )}
              aria-label="Send message"
            >
              <SendIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* 
      For development use only - uncomment to enable debug button
      <div className="text-xs text-right">
        <button 
          type="button" 
          onClick={() => setDebugMode(!debugMode)}
          className="text-muted-foreground"
        >
          {debugMode ? "Disable" : "Enable"} debug
        </button>
      </div>
      */}
    </form>
  );
};
