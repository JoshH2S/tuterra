
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ContentLimits {
  MAX_CONTENT_LENGTH: number;
  RECOMMENDED_LENGTH: number;
  MAX_TOPICS: number;
  MAX_QUESTIONS_PER_TOPIC: number;
  MAX_TOTAL_QUESTIONS: number;
}

interface QuizLimits {
  contentLimits: ContentLimits;
  isLoading: boolean;
  error: Error | null;
}

const DEFAULT_LIMITS: ContentLimits = {
  MAX_CONTENT_LENGTH: 75000,
  RECOMMENDED_LENGTH: 25000,
  MAX_TOPICS: 10,
  MAX_QUESTIONS_PER_TOPIC: 20,
  MAX_TOTAL_QUESTIONS: 50,
};

export const useQuizLimits = (): QuizLimits => {
  const [contentLimits, setContentLimits] = useState<ContentLimits>(DEFAULT_LIMITS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.warn("No authenticated session, using default limits");
          return;
        }

        const response = await fetch(
          'https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/generate-quiz/limits',
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch quiz limits: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.contentLimits) {
          console.log("Received content limits from backend:", data.contentLimits);
          setContentLimits(data.contentLimits);
        }
      } catch (err) {
        console.error("Error fetching quiz limits:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchLimits();
  }, []);

  return {
    contentLimits,
    isLoading,
    error
  };
};
