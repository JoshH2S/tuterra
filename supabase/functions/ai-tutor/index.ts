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

// Get the appropriate model based on subscription tier
const getModelForTier = (tier: string) => {
  switch(tier) {
    case 'premium':
      return 'gpt-4o';
    case 'pro':
      return 'gpt-4o-mini';
    default:
      return 'gpt-4o-mini';
  }
};

// Generate smart notes for premium users
const generateSmartNotes = async (message: string, conversation: string) => {
  try {
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
            content: 'You are a helpful assistant that extracts key learning points from a conversation. Generate a concise summary of the key points in 1-2 sentences.'
          },
          { role: 'user', content: conversation + "\n\nNew message: " + message }
        ],
        max_tokens: 150,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating smart notes:', error);
    return null;
  }
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

function extractTopic(message: string): string {
  const topics = [
    "Mathematics", "Physics", "Chemistry", "Biology", 
    "Computer Science", "History", "Literature", "Geography",
    "Economics", "Psychology", "Philosophy", "Engineering"
  ];

  for (const topic of topics) {
    if (message.toLowerCase().includes(topic.toLowerCase())) {
      return topic;
    }
  }

  return "General Learning";
}

function generateLearningPath(message: string): any[] {
  return [
    { title: "Understand key concepts", completed: false },
    { title: "Practice with examples", completed: false },
    { title: "Apply knowledge", completed: false },
    { title: "Review and reinforce", completed: false },
    { title: "Test your understanding", completed: false }
  ];
}

function cleanMarkdownFormatting(text: string): string {
  if (!text) return "";
  
  let cleanText = text;
  
  cleanText = cleanText.replace(/```[\s\S]*?```/g, (match) => {
    return match.replace(/```[\w]*\n?|\n?```/g, "").trim();
  });
  
  cleanText = cleanText.replace(/^>\s+/gm, "");
  cleanText = cleanText.replace(/^>\s*/gm, "");
  
  cleanText = cleanText.replace(/^\s*[-*+]\s+/gm, "• ");
  cleanText = cleanText.replace(/^\s*(\d+)\.?\s+/gm, "$1. ");
  
  cleanText = cleanText.replace(/\*\*(.*?)\*\*/g, "$1"); // Bold
  cleanText = cleanText.replace(/__(.*?)__/g, "$1"); // Bold alternative
  cleanText = cleanText.replace(/\*(.*?)\*/g, "$1"); // Italic
  cleanText = cleanText.replace(/_(.*?)_/g, "$1"); // Italic alternative
  
  cleanText = cleanText.replace(/^#{1,6}\s+(.*)$/gm, "$1");
  
  cleanText = cleanText.replace(/\.([A-Z])/g, ". $1");
  
  cleanText = cleanText.replace(/[ \t]+/g, " ");
  
  cleanText = cleanText.replace(/\n{3,}/g, "\n\n");
  
  return cleanText.trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const { message, conversationId, studentId, materialPath, subscription } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    const userSubscription = subscription || {
      tier: 'free',
      features: {
        smartNotes: false,
        advancedModel: false,
        learningPath: false,
        streaming: false
      }
    };

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    const queryEmbedding = await generateEmbedding(message);
    
    const relevantChunks = await searchRelevantContent(supabase, queryEmbedding);
    
    let context = "";
    if (relevantChunks && relevantChunks.length > 0) {
      context = "Based on the following relevant content:\n\n" + 
        relevantChunks.map(chunk => chunk.chunk_text).join("\n\n");
    }

    let currentConversationId = conversationId;
    let conversationHistory = "";

    if (!currentConversationId) {
      const { data: conversation, error: convError } = await supabase
        .from('tutor_conversations')
        .insert([{ 
          student_id: studentId,
          topic: extractTopic(message),
          progress: 0,
          learning_path: generateLearningPath(message)
        }])
        .select()
        .single();

      if (convError) throw convError;
      currentConversationId = conversation.id;
    } 
    else {
      const { data: previousMessages, error: prevMessagesError } = await supabase
        .from('tutor_messages')
        .select('content, role')
        .eq('conversation_id', currentConversationId)
        .order('created_at', { ascending: true })
        .limit(10);

      if (!prevMessagesError && previousMessages) {
        conversationHistory = previousMessages.map(msg => 
          `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`
        ).join("\n\n");
      }

      await supabase
        .from('tutor_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentConversationId);
    }

    if (userSubscription.tier !== 'free') {
      try {
        await supabase
          .from('subscription_feature_usage')
          .insert([{
            user_id: studentId,
            feature_name: `ai_tutor_${userSubscription.tier}_model`,
            usage_count: 1,
            last_used: new Date().toISOString()
          }])
          .select();
      } catch (e) {
        console.error('Error tracking subscription usage:', e);
      }
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

    const model = getModelForTier(userSubscription.tier);

    let smartNotes = null;
    if (userSubscription.tier === 'premium') {
      smartNotes = await generateSmartNotes(message, conversationHistory);
      
      if (smartNotes) {
        try {
          const { data: conversation, error } = await supabase
            .from('tutor_conversations')
            .select('smart_notes')
            .eq('id', currentConversationId)
            .single();
          
          if (!error && conversation) {
            const existingNotes = conversation.smart_notes || [];
            await supabase
              .from('tutor_conversations')
              .update({
                smart_notes: [...existingNotes, smartNotes]
              })
              .eq('id', currentConversationId);
          }
        } catch (e) {
          console.error('Error saving smart notes:', e);
        }
      }
    }

    const systemMessage = `You are an AI tutor assistant. ${
      context ? 'You have access to the following relevant course material:\n' + context 
      : 'You are ready to help with any academic questions or learning needs.'
    }\n\n${conversationHistory ? 'Previous conversation:\n' + conversationHistory + '\n\n' : ''}Help students by:
- Understanding complex topics and concepts
- Creating study guides and summaries
- Generating practice questions
- Building study schedules
- Providing learning resources and explanations
- Answering general academic questions

${userSubscription.tier === 'premium' ? 'As a premium tutor, provide detailed, in-depth responses with examples and analogies.' : 
  userSubscription.tier === 'pro' ? 'As a pro tutor, provide comprehensive responses with some examples.' : 
  'Provide clear, concise responses that focus on the core concepts.'}

Be encouraging, clear, and helpful in your responses. When course materials are provided, use them to give context-specific answers.`;

    console.log('Making request to OpenAI API with model:', model);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: message }
        ],
        max_tokens: userSubscription.tier === 'premium' ? 2500 : 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const aiResponse = await response.json();
    const aiMessageRaw = aiResponse.choices[0].message.content;
    
    const aiMessage = cleanMarkdownFormatting(aiMessageRaw);

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
        conversationId: currentConversationId,
        smartNotes: smartNotes
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
