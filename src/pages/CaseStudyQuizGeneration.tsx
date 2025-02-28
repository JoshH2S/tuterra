
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Question, QuestionDifficulty } from "@/types/quiz";
import { QuizOutput } from "@/components/quiz-generation/QuizOutput";
import { Topic } from "@/types/quiz";
import { TopicsForm } from "@/components/case-study-quiz/TopicsForm";
import { CourseSelection } from "@/components/case-study-quiz/CourseSelection";
import { GenerateButton } from "@/components/case-study-quiz/GenerateButton";
import { NewsSources } from "@/components/case-study-quiz/NewsSources";
import { useGenerateQuiz } from "@/hooks/case-study-quiz/useGenerateQuiz";

const CaseStudyQuizGeneration = () => {
  const [topics, setTopics] = useState<Topic[]>([{ description: "", numQuestions: 3 }]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("high_school");
  
  const { 
    isGenerating, 
    quizQuestions, 
    newsSources, 
    generateQuiz 
  } = useGenerateQuiz();

  const handleGenerate = async () => {
    await generateQuiz(topics, selectedCourseId, difficulty);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Generate Real-World Case Study Quiz</CardTitle>
              <CardDescription>Creates case studies based on current news stories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <CourseSelection
                selectedCourseId={selectedCourseId}
                setSelectedCourseId={setSelectedCourseId}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
              />

              <TopicsForm
                topics={topics}
                setTopics={setTopics}
              />

              <GenerateButton
                onClick={handleGenerate}
                disabled={isGenerating || !topics[0].description || !selectedCourseId}
                isGenerating={isGenerating}
              />
            </CardContent>
          </Card>

          <NewsSources newsSources={newsSources} />
        </div>

        <QuizOutput questions={quizQuestions} />
      </div>
    </div>
  );
};

export default CaseStudyQuizGeneration;
