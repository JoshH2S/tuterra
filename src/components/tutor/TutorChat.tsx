
import { useState } from "react";
import { useTutorMessages } from "@/hooks/useTutorMessages";
import { TutorChatMessages } from "./TutorChatMessages";
import { TutorChatInput } from "./TutorChatInput";
import { processFileContent } from "@/utils/file-utils";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
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
  const { messages, isLoading, sendMessage } = useTutorMessages();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      if (onSendMessage) {
        onSendMessage();
      }
      
      try {
        const response = await sendMessage(message, uploadedFileId, subscription);
        
        // Handle smart notes for premium users
        if (subscription.tier === "premium" && response?.smartNotes) {
          setSmartNotes([...smartNotes, response.smartNotes]);
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
      
      setMessage("");
      setUploadedFileId(null);  // Reset the file ID after sending
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      console.log('Starting file upload process...', file);
      const processedContent = await processFileContent(file);
      
      console.log('File processed:', processedContent);
      
      if (processedContent.fileId) {
        setUploadedFileId(processedContent.fileId);
        toast({
          title: "File uploaded successfully",
          description: "You can now ask questions about the file content.",
        });
      }
    } catch (error) {
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
      className="flex flex-col h-full border rounded-lg overflow-hidden bg-card"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <TutorChatMessages 
        messages={messages} 
        subscription={subscription}
      />
      <div className={`p-3 border-t ${isMobile ? 'sticky bottom-0 bg-background pb-4' : ''}`}>
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
    </motion.div>
  );
};
