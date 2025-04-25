
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useConversation = () => {
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrCreateConversation = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        // Check for an existing conversation that was created in the current session
        const { data: conversationData } = await supabase
          .from('tutor_conversations')
          .select('id, created_at')
          .eq('student_id', userData.user.id)
          .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (conversationData) {
          setConversationId(conversationData.id);
        } else {
          // Create a new conversation for the new session
          const { data: newConversation, error } = await supabase
            .from('tutor_conversations')
            .insert([{ student_id: userData.user.id }])
            .select()
            .single();

          if (error) throw error;
          setConversationId(newConversation.id);
        }
      } catch (error) {
        console.error('Error fetching/creating conversation:', error);
      }
    };

    fetchOrCreateConversation();
  }, []);

  return {
    conversationId,
    setConversationId,
  };
};
