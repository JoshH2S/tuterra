
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Question } from "@/types/quiz-generation";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuizActionsFooterProps {
  quizQuestions: Question[];
}

export const QuizActionsFooter = ({
  quizQuestions
}: QuizActionsFooterProps) => {
  const handlePublishQuiz = async () => {
    try {
      const { data: latestQuiz } = await supabase
        .from('quizzes')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!latestQuiz) {
        toast({
          title: "Error",
          description: "No quiz found to publish",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('quizzes')
        .update({ published: true })
        .eq('id', latestQuiz.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quiz published successfully!",
      });
    } catch (error) {
      console.error('Error publishing quiz:', error);
      toast({
        title: "Error",
        description: "Failed to publish quiz. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (quizQuestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
      <Card className="bg-gray-50 dark:bg-gray-800/50 p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Button 
            onClick={handlePublishQuiz}
            size="lg"
            className="w-full md:w-auto"
          >
            Publish Quiz
          </Button>
          
          <div className="flex flex-col sm:flex-row w-full justify-center gap-4 mt-4">
            <Link to="/case-study-quiz" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Case Study Quiz
              </Button>
            </Link>
            
            <Link to="/quizzes" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                View Quizzes
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};
