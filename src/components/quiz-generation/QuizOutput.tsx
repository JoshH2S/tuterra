
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizDurationInput } from "./QuizDurationInput";
import { QuizActions } from "./QuizActions";
import { Question } from "@/types/quiz";
import { Quiz } from "./Quiz";
import { QuizPagination } from "./QuizPagination";
import { usePdfGeneration } from "@/hooks/quiz/usePdfGeneration";
import { useQuizPublishing } from "@/hooks/quiz/useQuizPublishing";
import { useState } from "react";

interface QuizOutputProps {
  questions: Question[];
}

export const QuizOutput = ({ questions }: QuizOutputProps) => {
  const [duration, setDuration] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const questionsPerPage = 3; // Show fewer questions per page on mobile
  
  const { handlePublish } = useQuizPublishing(duration);
  const { handleDownloadPDF } = usePdfGeneration(questions, duration);

  // Calculate pagination values
  const totalPages = Math.ceil((questions?.length || 0) / questionsPerPage);
  const startIdx = currentPage * questionsPerPage;
  const endIdx = Math.min(startIdx + questionsPerPage, questions.length);
  const currentQuestions = questions.slice(startIdx, endIdx);

  const handleChangePage = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (!questions || questions.length === 0) return null;

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle className="text-xl">Generated Quiz</CardTitle>
        <QuizActions 
          onPublish={handlePublish}
          onDownload={handleDownloadPDF}
        />
      </CardHeader>
      <CardContent>
        <QuizDurationInput 
          duration={duration}
          onChange={setDuration}
        />
        
        <Quiz 
          questions={currentQuestions} 
          startIndex={startIdx} 
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
