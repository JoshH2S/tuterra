
import { supabase } from "@/integrations/supabase/client";
import { Question, Topic } from "@/types/quiz-generation";
import { QuestionDifficulty } from "@/types/quiz";

export const useQuizAPI = () => {
  const generateQuiz = async (
    content: string,
    topics: Topic[],
    difficulty: QuestionDifficulty
  ): Promise<Question[]> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No session found');
    }

    const { data: teacherData } = await supabase
      .from('profiles')
      .select('first_name, last_name, school')
      .eq('id', session.user.id)
      .single();

    try {
      console.log("Preparing to call generate-quiz endpoint", {
        contentLength: content.length,
        topicsCount: topics.length,
        difficulty
      });

      const apiUrl = 'https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/generate-quiz';
      console.log(`Calling API endpoint: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          content,
          topics,
          difficulty,
          teacherName: teacherData ? `${teacherData.first_name} ${teacherData.last_name}` : undefined,
          school: teacherData?.school,
        }),
      });

      console.log("API response status:", response.status);
      
      // Handle non-OK responses with more detailed error information
      if (!response.ok) {
        let errorDetails = "Unknown error";
        try {
          // Try to parse error response as JSON
          const errorData = await response.json();
          errorDetails = errorData.error || errorData.message || JSON.stringify(errorData);
          console.error('Error response from API:', errorData);
        } catch (jsonError) {
          // If response isn't JSON, get text content instead
          try {
            errorDetails = await response.text();
            console.error('Error response text:', errorDetails);
          } catch (textError) {
            console.error('Could not extract error details from response');
          }
        }
        
        const error = new Error(`Failed to generate quiz: ${response.status} ${response.statusText} - ${errorDetails}`) as Error & { 
          cause?: any;
          status?: number;
          details?: string;
        };
        error.status = response.status;
        error.details = errorDetails;
        error.cause = { status: response.status, statusText: response.statusText };
        throw error;
      }

      const data = await response.json();
      console.log("API response data summary:", {
        hasQuestions: !!data.quizQuestions,
        questionCount: data.quizQuestions?.length || 0,
        hasMetadata: !!data.metadata
      });
      
      if (!data.quizQuestions || !Array.isArray(data.quizQuestions)) {
        throw new Error('Invalid response format: questions not found in response');
      }
      
      return data.quizQuestions.map((q: Question) => ({
        ...q,
        difficulty
      }));
    } catch (error) {
      console.error('Error generating quiz:', error);
      // Add more context to the error
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
        console.error('Error details:', (error as any).details || 'No additional details');
      }
      throw error;
    }
  };

  return { generateQuiz };
};
