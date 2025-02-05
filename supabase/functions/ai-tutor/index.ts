import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationId, courseId, studentId } = await req.json();

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Create a new conversation if none exists
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      const { data: conversation, error: convError } = await supabase
        .from('tutor_conversations')
        .insert([{ student_id: studentId, course_id: courseId }])
        .select()
        .single();

      if (convError) throw convError;
      currentConversationId = conversation.id;
    }

    // Store user message
    await supabase.from('tutor_messages').insert([
      {
        conversation_id: currentConversationId,
        content: message,
        role: 'user',
      }
    ]);

    // Get AI response
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI tutor assistant. Help students with:
              - Creating study guides and summaries
              - Generating practice quizzes
              - Building study schedules
              - Explaining complex topics
              - Providing learning resources
              Be encouraging, clear, and helpful in your responses.`
          },
          { role: 'user', content: message }
        ],
      }),
    });

    const aiResponse = await response.json();
    const aiMessage = aiResponse.choices[0].message.content;

    // Store AI response
    await supabase.from('tutor_messages').insert([
      {
        conversation_id: currentConversationId,
        content: aiMessage,
        role: 'assistant',
      }
    ]);

    return new Response(
      JSON.stringify({ 
        message: aiMessage, 
        conversationId: currentConversationId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});