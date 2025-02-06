
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FileUpload from "@/components/FileUpload";
import { TopicInput } from "@/components/quiz-generation/TopicInput";
import { QuizGenerationHeader } from "@/components/quiz-generation/QuizGenerationHeader";
import { useQuizGeneration } from "@/hooks/useQuizGeneration";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { toast } from "@/hooks/use-toast";

interface Topic {
  name: string;
  questionCount: number;
}

const QuizGeneration = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [topics, setTopics] = useState<Topic[]>([{ name: "", questionCount: 1 }]);
  const [quizTitle, setQuizTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { generateQuiz, isGenerating } = useQuizGeneration();

  if (!courseId) {
    toast({
      title: "Error",
      description: "No course ID provided.",
      variant: "destructive"
    });
    navigate("/courses");
    return null;
  }

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
      const quizId = await generateQuiz(
        courseId,
        quizTitle,
        selectedFile,
        topics
      );
      
      navigate(`/courses/quiz/${quizId}`);
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <QuizGenerationHeader />
      
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
  );
};

// Wrap the component with ProtectedRoute
export default () => (
  <ProtectedRoute>
    <QuizGeneration />
  </ProtectedRoute>
);
