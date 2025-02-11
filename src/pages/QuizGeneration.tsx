
import { QuizGenerationHeader } from "@/components/quiz-generation/QuizGenerationHeader";
import { TopicsCard } from "@/components/quiz-generation/TopicsCard";
import { CourseMaterialUpload } from "@/components/lesson-planning/CourseMaterialUpload";
import { QuizOutput } from "@/components/quiz-generation/QuizOutput";
import { QuizDurationInput } from "@/components/quiz-generation/QuizDurationInput";
import { useQuizGeneration } from "@/hooks/useQuizGeneration";
import { useCourseTemplates } from "@/hooks/useCourseTemplates";

const QuizGeneration = () => {
  const {
    selectedFile,
    topics,
    isProcessing,
    quizQuestions,
    contentLength,
    duration,
    handleFileSelect,
    addTopic,
    updateTopic,
    handleSubmit,
    setDuration,
  } = useQuizGeneration();

  const { createTemplate } = useCourseTemplates();

  const handleSaveTemplate = async () => {
    if (quizQuestions.length > 0) {
      await createTemplate(
        `Quiz Template - ${topics.map(t => t.description).join(", ")}`,
        {
          type: "quiz",
          topics,
          questions: quizQuestions,
          duration
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <QuizGenerationHeader onSaveTemplate={quizQuestions.length > 0 ? handleSaveTemplate : undefined} />
        
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-8">
            <TopicsCard 
              topics={topics}
              onTopicChange={updateTopic}
              onAddTopic={addTopic}
              onSubmit={handleSubmit}
              isProcessing={isProcessing}
              isSubmitDisabled={isProcessing || !selectedFile || topics.some(topic => !topic.description)}
            />
            <QuizDurationInput 
              duration={duration}
              onChange={setDuration}
            />
            <CourseMaterialUpload 
              onFileSelect={handleFileSelect}
              contentLength={contentLength}
            />
          </div>
          
          <QuizOutput
            questions={quizQuestions}
          />
        </div>
      </main>
    </div>
  );
};

export default QuizGeneration;
