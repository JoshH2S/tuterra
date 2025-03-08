
import jsPDF from "jspdf";
import { Question } from "@/types/quiz";

export const usePdfGeneration = (questions: Question[], duration: number) => {
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

  return { handleDownloadPDF };
};
