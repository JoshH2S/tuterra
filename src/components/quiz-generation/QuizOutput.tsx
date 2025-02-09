
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import jsPDF from "jspdf";
import { useState } from "react";
import { QuizDurationInput } from "./QuizDurationInput";
import { QuizActions } from "./QuizActions";
import { QuizQuestionItem } from "./QuizQuestionItem";

interface Option {
  A: string;
  B: string;
  C: string;
  D: string;
}

interface Question {
  question: string;
  options: Option;
  correctAnswer: string;
  topic: string;
  points: number;
  explanation?: string;
}

interface QuizOutputProps {
  questions: Question[];
}

export const QuizOutput = ({ questions }: QuizOutputProps) => {
  const [duration, setDuration] = useState<number>(0);

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

    // Set title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Generated Quiz", margin, yPosition);
    yPosition += 15;

    // Add duration if set
    if (duration > 0) {
      doc.setFontSize(12);
      doc.text(`Duration: ${duration} minutes`, margin, yPosition);
      yPosition += 10;
    }

    // Add questions
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    questions.forEach((question, index) => {
      // Check if we need a new page
      if (yPosition > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        yPosition = margin;
      }

      // Add question
      const questionText = `${index + 1}. [${question.points} pts] ${question.question}`;
      const questionLines = doc.splitTextToSize(questionText, pageWidth - (margin * 2));
      doc.text(questionLines, margin, yPosition);
      yPosition += 10 * questionLines.length;

      // Add options
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

      // Add answer and explanation
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

      yPosition += 10; // Add space between questions
    });

    doc.save('quiz.pdf');
  };

  if (!questions || questions.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Generated Quiz</CardTitle>
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
        <div className="space-y-6">
          {questions.map((question, index) => (
            <QuizQuestionItem 
              key={index}
              question={question}
              index={index}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
