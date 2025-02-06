
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";

interface Question {
  question: string;
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
                  <p className="text-sm text-muted-foreground mt-1">
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
