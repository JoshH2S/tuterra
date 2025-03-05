
import { QuizGenerationHeader } from "@/components/quiz-generation/QuizGenerationHeader";
import { TopicsCard } from "@/components/quiz-generation/TopicsCard";
import { CourseMaterialUpload } from "@/components/lesson-planning/CourseMaterialUpload";
import { QuizOutput } from "@/components/quiz-generation/QuizOutput";
import { QuizDurationInput } from "@/components/quiz-generation/QuizDurationInput";
import { useQuizGeneration } from "@/hooks/quiz/useQuizGeneration";
import { useCourseTemplates } from "@/hooks/useCourseTemplates";
import { useCourses } from "@/hooks/useCourses";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionDifficulty } from "@/types/quiz";

const QuizGeneration = () => {
  const {
    selectedFile,
    topics,
    isProcessing,
    quizQuestions,
    contentLength,
    duration,
    selectedCourseId,
    difficulty,
    handleFileSelect,
    addTopic,
    updateTopic,
    handleSubmit,
    setDuration,
    setSelectedCourseId,
    setDifficulty,
  } = useQuizGeneration();

  const { createTemplate } = useCourseTemplates();
  const { courses, isLoading: isLoadingCourses } = useCourses();

  const handleSaveTemplate = async () => {
    if (quizQuestions.length > 0) {
      await createTemplate(
        `Quiz Template - ${topics.map(t => t.description).join(", ")}`,
        {
          type: "quiz",
          topics,
          questions: quizQuestions,
          duration,
          difficulty
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
            <CourseMaterialUpload 
              onFileSelect={handleFileSelect}
              contentLength={contentLength}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Quiz Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Course</label>
                  <Select
                    value={selectedCourseId}
                    onValueChange={setSelectedCourseId}
                    disabled={isLoadingCourses}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Education Level</label>
                  <Select
                    value={difficulty}
                    onValueChange={(value: QuestionDifficulty) => setDifficulty(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="middle_school">Middle School</SelectItem>
                      <SelectItem value="high_school">High School</SelectItem>
                      <SelectItem value="university">University</SelectItem>
                      <SelectItem value="post_graduate">Post Graduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <TopicsCard 
              topics={topics}
              onTopicChange={updateTopic}
              onAddTopic={addTopic}
              onSubmit={handleSubmit}
              isProcessing={isProcessing}
              isSubmitDisabled={isProcessing || !selectedFile || !selectedCourseId || topics.some(topic => !topic.description)}
            />
            <QuizDurationInput 
              duration={duration}
              onChange={setDuration}
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
