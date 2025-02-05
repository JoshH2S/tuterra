interface TutorMessageProps {
  content: string;
  role: 'user' | 'assistant';
}

export const TutorMessage = ({ content, role }: TutorMessageProps) => {
  const isAssistant = role === 'assistant';
  
  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          isAssistant
            ? 'bg-gray-100 text-gray-900'
            : 'bg-primary text-primary-foreground'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
};