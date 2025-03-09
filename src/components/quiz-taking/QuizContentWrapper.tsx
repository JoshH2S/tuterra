
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { QuizNavigationLinks } from "@/components/quiz-generation/QuizNavigationLinks";

interface QuizContentWrapperProps {
  children: React.ReactNode;
  onExitClick: () => void;
}

export const QuizContentWrapper: React.FC<QuizContentWrapperProps> = ({ 
  children,
  onExitClick
}) => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Persistent navigation links */}
        <div className="flex justify-between items-center mb-6">
          <QuizNavigationLinks />
          <Button
            variant="outline"
            onClick={onExitClick}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Exit Quiz</span>
          </Button>
        </div>
        
        <Card className="max-w-4xl mx-auto mt-6 p-6">
          {children}
        </Card>
      </div>
    </div>
  );
};
