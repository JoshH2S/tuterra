
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InterviewQuestion } from "@/types/interview";

export const useInterviewQuestions = (
  sessionId: string | null,
  setQuestions: (questions: InterviewQuestion[]) => void
) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const generateQuestions = async (industry: string, jobRole: string, jobDescription: string) => {
    if (!sessionId) {
      console.error("Cannot generate questions: No session ID provided");
      toast({
        title: "Error",
        description: "Session ID is missing. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    console.log(`Generating questions for session ${sessionId} with:`, { industry, jobRole, jobDescription: jobDescription.substring(0, 50) + '...' });
    
    try {
      // Call the edge function with detailed logging
      console.log("Calling generate-interview-questions edge function...");
      const { data, error } = await supabase.functions.invoke('generate-interview-questions', {
        body: { 
          industry, 
          jobRole, 
          jobDescription, 
          sessionId 
        }
      });

      console.log("Edge function response:", { data, error });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(`Edge function error: ${error.message || JSON.stringify(error)}`);
      }
      
      if (!data) {
        console.error("No data returned from edge function");
        throw new Error("No data returned from the server");
      }
      
      if (data && data.questions) {
        console.log(`Received ${data.questions.length} questions from edge function`);
        setQuestions(data.questions);
        toast({
          title: "Questions generated",
          description: "Your interview questions are ready. Let's start the interview!",
        });
      } else {
        console.error("Questions array missing in response:", data);
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      // Use fallback questions when generation fails
      const fallbackQuestions = generateFallbackQuestions(jobRole, industry);
      console.log("Using fallback questions instead:", fallbackQuestions);
      
      // Convert fallbacks to the expected format and set them
      const formattedFallbacks = fallbackQuestions.map((q, index) => ({
        id: `fallback-${index}`,
        session_id: sessionId,
        question: q.text,
        question_order: index,
        created_at: new Date().toISOString()
      }));
      
      setQuestions(formattedFallbacks);
      
      toast({
        title: "Using backup questions",
        description: "We had trouble connecting to our AI service, but we've provided some standard questions for you.",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate client-side fallback questions as a last resort
  const generateFallbackQuestions = (jobRole: string, industry: string) => [
    {
      text: `Tell me about your experience as a ${jobRole}.`,
      category: 'experience',
      difficulty: 'medium',
      estimatedTimeSeconds: 120
    },
    {
      text: `What interests you about working in ${industry}?`,
      category: 'motivation',
      difficulty: 'easy',
      estimatedTimeSeconds: 90
    },
    {
      text: `Describe a challenging situation you've faced in a previous role and how you handled it.`,
      category: 'behavioral',
      difficulty: 'medium',
      estimatedTimeSeconds: 180
    },
    {
      text: `What specific skills do you have that make you qualified for this ${jobRole} position?`,
      category: 'skills',
      difficulty: 'medium',
      estimatedTimeSeconds: 120
    },
    {
      text: `Where do you see yourself professionally in five years?`,
      category: 'career',
      difficulty: 'medium',
      estimatedTimeSeconds: 120
    }
  ];

  const fetchQuestions = async () => {
    if (!sessionId) return;
    
    setLoading(true);
    try {
      console.log(`Fetching questions for session ${sessionId}`);
      
      // First try direct database query as fallback
      const { data: directData, error: directError } = await supabase
        .from('interview_questions')
        .select('*')
        .eq('session_id', sessionId)
        .order('question_order', { ascending: true });
      
      if (directError) {
        console.warn("Direct DB query failed, trying edge function:", directError);
      } else if (directData && directData.length > 0) {
        console.log(`Retrieved ${directData.length} questions directly from DB`);
        setQuestions(directData);
        return;
      }
      
      // If direct query fails or returns no results, try the edge function
      const { data, error } = await supabase.functions.invoke('get-interview-questions', {
        body: { sessionId }
      });

      if (error) throw error;
      
      // Process the returned data
      if (data && Array.isArray(data.questions)) {
        console.log(`Retrieved ${data.questions.length} questions via edge function`);
        
        const questions: InterviewQuestion[] = data.questions.map((item: any) => ({
          id: item.id || '',
          session_id: item.session_id || '',
          question: item.question || '',
          question_order: typeof item.question_order === 'number' ? item.question_order : 0,
          created_at: item.created_at || ''
        }));
        
        setQuestions(questions);
      } else {
        console.error("Invalid response format from get-interview-questions:", data);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch interview questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    generateQuestions,
    fetchQuestions,
    loading
  };
};
