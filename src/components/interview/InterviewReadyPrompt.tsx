
import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface InterviewReadyPromptProps {
  jobRole: string;
  onStartChat: () => void;
  usedFallbackQuestions?: boolean;
}

export const InterviewReadyPrompt = ({ 
  jobRole, 
  onStartChat,
  usedFallbackQuestions = false 
}: InterviewReadyPromptProps) => {
  return (
    <div className="text-center space-y-6 max-w-xl mx-auto">
      <div className="flex justify-center mb-2">
        <div className="bg-blue-100 p-3 rounded-full">
          <Sparkles className="h-6 w-6 text-blue-600" />
        </div>
      </div>
      <h2 className="text-2xl font-bold">Your Interview is Ready!</h2>
      <p className="text-gray-600">
        {usedFallbackQuestions 
          ? `We've prepared a standard interview for the ${jobRole} position you're applying for.` 
          : `We've prepared a custom interview for the ${jobRole} position you're applying for.`
        }
        You'll be asked a series of questions - take your time to think and respond naturally.
      </p>
      <Button onClick={onStartChat} size="lg" className="px-8">
        Begin Interview
      </Button>
    </div>
  );
};
