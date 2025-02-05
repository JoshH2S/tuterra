import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useConversation = (courseId: string) => {
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user || !courseId) return;

        const { data: conversationData } = await supabase
          .from('tutor_conversations')
          .select('id')
          .eq('student_id', userData.user.id)
          .eq('course_id', courseId)
          .maybeSingle();

        if (conversationData) {
          setConversationId(conversationData.id);
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
      }
    };

    if (courseId) {
      fetchConversation();
    }
  }, [courseId]);

  return {
    conversationId,
    setConversationId,
  };
};