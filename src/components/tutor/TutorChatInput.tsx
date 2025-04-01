
import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, AlertCircle } from 'lucide-react';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useUserCredits } from '@/hooks/useUserCredits';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UpgradePrompt } from '@/components/credits/UpgradePrompt';
import { useSubscription } from '@/hooks/useSubscription';

interface TutorChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isProcessing?: boolean;
  placeholder?: string;
}

export const TutorChatInput = ({
  onSendMessage,
  disabled = false,
  isProcessing = false,
  placeholder = 'Type your message here...'
}: TutorChatInputProps) => {
  const [message, setMessage] = useState('');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const { isLoggedIn, checkingAuth } = useAuthStatus();
  const { checkCredits, decrementCredits } = useUserCredits();
  const { subscription } = useSubscription();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSend = async () => {
    if (!message.trim() || disabled || isProcessing) return;

    // Skip credit check for premium users
    if (subscription.tier === 'free') {
      // Check if user has tutor message credits
      const hasCredits = await checkCredits('tutor_message_credits');
      if (!hasCredits) {
        setShowUpgradePrompt(true);
        return;
      }

      // Decrement tutor message credits
      await decrementCredits('tutor_message_credits');
    }
    
    onSendMessage(message.trim());
    setMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isLoggedIn && !checkingAuth) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          Please sign in to chat with the AI tutor.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className="flex items-end gap-2 bg-background border rounded-md p-2">
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isProcessing}
          className="min-h-10 resize-none border-0 focus-visible:ring-0 focus-visible:ring-transparent"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled || isProcessing}
          size="icon"
          className="h-8 w-8 shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        featureType="tutor"
      />
    </>
  );
};
