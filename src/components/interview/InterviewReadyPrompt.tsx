
import React from "react";
import { Button } from "@/components/ui/button";

interface InterviewReadyPromptProps {
  jobRole: string;
  onStartChat: () => void;
}

export const InterviewReadyPrompt = ({ jobRole, onStartChat }: InterviewReadyPromptProps) => {
  return (
    <div className="text-center space-y-6">
      <h2 className="text-2xl font-bold">Your Interview is Ready!</h2>
      <p className="text-gray-600 max-w-lg mx-auto">
        We've prepared a custom interview for the {jobRole} position you're applying for.
        You'll be asked a series of questions - take your time to think and respond naturally.
      </p>
      <Button onClick={onStartChat} size="lg">
        Begin Interview
      </Button>
    </div>
  );
};
