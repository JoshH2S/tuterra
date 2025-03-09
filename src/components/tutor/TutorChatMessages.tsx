
import { useEffect, useRef } from "react";
import { TutorMessage } from "./TutorMessage";
import { useIsMobile } from "@/hooks/use-mobile";

interface TutorChatMessagesProps {
  messages: Array<{
    id: string;
    content: string;
    role: 'user' | 'assistant';
  }>;
}

export const TutorChatMessages = ({ messages }: TutorChatMessagesProps) => {
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
          </div>
        </div>
      ) : (
        messages.map((msg) => (
          <TutorMessage
            key={msg.id}
            content={msg.content}
            role={msg.role}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
