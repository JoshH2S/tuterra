
import { useEffect, useRef } from "react";
import { TutorMessage } from "./TutorMessage";
import { useIsMobile } from "@/hooks/use-mobile";
import { Subscription } from "@/hooks/useSubscription";

interface TutorChatMessagesProps {
  messages: Array<{
    id: string;
    content: string;
    role: 'user' | 'assistant';
  }>;
  subscription?: Subscription;
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
  }
}: TutorChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isMobile ? 'p-3' : ''}`}>
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
        messages.map((msg) => (
          <TutorMessage
            key={msg.id}
            content={msg.content}
            role={msg.role}
            subscription={subscription}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
