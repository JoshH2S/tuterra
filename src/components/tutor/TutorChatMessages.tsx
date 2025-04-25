
import { useEffect, useRef } from "react";
import { TutorMessage } from "./TutorMessage";
import { useIsMobile } from "@/hooks/use-mobile";
import { Subscription } from "@/hooks/useSubscription";
import { motion } from "framer-motion";
import { TypingIndicator } from "./TypingIndicator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TutorChatMessagesProps {
  messages: Array<{
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp?: string;
  }>;
  subscription?: Subscription;
  isTyping?: boolean;
}

export const TutorChatMessages = ({ 
  messages,
  subscription = { 
    tier: "free", 
    features: { 
      smartNotes: false, 
      advancedModel: false, 
      learningPath: false, 
      streaming: false 
    } 
  },
  isTyping = false
}: TutorChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior, 
      block: "end" 
    });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    // Initialize with scroll to bottom on first load
    scrollToBottom("auto");
  }, []);

  return (
    <ScrollArea 
      className="flex-1 h-full"
      type="always"
      scrollHideDelay={0}
    >
      <div 
        ref={messagesContainerRef}
        className="py-4 px-3 md:px-4 space-y-6 min-h-full"
        style={{ 
          overscrollBehavior: 'contain'
        }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground max-w-md">
              <h3 className="text-lg font-medium mb-2">Welcome to AI Study Assistant</h3>
              <p className="text-sm">
                Ask me anything about your studies. I can help you understand concepts, 
                create study guides, or answer any academic questions.
              </p>
              {subscription.tier !== "free" && (
                <p className="mt-2 text-xs">
                  {subscription.tier === "premium" ? 
                    "Premium features activated: Advanced AI model, Smart Notes, and Learning Path" : 
                    "Pro features activated: Advanced AI model and Learning Path"}
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-6 pb-2">
              {messages.map((msg, index) => (
                <TutorMessage
                  key={msg.id}
                  content={msg.content}
                  role={msg.role}
                  subscription={subscription}
                  isLastMessage={index === messages.length - 1}
                  timestamp={msg.timestamp || new Date().toISOString()}
                />
              ))}
            </div>
            {isTyping && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>
    </ScrollArea>
  );
};
