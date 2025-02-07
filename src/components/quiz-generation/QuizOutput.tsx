
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";

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
}

interface QuizOutputProps {
  questions: Question[];
}

export const QuizOutput = ({ questions }: QuizOutputProps) => {
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

      // Add answer
      const answerText = `Answer: ${question.correctAnswer}`;
      const answerLines = doc.splitTextToSize(answerText, pageWidth - (margin * 2));
      doc.text(answerLines, margin, yPosition);
      yPosition += (10 * answerLines.length) + 10;
    });

    doc.save('quiz.pdf');
  };

  if (!questions || questions.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Generated Quiz</CardTitle>
        <Button 
          onClick={handleDownloadPDF}
          variant="outline"
          size="sm"
        >
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="font-medium">{index + 1}.</span>
                <div className="flex-1">
                  <p className="font-medium">{question.question}</p>
                  <div className="mt-2 space-y-1">
                    {Object.entries(question.options).map(([letter, text]) => (
                      <div key={letter} className="flex items-start gap-2">
                        <span className="text-sm font-medium min-w-[20px]">{letter}.</span>
                        <p className="text-sm">{text}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Answer: {question.correctAnswer}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <span>Topic: {question.topic}</span>
                    <span>•</span>
                    <span>{question.points} points</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
