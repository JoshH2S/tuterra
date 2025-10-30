
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
    <div className="min-h-screen pb-20 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/characters/pexels-ozge-sultan-temur-137931573-27811281.jpg')"
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Persistent navigation links */}
        <div className="flex justify-between items-center mb-6">
          <QuizNavigationLinks />
          <Button
            variant="outline"
            onClick={onExitClick}
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm hover:bg-white/95"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Exit Quiz</span>
          </Button>
        </div>
        
        <Card className="max-w-4xl mx-auto mt-6 p-6 bg-white/95 backdrop-blur-md border border-white/20 shadow-xl">
          {children}
        </Card>
      </div>
    </div>
  );
};
