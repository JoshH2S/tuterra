
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Topic, Question as QuizQuestion, QuestionDifficulty, QuizMetadata } from "@/types/quiz";
import { Question as GenerationQuestion } from "@/types/quiz-generation";
import { useQuizSave } from "@/hooks/quiz/useQuizSave";
import { useNewsSourcesState } from "./useNewsSourcesState";
import { useQuizMetadata } from "./useQuizMetadata";
import { useGenerationProgress, GenerationStage } from "./useGenerationProgress";
import { useQuizCredits } from "./useQuizCredits";
import { isSTEMTopic } from "./utils/stemTopicDetector";
import { shuffleQuestionsOptions } from "@/utils/quiz-helpers";

export const useGenerateQuiz = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const { newsSources, setNewsSources } = useNewsSourcesState();
  const { quizMetadata, quizId, setQuizMetadata, setQuizId } = useQuizMetadata();
  const { 
    generationProgress, 
    updateGenerationProgress, 
    resetProgress 
  } = useGenerationProgress();
  const { 
    showUpgradePrompt, 
    setShowUpgradePrompt, 
    validateCredits,
    useCredit,
    subscription
  } = useQuizCredits();
  
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

    // Check if user has credits
    const hasCredits = await validateCredits();
    if (!hasCredits) return false;

    setIsGenerating(true);
    setQuizQuestions([]);
    setNewsSources([]);
    setError(null);
    setQuizMetadata(null);
    setQuizId(null);
    
    updateGenerationProgress('preparing', 5, 'Preparing to generate quiz...');

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
      
      updateGenerationProgress(
        'analyzing', 
        15, 
        `Analyzing ${hasStemTopics ? 'STEM' : ''} topics and gathering news sources...`
      );

      console.log("Sending request to generate case study quiz with topics:", topics);
      
      updateGenerationProgress(
        'generating', 
        30, 
        `Generating ${hasStemTopics ? 'STEM-enhanced' : ''} case study questions...`
      );
      
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
        updateGenerationProgress(
          'error',
          0,
          `Failed to generate quiz: ${errorData.error || 'Unknown error'}`
        );
        throw new Error(`Failed to generate quiz: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log("Received quiz data:", data);
      
      updateGenerationProgress('saving', 75, `Questions generated successfully. Saving quiz...`);
      
      if (!data.quizQuestions || !Array.isArray(data.quizQuestions)) {
        throw new Error("Invalid quiz data received from server");
      }
      
      await processQuizData(data, topics, difficulty, selectedCourseId, hasStemTopics);
      
      return true;
    } catch (error) {
      handleGenerationError(error);
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  const processQuizData = async (
    data: any, 
    topics: Topic[], 
    difficulty: QuestionDifficulty, 
    selectedCourseId: string,
    hasStemTopics: boolean
  ) => {
    // Shuffle options for all questions from the generation type
    const shuffledGenerationQuestions = shuffleQuestionsOptions(data.quizQuestions as GenerationQuestion[]);
    
    // Validate and process questions, converting from GenerationQuestion to QuizQuestion
    const validatedQuestions = validateQuestions(shuffledGenerationQuestions, difficulty);
    
    // Set the converted and validated questions
    setQuizQuestions(validatedQuestions);
    
    // Process news sources if available
    if (data.metadata && Array.isArray(data.metadata.newsSourcesUsed)) {
      setNewsSources(data.metadata.newsSourcesUsed);
    }
    
    // Create enhanced metadata
    const enhancedMetadata = createEnhancedMetadata(data, selectedCourseId, difficulty, topics, validatedQuestions, hasStemTopics);
    setQuizMetadata(enhancedMetadata);

    // Save quiz to database with shuffled options
    await saveGeneratedQuiz(validatedQuestions, data, selectedCourseId, enhancedMetadata);
  };

  const validateQuestions = (quizQuestions: GenerationQuestion[], difficulty: QuestionDifficulty): QuizQuestion[] => {
    return quizQuestions.map((q: GenerationQuestion) => ({
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
  };

  const createEnhancedMetadata = (
    data: any, 
    selectedCourseId: string, 
    difficulty: QuestionDifficulty, 
    topics: Topic[],
    validatedQuestions: QuizQuestion[],
    hasStemTopics: boolean
  ): QuizMetadata => {
    return {
      courseId: data.metadata?.courseId || selectedCourseId,
      difficulty: difficulty,
      topics: data.metadata?.topics || topics.map(t => t.description),
      totalPoints: data.metadata?.totalPoints || validatedQuestions.reduce((sum, q) => sum + q.points, 0),
      estimatedDuration: data.metadata?.estimatedDuration || 30,
      stemTopicsDetected: data.metadata?.stemTopicsDetected || hasStemTopics,
      modelUsed: data.metadata?.modelUsed || 'openai',
    };
  };

  const saveGeneratedQuiz = async (
    validatedQuestions: QuizQuestion[], 
    data: any, 
    selectedCourseId: string,
    enhancedMetadata: QuizMetadata
  ) => {
    try {
      const modelInfo = data.metadata?.modelUsed === 'deepseek' ? 'STEM-Enhanced ' : '';
      const defaultTitle = `${modelInfo}Case Study: ${enhancedMetadata.topics[0]}${enhancedMetadata.topics.length > 1 ? ' & More' : ''}`;
      
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
        
        // Use credits if needed
        await useCredit();
        
        updateGenerationProgress(
          'complete',
          100,
          `Quiz generated and saved successfully!`
        );
        
        toast({
          title: "Success",
          description: `${modelInfo}Case study quiz generated and saved successfully!`,
        });
      } else {
        console.error("No quiz ID returned from saveQuizToDatabase");
        
        updateGenerationProgress(
          'error',
          75,
          `Quiz generated but could not be saved completely. Try again.`
        );
        
        toast({
          title: "Warning",
          description: "Quiz generated but may not be properly saved. Saving issue detected.",
          variant: "destructive",
        });
      }
    } catch (saveError) {
      console.error("Error saving quiz to database:", saveError);
      updateGenerationProgress(
        'error',
        75,
        `Quiz generated but couldn't be saved. Database error.`
      );
      
      toast({
        title: "Warning",
        description: "Quiz generated but couldn't be saved. Try again later.",
        variant: "destructive",
      });
    }
  };

  const handleGenerationError = (error: any) => {
    console.error('Error generating case study quiz:', error);
    const errorMessage = typeof error === 'object' && error !== null && 'message' in error
      ? String(error.message)
      : "Failed to generate quiz. Please try again.";
    
    setError(errorMessage);
    
    updateGenerationProgress(
      'error',
      0,
      errorMessage
    );
    
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const handleRetry = () => {
    resetProgress();
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
