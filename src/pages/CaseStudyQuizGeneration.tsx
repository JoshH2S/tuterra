
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCourses } from "@/hooks/useCourses";
import { Question } from "@/types/quiz";
import { QuizOutput } from "@/components/quiz-generation/QuizOutput";

interface Topic {
  description: string;
  numQuestions: number;
}

const CaseStudyQuizGeneration = () => {
  const [topic, setTopic] = useState<string>("");
  const [numQuestions, setNumQuestions] = useState<number>(6);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const { courses, isLoading: isLoadingCourses } = useCourses();

  const handleGenerate = async () => {
    if (!topic || !selectedCourseId) {
      toast({
        title: "Error",
        description: "Please fill out all fields",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setQuizQuestions([]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session');
      }

      const { data: teacherData } = await supabase
        .from('profiles')
        .select('first_name, last_name, school')
        .eq('id', session.user.id)
        .single();

      const response = await fetch(
        'https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/generate-case-study-quiz',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            topic,
            numQuestions,
            courseId: selectedCourseId,
            teacherName: teacherData ? `${teacherData.first_name} ${teacherData.last_name}` : undefined,
            school: teacherData?.school,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }

      const data = await response.json();
      setQuizQuestions(data.quizQuestions);

      // Save quiz to database
      const quizData = {
        title: `Case Study Quiz - ${topic}`,
        teacher_id: session.user.id,
        course_id: selectedCourseId,
      };

      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert(quizData)
        .select()
        .single();

      if (quizError) throw quizError;

      const questionsToInsert = data.quizQuestions.map((q: Question) => ({
        quiz_id: quiz.id,
        question: q.question,
        correct_answer: q.correctAnswer,
        topic: q.topic,
        points: q.points,
        options: q.options,
        difficulty: q.difficulty || 'intermediate' // Add default difficulty
      }));

      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      toast({
        title: "Success",
        description: "Case study quiz generated successfully!",
      });
    } catch (error) {
      console.error('Error generating case study quiz:', error);
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Generate Case Study Quiz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="course" className="text-sm font-medium">Select Course</label>
                <Select
                  value={selectedCourseId}
                  onValueChange={setSelectedCourseId}
                  disabled={isLoadingCourses}
                >
                  <SelectTrigger>
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

              <div className="space-y-2">
                <label htmlFor="topic" className="text-sm font-medium">Topic</label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter the topic for the case study"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="numQuestions" className="text-sm font-medium">Number of Questions</label>
                <Input
                  id="numQuestions"
                  type="number"
                  min={1}
                  max={10}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !topic || !selectedCourseId}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  'Generate Quiz'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <QuizOutput questions={quizQuestions} />
      </div>
    </div>
  );
};

export default CaseStudyQuizGeneration;
