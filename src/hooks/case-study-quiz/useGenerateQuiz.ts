
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Topic, Question, QuestionDifficulty, CaseStudyQuestion, QuizMetadata } from "@/types/quiz";
import { useQuizSave } from "@/hooks/quiz/useQuizSave";

interface NewsSource {
  title: string;
  source: string;
  url: string;
}

export const useGenerateQuiz = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [newsSources, setNewsSources] = useState<NewsSource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [quizMetadata, setQuizMetadata] = useState<QuizMetadata | null>(null);
  const [quizId, setQuizId] = useState<string | null>(null); // Add state for quiz ID
  const { saveQuizToDatabase } = useQuizSave();

  const generateQuiz = async (
    topics: Topic[],
    selectedCourseId: string,
    difficulty: QuestionDifficulty
  ) => {
    if (!topics[0].description || !selectedCourseId) {
      toast({
        title: "Error",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return false;
    }

    setIsGenerating(true);
    setQuizQuestions([]);
    setNewsSources([]);
    setError(null);
    setQuizMetadata(null);
    setQuizId(null); // Reset quiz ID

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

      console.log("Sending request to generate case study quiz with topics:", topics);
      
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
      console.log("Received quiz data:", data);
      
      if (!data.quizQuestions || !Array.isArray(data.quizQuestions)) {
        throw new Error("Invalid quiz data received from server");
      }
      
      // Validate and normalize question data
      const validatedQuestions = data.quizQuestions.map((q: any) => ({
        question: q.question || '',
        options: {
          A: q.options?.A || '',
          B: q.options?.B || '',
          C: q.options?.C || '',
          D: q.options?.D || ''
        },
        correctAnswer: q.correctAnswer || '',
        topic: q.topic || '',
        points: q.points || 1,
        explanation: q.explanation || '',
        difficulty: difficulty, // Ensure difficulty is set
        
        // Include case study data if available
        ...(q.caseStudy ? {
          caseStudy: {
            source: q.caseStudy.source || '',
            date: q.caseStudy.date || '',
            context: q.caseStudy.context || '',
            url: q.caseStudy.url || ''
          }
        } : {}),
        
        // Include analysis type if available
        ...(q.analysisType ? { analysisType: q.analysisType } : {})
      }));
      
      setQuizQuestions(validatedQuestions);
      
      // Store news sources if available
      if (data.metadata && Array.isArray(data.metadata.newsSourcesUsed)) {
        setNewsSources(data.metadata.newsSourcesUsed);
      }
      
      // Store quiz metadata
      if (data.metadata) {
        setQuizMetadata({
          courseId: data.metadata.courseId || selectedCourseId,
          difficulty: difficulty,
          topics: data.metadata.topics || topics.map(t => t.description),
          totalPoints: data.metadata.totalPoints || validatedQuestions.reduce((sum, q) => sum + q.points, 0),
          estimatedDuration: data.metadata.estimatedDuration || 30
        });
      }

      // Generate a default title based on topics
      const defaultTitle = `Case Study: ${topics[0].description}${topics.length > 1 ? ' & More' : ''}`;

      // Save quiz to database using the shared hook
      try {
        const estimatedDuration = data.metadata?.estimatedDuration || 30;
        const { success, quizId } = await saveQuizToDatabase(
          validatedQuestions, 
          topics, 
          estimatedDuration,
          defaultTitle, // Add a default title
          selectedCourseId
        );

        if (success && quizId) {
          console.log("Quiz saved with ID:", quizId);
          setQuizId(quizId); // Store the quiz ID
          
          toast({
            title: "Success",
            description: "Case study quiz generated and saved successfully!",
          });
        } else {
          console.error("No quiz ID returned from saveQuizToDatabase");
          
          toast({
            title: "Warning",
            description: "Quiz generated but may not be properly saved. Saving issue detected.",
            variant: "destructive",
          });
        }
      } catch (saveError) {
        console.error("Error saving quiz to database:", saveError);
        // We don't throw here as we want to show the generated quiz even if saving fails
        toast({
          title: "Warning",
          description: "Quiz generated but couldn't be saved. Try again later.",
          variant: "destructive",
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error generating case study quiz:', error);
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error
        ? String(error.message)
        : "Failed to generate quiz. Please try again.";
      
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    quizQuestions,
    newsSources,
    quizMetadata,
    quizId, // Return the quiz ID
    error,
    generateQuiz
  };
};
