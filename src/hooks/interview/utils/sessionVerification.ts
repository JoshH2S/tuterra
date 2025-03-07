
import { supabase } from "@/integrations/supabase/client";

/**
 * Utility function to verify that a session exists in the database
 * Uses exponential backoff for retries
 */
export const verifySession = async (sessionId: string, maxRetries = 3, delayMs = 1000): Promise<boolean> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Verifying session attempt ${attempt}/${maxRetries}...`);
    
    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('id, session_id')
        .eq('session_id', sessionId)
        .maybeSingle();
      
      if (error) {
        console.error(`Verification attempt ${attempt} failed:`, error);
      } else if (data) {
        console.log('Session verified successfully:', data);
        return true;
      } else {
        console.log(`Session not found on attempt ${attempt}`);
      }
      
      if (attempt < maxRetries) {
        const backoffDelay = delayMs * Math.pow(1.5, attempt - 1);
        console.log(`Waiting ${backoffDelay}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    } catch (error) {
      console.error(`Verification attempt ${attempt} threw error:`, error);
    }
  }
  
  return false;
};
