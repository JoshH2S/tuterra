import { useEffect, useRef } from "react";
import { TutorMessage } from "./TutorMessage";

interface TutorChatMessagesProps {
  messages: Array<{
    id: string;
    content: string;
    role: 'user' | 'assistant';
  }>;
}

export const TutorChatMessages = ({ messages }: TutorChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <TutorMessage
          key={msg.id}
          content={msg.content}
          role={msg.role}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};