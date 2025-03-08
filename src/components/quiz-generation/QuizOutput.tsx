
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizDurationInput } from "./QuizDurationInput";
import { QuizActions } from "./QuizActions";
import { Question } from "@/types/quiz";
import { Quiz } from "./Quiz";
import { QuizPagination } from "./QuizPagination";
import { usePdfGeneration } from "@/hooks/quiz/usePdfGeneration";
import { useQuizPublishing } from "@/hooks/quiz/useQuizPublishing";
import { useState } from "react";
import { useResponsive } from "@/hooks/useResponsive";

interface QuizOutputProps {
  questions: Question[];
  quizId?: string;
}

export const QuizOutput = ({ questions, quizId }: QuizOutputProps) => {
  const [duration, setDuration] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  
  // Use the useResponsive hook instead of useMediaQuery
  const { isMobile } = useResponsive();
  const questionsPerPage = isMobile ? 2 : 3;
  
  const { handlePublish } = useQuizPublishing();
  const { handleDownloadPDF } = usePdfGeneration(questions, duration);

  // Validate questions first
  const validQuestions = Array.isArray(questions) ? questions : [];

  // Calculate pagination values
  const totalPages = Math.ceil((validQuestions?.length || 0) / questionsPerPage);
  const startIdx = currentPage * questionsPerPage;
  const endIdx = Math.min(startIdx + questionsPerPage, validQuestions.length);
  const currentQuestions = validQuestions.slice(startIdx, endIdx);

  const handleChangePage = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle swipe for mobile navigation
  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      handleChangePage(currentPage + 1);
    } else {
      handleChangePage(currentPage - 1);
    }
  };

  // Create a wrapper function for the publish action
  const onPublish = () => {
    if (quizId) {
      handlePublish(quizId, duration);
    } else {
      toast({
        title: "Error",
        description: "No quiz ID available for publishing",
        variant: "destructive",
      });
    }
  };

  if (!validQuestions || validQuestions.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground py-6">
            No quiz questions available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6">
        <CardTitle className="text-xl">Generated Quiz</CardTitle>
        <QuizActions 
          onPublish={onPublish}
          onDownload={handleDownloadPDF}
        />
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <QuizDurationInput 
          duration={duration}
          onChange={setDuration}
        />
        
        <Quiz 
          questions={currentQuestions} 
          startIndex={startIdx}
          onSwipe={isMobile ? handleSwipe : undefined}
        />
        
        {totalPages > 1 && (
          <QuizPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onChangePage={handleChangePage}
          />
        )}
      </CardContent>
    </Card>
  );
};

// Re-export the Quiz component to maintain API compatibility
export { Quiz } from "./Quiz";
