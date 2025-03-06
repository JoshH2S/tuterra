
import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, WifiOff } from "lucide-react";

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
    <div className="text-center space-y-6 max-w-xl mx-auto px-4">
      <div className="flex justify-center mb-2">
        <div className={`p-3 rounded-full ${usedFallbackQuestions ? "bg-amber-100" : "bg-blue-100"}`}>
          {usedFallbackQuestions ? 
            <WifiOff className="h-6 w-6 text-amber-600" /> : 
            <Sparkles className="h-6 w-6 text-blue-600" />
          }
        </div>
      </div>
      <h2 className="text-2xl font-bold">Your Interview is Ready!</h2>
      <p className="text-gray-600">
        {usedFallbackQuestions 
          ? `We've prepared a standard interview for the ${jobRole} position using our offline mode.` 
          : `We've prepared a custom interview for the ${jobRole} position you're applying for.`
        }
        You'll be asked a series of questions - take your time to think and respond naturally.
      </p>
      <Button 
        onClick={onStartChat} 
        size="lg" 
        className="px-8 w-full sm:w-auto"
      >
        Begin Interview
      </Button>
      {usedFallbackQuestions && (
        <p className="text-xs text-amber-600 mt-2">
          <span className="flex items-center justify-center gap-1">
            <WifiOff className="h-3 w-3" /> 
            Using offline mode with standard questions
          </span>
        </p>
      )}
    </div>
  );
};
