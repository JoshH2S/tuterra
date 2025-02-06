
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FileUpload from "@/components/FileUpload";
import { TopicInput } from "@/components/quiz-generation/TopicInput";
import { QuizGenerationHeader } from "@/components/quiz-generation/QuizGenerationHeader";
import { useQuizGeneration } from "@/hooks/useQuizGeneration";
import { toast } from "@/hooks/use-toast";
import { Download } from "lucide-react";
import jsPDF from "jspdf";

interface Topic {
  name: string;
  questionCount: number;
}

const QuizGeneration = () => {
  const [topics, setTopics] = useState<Topic[]>([{ name: "", questionCount: 1 }]);
  const [quizTitle, setQuizTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { generateQuiz, isGenerating, generatedQuestions } = useQuizGeneration();

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
  };

  const handleTopicChange = (index: number, field: keyof Topic, value: string | number) => {
    const newTopics = [...topics];
    newTopics[index] = {
      ...newTopics[index],
      [field]: field === "questionCount" ? Number(value) : value,
    };
    setTopics(newTopics);
  };

  const handleAddTopic = () => {
    setTopics([...topics, { name: "", questionCount: 1 }]);
  };

  const handleGenerateQuiz = async () => {
    if (!selectedFile || !quizTitle || topics.some(t => !t.name)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await generateQuiz(
        quizTitle,
        selectedFile,
        topics
      );
    } catch (error) {
      console.error('Failed to generate quiz:', error);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let yPosition = margin;

    // Add title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(quizTitle, margin, yPosition);
    yPosition += 15;

    // Add questions
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    generatedQuestions.forEach((question, index) => {
      // Add question
      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}. ${question.question}`, margin, yPosition);
      yPosition += 10;

      // Add options
      doc.setFont("helvetica", "normal");
      question.options.forEach((option, optIndex) => {
        const optionLabel = String.fromCharCode(65 + optIndex); // A, B, C, D
        doc.text(`${optionLabel}. ${option}`, margin + 5, yPosition);
        yPosition += 7;
      });

      yPosition += 10;

      // Check if we need a new page
      if (yPosition > doc.internal.pageSize.height - margin) {
        doc.addPage();
        yPosition = margin;
      }
    });

    // Add answer key at the end
    doc.addPage();
    yPosition = margin;
    doc.setFont("helvetica", "bold");
    doc.text("Answer Key", margin, yPosition);
    yPosition += 10;
    doc.setFont("helvetica", "normal");
    generatedQuestions.forEach((question, index) => {
      doc.text(`${index + 1}. ${question.correctAnswer}`, margin, yPosition);
      yPosition += 7;
    });

    doc.save(`${quizTitle.toLowerCase().replace(/\s+/g, '-')}-quiz.pdf`);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <QuizGenerationHeader />
      
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Title</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Enter quiz title"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Material</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFileSelect={handleFileSelect}
                acceptedTypes=".pdf,.doc,.docx,.txt"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Topics and Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {topics.map((topic, index) => (
                <TopicInput
                  key={index}
                  topic={topic}
                  index={index}
                  onChange={handleTopicChange}
                />
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTopic}
                className="w-full"
              >
                Add Another Topic
              </Button>

              <Button
                onClick={handleGenerateQuiz}
                className="w-full"
                disabled={isGenerating || !quizTitle || topics.some(t => !t.name)}
              >
                {isGenerating ? "Generating Quiz..." : "Generate Quiz"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {generatedQuestions.length > 0 && (
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Generated Quiz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {generatedQuestions.map((question, index) => (
                <div key={index} className="space-y-4">
                  <p className="font-semibold">
                    {index + 1}. {question.question}
                  </p>
                  <div className="space-y-2 pl-4">
                    {question.options.map((option, optIndex) => (
                      <p key={optIndex} className={
                        String.fromCharCode(65 + optIndex) === question.correctAnswer
                          ? "text-green-600 font-medium"
                          : ""
                      }>
                        {String.fromCharCode(65 + optIndex)}. {option}
                      </p>
                    ))}
                  </div>
                </div>
              ))}

              <Button
                onClick={handleDownloadPDF}
                className="w-full"
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Quiz PDF
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QuizGeneration;
