
import { useState } from "react";
import { useTutorMessages } from "@/hooks/useTutorMessages";
import { TutorChatMessages } from "./TutorChatMessages";
import { TutorChatInput } from "./TutorChatInput";
import { TutorChatHeader } from "./TutorChatHeader";
import { processFileContent } from "@/utils/file-utils";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { Subscription } from "@/hooks/useSubscription";

interface TutorChatProps {
  onSendMessage?: () => void;
  subscription?: Subscription;
  smartNotes?: string[];
  setSmartNotes?: (notes: string[]) => void;
}

export const TutorChat = ({ 
  onSendMessage, 
  subscription = { 
    tier: "free", 
    features: { 
      smartNotes: false, 
      advancedModel: false, 
      learningPath: false, 
      streaming: false 
    } 
  },
  smartNotes = [],
  setSmartNotes = () => {}
}: TutorChatProps) => {
  const [message, setMessage] = useState("");
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const { messages, isLoading, sendMessage } = useTutorMessages();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      if (onSendMessage) {
        onSendMessage();
      }
      
      try {
        setIsTyping(true);
        const response = await sendMessage(message, uploadedFileId, subscription);
        
        // Handle smart notes for premium users
        if (subscription.tier === "premium" && response?.smartNotes) {
          setSmartNotes([...smartNotes, response.smartNotes]);
        }
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        setIsTyping(false);
      }
      
      setMessage("");
      setUploadedFileId(null);  // Reset the file ID after sending
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      console.log('Starting file upload process...', file);
      const processedContent = await processFileContent(file);
      
      if (processedContent.fileId) {
        setUploadedFileId(processedContent.fileId);
        toast({
          title: "File uploaded successfully",
          description: "You can now ask questions about the file content.",
        });
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div 
      className="flex flex-col h-full w-full overflow-hidden bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <TutorChatHeader 
        isPremium={subscription.tier === "premium"}
      />
      
      <div className="flex-1 overflow-hidden relative">
        <TutorChatMessages 
          messages={messages} 
          subscription={subscription}
          isTyping={isTyping}
        />
      </div>
      
      <div className="border-t bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 w-full z-10 safe-area-bottom">
        <div className="max-w-3xl mx-auto px-3 py-3">
          <TutorChatInput
            message={message}
            isLoading={isLoading}
            onMessageChange={setMessage}
            onSubmit={handleSubmit}
            onFileUpload={handleFileUpload}
            subscription={subscription}
          />
          
          {subscription.tier === "free" && (
            <div className="mt-2 text-center text-xs text-muted-foreground">
              <p>Upgrade to Pro or Premium for advanced features</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
