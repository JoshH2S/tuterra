
import { useEffect, useRef } from "react";
import { TutorMessage } from "./TutorMessage";
import { useIsMobile } from "@/hooks/use-mobile";
import { Subscription } from "@/hooks/useSubscription";
import { motion } from "framer-motion";
import { TypingIndicator } from "./TypingIndicator";

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
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Add effect for message container to make it work better on mobile
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.classList.add("momentum-scroll");
    }
    
    // Initialize with scroll to bottom on first load
    scrollToBottom("auto");
    
    return () => {
      if (container) {
        container.classList.remove("momentum-scroll");
      }
    };
  }, []);

  return (
    <div 
      ref={messagesContainerRef}
      className={`flex-1 overflow-y-auto py-4 px-3 md:px-4 space-y-6 overscroll-bounce`}
      style={{ WebkitOverflowScrolling: 'touch' }}
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
  );
};
