
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useConversation = (courseId?: string) => {
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const query = supabase
          .from('tutor_conversations')
          .select('id')
          .eq('student_id', userData.user.id);
        
        if (courseId) {
          query.eq('course_id', courseId);
        }

        const { data: conversationData } = await query.maybeSingle();

        if (conversationData) {
          setConversationId(conversationData.id);
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
      }
    };

    fetchConversation();
  }, [courseId]);

  return {
    conversationId,
    setConversationId,
  };
};
