
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertOctagon } from "lucide-react";

interface QuizErrorProps {
  error: Error | unknown;
}

export const QuizError: React.FC<QuizErrorProps> = ({ error }) => {
  const navigate = useNavigate();
  const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
  
  return (
    <div className="container mx-auto py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto bg-red-50 p-6 rounded-md border border-red-200 shadow-sm">
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-4">
          <AlertOctagon className="h-10 w-10 text-red-500" />
          <div>
            <h2 className="text-lg font-semibold text-red-700 mb-2">Error Loading Quiz</h2>
            <p className="text-sm text-red-600 mb-2">{errorMessage}</p>
            <p className="text-sm text-gray-600 mb-4">Please try again later or contact support if this problem persists.</p>
            <Button 
              onClick={() => navigate('/quizzes')}
              variant="outline"
              className="mt-2"
            >
              Return to Quizzes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
