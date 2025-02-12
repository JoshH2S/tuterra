
import { useIsMobile } from "@/hooks/use-mobile";

interface TutorMessageProps {
  content: string;
  role: 'user' | 'assistant';
}

export const TutorMessage = ({ content, role }: TutorMessageProps) => {
  const isAssistant = role === 'assistant';
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} ${isMobile ? 'mb-2' : 'mb-3'}`}>
      <div
        className={`max-w-[85%] p-3 rounded-lg ${
          isAssistant
            ? 'bg-gray-100 text-gray-900'
            : 'bg-primary text-primary-foreground'
        } ${isMobile ? 'text-sm p-2.5' : ''}`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
};
