import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Topic, Question, QuestionDifficulty, CaseStudyQuestion, QuizMetadata } from "@/types/quiz";
import { useQuizSave } from "@/hooks/quiz/useQuizSave";
import { useUserCredits } from "@/hooks/useUserCredits";
import { useSubscription } from "@/hooks/useSubscription";

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
  const [quizId, setQuizId] = useState<string | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({
    stage: 'preparing' as 'preparing' | 'analyzing' | 'generating' | 'saving' | 'complete' | 'error',
    percentComplete: 0,
    message: 'Preparing to generate quiz...'
  });
  const { saveQuizToDatabase } = useQuizSave();
  const { checkCredits, decrementCredits } = useUserCredits();
  const { subscription } = useSubscription();

  const isSTEMTopic = (topic: string): boolean => {
    const stemKeywords = [
      "math", "mathematics", "algebra", "calculus", "geometry", "trigonometry",
      "physics", "chemistry", "biology", "computer science", "cs", "programming",
      "engineering", "statistics", "probability", "economics", "data science",
      "machine learning", "artificial intelligence", "quantum", "algorithm"
    ];
    
    const lowerTopic = topic.toLowerCase();
    return stemKeywords.some(keyword => lowerTopic.includes(keyword));
  };

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

    if (subscription.tier === 'free') {
      const hasCredits = await checkCredits('quiz_credits');
      if (!hasCredits) {
        setShowUpgradePrompt(true);
        toast({
          title: "No credits remaining",
          description: "You have used all your free quiz credits. Please upgrade to continue.",
          variant: "destructive",
        });
        return false;
      }
    }

    setIsGenerating(true);
    setQuizQuestions([]);
    setNewsSources([]);
    setError(null);
    setQuizMetadata(null);
    setQuizId(null);
    
    setGenerationProgress({
      stage: 'preparing',
      percentComplete: 5,
      message: 'Preparing to generate quiz...'
    });

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

      const hasStemTopics = topics.some(topic => isSTEMTopic(topic.description));
      console.log("STEM topics detected:", hasStemTopics);
      
      setGenerationProgress({
        stage: 'analyzing',
        percentComplete: 15,
        message: `Analyzing ${hasStemTopics ? 'STEM' : ''} topics and gathering news sources...`
      });

      console.log("Sending request to generate case study quiz with topics:", topics);
      
      setGenerationProgress({
        stage: 'generating',
        percentComplete: 30,
        message: `Generating ${hasStemTopics ? 'STEM-enhanced' : ''} case study questions...`
      });
      
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
            tier: subscription.tier,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        setGenerationProgress({
          stage: 'error',
          percentComplete: 0,
          message: `Failed to generate quiz: ${errorData.error || 'Unknown error'}`
        });
        throw new Error(`Failed to generate quiz: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log("Received quiz data:", data);
      
      setGenerationProgress({
        stage: 'saving',
        percentComplete: 75,
        message: `Questions generated successfully. Saving quiz...`
      });
      
      if (!data.quizQuestions || !Array.isArray(data.quizQuestions)) {
        throw new Error("Invalid quiz data received from server");
      }
      
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
        difficulty: difficulty,
        
        ...(q.caseStudy ? {
          caseStudy: {
            source: q.caseStudy.source || '',
            date: q.caseStudy.date || '',
            context: q.caseStudy.context || '',
            url: q.caseStudy.url || ''
          }
        } : {}),
        
        ...(q.analysisType ? { analysisType: q.analysisType } : {}),
        
        ...(q.formula ? { formula: q.formula } : {}),
        
        ...(q.visualizationPrompt ? { visualizationPrompt: q.visualizationPrompt } : {}),
        
        ...(q.generatedBy ? { generatedBy: q.generatedBy } : {})
      }));
      
      setQuizQuestions(validatedQuestions);
      
      if (data.metadata && Array.isArray(data.metadata.newsSourcesUsed)) {
        setNewsSources(data.metadata.newsSourcesUsed);
      }
      
      const enhancedMetadata = {
        courseId: data.metadata.courseId || selectedCourseId,
        difficulty: difficulty,
        topics: data.metadata.topics || topics.map(t => t.description),
        totalPoints: data.metadata.totalPoints || validatedQuestions.reduce((sum, q) => sum + q.points, 0),
        estimatedDuration: data.metadata.estimatedDuration || 30,
        stemTopicsDetected: data.metadata.stemTopicsDetected || hasStemTopics,
        modelUsed: data.metadata.modelUsed || 'openai',
      };
      
      setQuizMetadata(enhancedMetadata);

      const modelInfo = data.metadata?.modelUsed === 'deepseek' ? 'STEM-Enhanced ' : '';
      const defaultTitle = `${modelInfo}Case Study: ${topics[0].description}${topics.length > 1 ? ' & More' : ''}`;

      try {
        const estimatedDuration = data.metadata?.estimatedDuration || 30;
        
        const { success, quizId } = await saveQuizToDatabase(
          validatedQuestions,
          defaultTitle,
          estimatedDuration,
          selectedCourseId === 'none' ? undefined : selectedCourseId
        );

        if (success && quizId) {
          console.log("Quiz saved with ID:", quizId);
          setQuizId(quizId);
          
          if (subscription.tier === 'free') {
            await decrementCredits('quiz_credits');
          }
          
          setGenerationProgress({
            stage: 'complete',
            percentComplete: 100,
            message: `Quiz generated and saved successfully!`
          });
          
          toast({
            title: "Success",
            description: `${modelInfo}Case study quiz generated and saved successfully!`,
          });
        } else {
          console.error("No quiz ID returned from saveQuizToDatabase");
          
          setGenerationProgress({
            stage: 'error',
            percentComplete: 75,
            message: `Quiz generated but could not be saved completely. Try again.`
          });
          
          toast({
            title: "Warning",
            description: "Quiz generated but may not be properly saved. Saving issue detected.",
            variant: "destructive",
          });
        }
      } catch (saveError) {
        console.error("Error saving quiz to database:", saveError);
        setGenerationProgress({
          stage: 'error',
          percentComplete: 75,
          message: `Quiz generated but couldn't be saved. Database error.`
        });
        
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
      
      setGenerationProgress({
        stage: 'error',
        percentComplete: 0,
        message: errorMessage
      });
      
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

  const handleRetry = () => {
    setGenerationProgress({
      stage: 'preparing',
      percentComplete: 0,
      message: 'Ready to try again'
    });
    setError(null);
  };

  return {
    isGenerating,
    quizQuestions,
    newsSources,
    quizMetadata,
    quizId,
    error,
    showUpgradePrompt,
    setShowUpgradePrompt,
    generateQuiz,
    generationProgress,
    handleRetry
  };
};
