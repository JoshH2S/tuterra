
import { supabase } from "@/integrations/supabase/client";
import { Question, FALLBACK_QUESTIONS } from "@/types/interview";
import { v4 as uuidv4 } from "@/lib/uuid";

export async function generateInterviewQuestions(
  industry: string,
  role: string,
  jobDescription: string
): Promise<Question[]> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-interview-questions', {
      body: { industry, role, jobDescription }
    });
    
    if (error) throw error;
    
    if (data?.questions && Array.isArray(data.questions) && data.questions.length >= 3) {
      return data.questions.map((q: string) => ({
        id: uuidv4(),
        text: q
      }));
    } else {
      console.log("Using fallback questions due to insufficient API response");
      return getFallbackQuestions();
    }
  } catch (error) {
    console.error("Error generating questions:", error);
    return getFallbackQuestions();
  }
}

export function getFallbackQuestions(): Question[] {
  return FALLBACK_QUESTIONS.map(q => ({
    id: uuidv4(),
    text: q
  }));
}
