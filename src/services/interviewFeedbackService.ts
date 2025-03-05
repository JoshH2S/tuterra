
import { supabase } from "@/integrations/supabase/client";
import { Question } from "@/types/interview";

export async function generateInterviewFeedback(
  industry: string,
  role: string,
  jobDescription: string,
  questions: Question[],
  userResponses: string[]
): Promise<string> {
  try {
    // Extract just the question texts
    const questionTexts = questions.map(q => q.text);
    
    const { data, error } = await supabase.functions.invoke('generate-interview-feedback', {
      body: { 
        industry, 
        role, 
        jobDescription,
        questions: questionTexts,
        userResponses 
      }
    });
    
    if (error) throw error;
    
    if (data?.feedback) {
      console.log("Feedback generated successfully");
      return data.feedback;
    } else {
      throw new Error("No feedback received");
    }
  } catch (error) {
    console.error("Error generating feedback:", error);
    return "We couldn't generate detailed feedback at this time. Please try again later.";
  }
}
