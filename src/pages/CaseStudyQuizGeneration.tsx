
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, ExternalLink, NewspaperIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCourses } from "@/hooks/useCourses";
import { Question, QuestionDifficulty } from "@/types/quiz";
import { QuizOutput } from "@/components/quiz-generation/QuizOutput";
import { Topic } from "@/types/quiz-generation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuizSave } from "@/hooks/quiz/useQuizSave";

interface NewsSource {
  title: string;
  source: string;
  url: string;
}

const CaseStudyQuizGeneration = () => {
  const [topics, setTopics] = useState<Topic[]>([{ description: "", numQuestions: 3 }]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("high_school");
  const [newsSources, setNewsSources] = useState<NewsSource[]>([]);
  const { courses, isLoading: isLoadingCourses } = useCourses();
  const { saveQuizToDatabase } = useQuizSave();

  const addTopic = () => {
    setTopics([...topics, { description: "", numQuestions: 3 }]);
  };

  const updateTopic = (index: number, field: keyof Topic, value: string | number) => {
    const newTopics = [...topics];
    newTopics[index] = {
      ...newTopics[index],
      [field]: value
    };
    setTopics(newTopics);
  };

  const handleGenerate = async () => {
    if (!topics[0].description || !selectedCourseId) {
      toast({
        title: "Error",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setQuizQuestions([]);
    setNewsSources([]);

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
            topics,
            courseId: selectedCourseId,
            difficulty,
            teacherName: teacherData ? `${teacherData.first_name} ${teacherData.last_name}` : undefined,
            school: teacherData?.school,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(`Failed to generate quiz: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      setQuizQuestions(data.quizQuestions);
      
      // Store news sources if available
      if (data.metadata && data.metadata.newsSourcesUsed) {
        setNewsSources(data.metadata.newsSourcesUsed);
      }

      // Save quiz to database using the shared hook
      const success = await saveQuizToDatabase(
        data.quizQuestions, 
        topics, 
        30, // Default duration
        selectedCourseId
      );

      if (success) {
        toast({
          title: "Success",
          description: "Case study quiz generated and saved successfully!",
        });
      }
    } catch (error) {
      console.error('Error generating case study quiz:', error);
      toast({
        title: "Error",
        description: typeof error === 'object' && error !== null && 'message' in error
          ? String(error.message)
          : "Failed to generate quiz. Please try again.",
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
              <CardTitle>Generate Real-World Case Study Quiz</CardTitle>
              <CardDescription>Creates case studies based on current news stories</CardDescription>
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
                <label htmlFor="difficulty" className="text-sm font-medium">Education Level</label>
                <Select
                  value={difficulty}
                  onValueChange={(value: QuestionDifficulty) => setDifficulty(value)}
                >
                  <SelectTrigger>
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

              {topics.map((topic, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Topic {index + 1}</label>
                    <Input
                      value={topic.description}
                      onChange={(e) => updateTopic(index, "description", e.target.value)}
                      placeholder="Enter topic to cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Number of Questions</label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={topic.numQuestions}
                      onChange={(e) => updateTopic(index, "numQuestions", parseInt(e.target.value))}
                      className="w-24"
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addTopic}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Topic
              </Button>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !topics[0].description || !selectedCourseId}
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

          {newsSources.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <NewspaperIcon className="h-5 w-5" />
                  News Sources Used
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {newsSources.map((source, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{source.title}</p>
                        <p className="text-sm text-muted-foreground">{source.source}</p>
                      </div>
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <QuizOutput questions={quizQuestions} />
      </div>
    </div>
  );
};

export default CaseStudyQuizGeneration;
