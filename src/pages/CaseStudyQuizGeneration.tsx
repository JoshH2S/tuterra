
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuizGeneration } from "@/hooks/quiz/useQuizGeneration";
import { QuizOutput } from "@/components/quiz-generation/QuizOutput";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const CaseStudyQuizGeneration = () => {
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { quizQuestions, setQuizQuestions } = useQuizGeneration();
  const [context, setContext] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/generate-case-study-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          topic,
          context: context.trim() || undefined 
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
                <CardTitle>Enter Topic</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    placeholder="e.g., Artificial Intelligence in Healthcare"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
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
