import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { useState } from "react";
import { QuizDurationInput } from "./QuizDurationInput";
import { QuizActions } from "./QuizActions";
import { QuizQuestionItem } from "./QuizQuestionItem";
import { Question, QuestionDifficulty } from "@/types/quiz";
import { motion } from "framer-motion";
import { useSwipeable } from "react-swipeable";

interface QuizOutputProps {
  questions: Question[];
}

export const Quiz = ({ questions }: { questions: Question[] }) => {
  if (!questions || questions.length === 0) return null;
  
  return (
    <div className="space-y-6">
      {questions.map((question, index) => (
        <QuizQuestionItem 
          key={index}
          question={question}
          index={index}
        />
      ))}
    </div>
  );
};

export const QuizOutput = ({ questions }: QuizOutputProps) => {
  const [duration, setDuration] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const questionsPerPage = 3; // Show fewer questions per page on mobile
  const totalPages = Math.ceil((questions?.length || 0) / questionsPerPage);

  const handlePublish = async () => {
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
        .update({ 
          published: true,
          duration_minutes: duration 
        })
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

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Generated Quiz", margin, yPosition);
    yPosition += 15;

    if (duration > 0) {
      doc.setFontSize(12);
      doc.text(`Duration: ${duration} minutes`, margin, yPosition);
      yPosition += 10;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    questions.forEach((question, index) => {
      if (yPosition > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        yPosition = margin;
      }

      const questionText = `${index + 1}. [${question.points} pts] ${question.question}`;
      const questionLines = doc.splitTextToSize(questionText, pageWidth - (margin * 2));
      doc.text(questionLines, margin, yPosition);
      yPosition += 10 * questionLines.length;

      Object.entries(question.options).forEach(([letter, text]) => {
        if (yPosition > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          yPosition = margin;
        }
        const optionText = `${letter}. ${text}`;
        const optionLines = doc.splitTextToSize(optionText, pageWidth - (margin * 2) - 10);
        doc.text(optionLines, margin + 10, yPosition);
        yPosition += 7 * optionLines.length;
      });

      const answerText = `Answer: ${question.correctAnswer}`;
      const answerLines = doc.splitTextToSize(answerText, pageWidth - (margin * 2));
      doc.text(answerLines, margin, yPosition);
      yPosition += 10 * answerLines.length;

      if (question.explanation) {
        const explanationText = `Explanation: ${question.explanation}`;
        const explanationLines = doc.splitTextToSize(explanationText, pageWidth - (margin * 2));
        doc.text(explanationLines, margin, yPosition);
        yPosition += 10 * explanationLines.length;
      }

      yPosition += 10;
    });

    doc.save('quiz.pdf');
  };

  const handleChangePage = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      handleChangePage(currentPage + 1);
    } else if (direction === 'right') {
      handleChangePage(currentPage - 1);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
    trackMouse: false,
    swipeDuration: 500,
    preventScrollOnSwipe: true,
  });

  if (!questions || questions.length === 0) return null;

  const startIdx = currentPage * questionsPerPage;
  const endIdx = Math.min(startIdx + questionsPerPage, questions.length);
  const currentQuestions = questions.slice(startIdx, endIdx);

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
        
        <div className="w-full touch-manipulation" {...swipeHandlers}>
          <div className="space-y-6 mt-4">
            {currentQuestions.map((question: Question, index: number) => (
              <motion.div
                key={startIdx + index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <QuizQuestionItem 
                  question={question}
                  index={startIdx + index}
                />
              </motion.div>
            ))}
          </div>
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <div className="text-sm text-gray-500">
              Page {currentPage + 1} of {totalPages}
            </div>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleChangePage(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === currentPage 
                      ? "bg-primary" 
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
