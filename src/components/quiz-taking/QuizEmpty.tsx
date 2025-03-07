
import React from "react";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const QuizEmpty: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto bg-yellow-50 p-6 rounded-md border border-yellow-200 shadow-sm">
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-4">
          <AlertTriangle className="h-10 w-10 text-yellow-500" />
          <div>
            <h2 className="text-lg font-semibold text-yellow-700 mb-2">Quiz Not Available</h2>
            <p className="text-sm text-yellow-600 mb-4">This quiz has no questions or is not available. Please check back later or contact your instructor.</p>
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
