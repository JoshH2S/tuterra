
import { Navigation } from "@/components/Navigation";
import { QuizGenerationHeader } from "@/components/quiz-generation/QuizGenerationHeader";
import { TopicsCard } from "@/components/quiz-generation/TopicsCard";
import { CourseMaterialUpload } from "@/components/lesson-planning/CourseMaterialUpload";
import { QuizOutput } from "@/components/quiz-generation/QuizOutput";
import { useQuizGeneration } from "@/hooks/useQuizGeneration";

const QuizGeneration = () => {
  const {
    selectedFile,
    topics,
    isProcessing,
    quizQuestions,
    contentLength,
    handleFileSelect,
    addTopic,
    updateTopic,
    handleSubmit,
  } = useQuizGeneration();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <QuizGenerationHeader />
        
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
