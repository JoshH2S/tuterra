
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

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-ada-002',
    }),
  });

  const { data } = await response.json();
  return data[0].embedding;
}

async function searchRelevantContent(supabase: any, queryEmbedding: number[], limit = 3) {
  const { data: chunks, error } = await supabase.rpc('match_content_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: limit
  });

  if (error) throw error;
  return chunks;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const { message, conversationId, courseId, studentId, materialPath } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // Generate embedding for the user's question
    const queryEmbedding = await generateEmbedding(message);
    
    // Search for relevant content chunks
    const relevantChunks = await searchRelevantContent(supabase, queryEmbedding);
    
    // Prepare context from relevant chunks
    let context = "";
    if (relevantChunks && relevantChunks.length > 0) {
      context = "Based on the following relevant content:\n\n" + 
        relevantChunks.map(chunk => chunk.chunk_text).join("\n\n");
    }

    let currentConversationId = conversationId;
    if (!currentConversationId) {
      const { data: conversation, error: convError } = await supabase
        .from('tutor_conversations')
        .insert([{ 
          student_id: studentId,
          course_id: courseId || null 
        }])
        .select()
        .single();

      if (convError) throw convError;
      currentConversationId = conversation.id;
    }

    const { error: userMessageError } = await supabase
      .from('tutor_messages')
      .insert([{
        conversation_id: currentConversationId,
        content: message,
        role: 'user',
      }]);

    if (userMessageError) {
      throw userMessageError;
    }

    const systemMessage = `You are an AI tutor assistant. ${
      context ? 'You have access to the following relevant course material:\n' + context 
      : 'You are ready to help with any academic questions or learning needs.'
    }\n\nHelp students by:
- Understanding complex topics and concepts
- Creating study guides and summaries
- Generating practice questions
- Building study schedules
- Providing learning resources and explanations
- Answering general academic questions

Be encouraging, clear, and helpful in your responses. When course materials are provided, use them to give context-specific answers.`;

    console.log('Making request to OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: message }
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const aiResponse = await response.json();
    const aiMessage = aiResponse.choices[0].message.content;

    const { error: aiMessageError } = await supabase
      .from('tutor_messages')
      .insert([{
        conversation_id: currentConversationId,
        content: aiMessage,
        role: 'assistant',
      }]);

    if (aiMessageError) {
      throw aiMessageError;
    }

    return new Response(
      JSON.stringify({ 
        message: aiMessage, 
        conversationId: currentConversationId 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in ai-tutor function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while processing your request' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});
