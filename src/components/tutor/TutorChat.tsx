
import React from "react";
import { Subscription } from "@/hooks/useSubscription";

interface TutorChatProps {
  onSendMessage?: () => void;
  subscription: Subscription;
  smartNotes?: string[];
  setSmartNotes?: (notes: string[]) => void;
}

export const TutorChat: React.FC<TutorChatProps> = ({
  onSendMessage,
  subscription,
  smartNotes = [],
  setSmartNotes = () => {},
}) => {
  return (
    <div className="flex flex-col h-full p-4">
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          AI Tutor functionality has been temporarily removed.
        </p>
      </div>
    </div>
  );
};
