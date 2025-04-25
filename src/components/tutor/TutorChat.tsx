
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
  const [isTyping, setIsTyping] = useState(false);
  const { messages, isLoading, sendMessage } = useTutorMessages();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSendMessage = async (message: string) => {
    if (message.trim() && !isLoading) {
      if (onSendMessage) {
        onSendMessage();
      }
      
      try {
        setIsTyping(true);
        const response = await sendMessage(message, null, subscription);
        
        // Handle smart notes for premium users
        if (subscription.tier === "premium" && response?.smartNotes) {
          setSmartNotes([...smartNotes, response.smartNotes]);
        }
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      console.log('Starting file upload process...', file);
      const processedContent = await processFileContent(file);
      
      if (processedContent.fileId) {
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
      className="flex flex-col h-full border rounded-lg overflow-hidden bg-background shadow-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <TutorChatHeader 
        isPremium={subscription.tier === "premium"}
      />
      
      <div className="flex-1 overflow-hidden">
        <TutorChatMessages 
          messages={messages} 
          subscription={subscription}
          isTyping={isTyping}
        />
      </div>
      
      <div className={`border-t bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 p-3 ${isMobile ? 'sticky bottom-0 pb-4 pt-3 safe-area-bottom' : ''}`}>
        <TutorChatInput
          onSendMessage={handleSendMessage}
          isProcessing={isLoading}
          disabled={isLoading}
        />
        
        {subscription.tier === "free" && (
          <div className="mt-2 text-center text-xs text-muted-foreground">
            <p>Upgrade to Pro or Premium for advanced features</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
