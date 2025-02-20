
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuizGeneration } from "@/hooks/quiz/useQuizGeneration";
import { QuizOutput } from "@/components/quiz-generation/QuizOutput";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCourses } from "@/hooks/useCourses";

interface TopicInput {
  description: string;
  numQuestions: number;
}

const CaseStudyQuizGeneration = () => {
  const [topics, setTopics] = useState<TopicInput[]>([
    { description: "", numQuestions: 3 }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { quizQuestions, setQuizQuestions } = useQuizGeneration();
  const [context, setContext] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const { courses, isLoading: isLoadingCourses } = useCourses();

  const addTopic = () => {
    setTopics([...topics, { description: "", numQuestions: 3 }]);
  };

  const removeTopic = (index: number) => {
    if (topics.length > 1) {
      const newTopics = topics.filter((_, i) => i !== index);
      setTopics(newTopics);
    }
  };

  const updateTopic = (index: number, field: keyof TopicInput, value: string | number) => {
    const newTopics = [...topics];
    newTopics[index] = {
      ...newTopics[index],
      [field]: field === "numQuestions" ? Number(value) : value
    };
    setTopics(newTopics);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (topics.some(topic => !topic.description.trim())) {
      toast({
        title: "Error",
        description: "Please fill in all topic fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      const response = await fetch('https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/generate-case-study-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
          topics,
          context: context.trim() || undefined,
          courseId: selectedCourseId || undefined
        }),
      });

      if (!response.ok) throw new Error('Failed to generate quiz');

      const data = await response.json();
      setQuizQuestions(data.quizQuestions);
      
      toast({
        title: "Success",
        description: "Case study quiz generated successfully!",
      });
    } catch (error) {
      console.error('Error generating case study quiz:', error);
      toast({
        title: "Error",
        description: "Failed to generate case study quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Case Study Quiz Generation</h1>
          <p className="text-gray-600">Generate quizzes based on recent events and case studies</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <label className="font-medium text-sm">Course (Optional)</label>
                    <Select
                      value={selectedCourseId}
                      onValueChange={setSelectedCourseId}
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

                  <div className="space-y-4">
                    {topics.map((topic, index) => (
                      <div key={index} className="space-y-4 p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Topic {index + 1}</h3>
                          {topics.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTopic(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <Input
                          placeholder="Enter topic"
                          value={topic.description}
                          onChange={(e) => updateTopic(index, "description", e.target.value)}
                        />
                        <div className="flex items-center gap-2">
                          <label className="text-sm">Number of questions:</label>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={topic.numQuestions}
                            onChange={(e) => updateTopic(index, "numQuestions", e.target.value)}
                            className="w-24"
                          />
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={addTopic}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Topic
                    </Button>
                  </div>

                  <Textarea
                    placeholder="Optional: Add specific focus areas or context (e.g., ethical implications, economic impact)"
                    className="h-32"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                  />
                  
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Quiz...
                      </>
                    ) : (
                      'Generate Case Study Quiz'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <QuizOutput questions={quizQuestions} />
        </div>
      </main>
    </div>
  );
};

export default CaseStudyQuizGeneration;
