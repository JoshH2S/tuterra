import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { PdfServiceClient } from "https://deno.land/x/pdfjs@v0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function truncateText(text: string, maxTokens = 30000) {
  const maxChars = maxTokens * 4;
  if (text.length > maxChars) {
    console.log(`Truncating content from ${text.length} characters to ${maxChars}`);
    return text.slice(0, maxChars) + "\n[Content truncated to fit within model's context limit...]";
  }
  return text;
}

async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  try {
    const pdfService = new PdfServiceClient();
    const uint8Array = new Uint8Array(buffer);
    const text = await pdfService.getText(uint8Array);
    return text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
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
    let context = "";
    
    if (materialPath) {
      try {
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('course_materials')
          .download(materialPath);

        if (downloadError) {
          console.error('Error downloading material:', downloadError);
          context = "";
        } else {
          let text;
          if (materialPath.toLowerCase().endsWith('.pdf')) {
            const arrayBuffer = await fileData.arrayBuffer();
            text = await extractTextFromPDF(arrayBuffer);
          } else {
            text = await fileData.text();
          }
          context = truncateText(text);
          console.log(`Context length after truncation: ${context.length} characters`);
        }
      } catch (error) {
        console.error('Error processing material:', error);
        context = "";
      }
    }

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
      context ? 'You have access to the following course material:' + context 
      : 'No specific course material is currently selected.'
    }\n\nUse this content to help answer questions accurately and provide relevant examples. Help students with:
- Creating study guides and summaries
- Generating practice quizzes
- Building study schedules
- Explaining complex topics
- Providing learning resources

Be encouraging, clear, and helpful in your responses. Base your answers on the course materials when available.`;

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