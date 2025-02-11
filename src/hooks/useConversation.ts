
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useConversation = () => {
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const { data: conversationData } = await supabase
          .from('tutor_conversations')
          .select('id')
          .eq('student_id', userData.user.id)
          .maybeSingle();

        if (conversationData) {
          setConversationId(conversationData.id);
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
      }
    };

    fetchConversation();
  }, []);

  return {
    conversationId,
    setConversationId,
  };
};
