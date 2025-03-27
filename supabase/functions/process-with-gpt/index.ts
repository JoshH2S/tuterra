
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath } = await req.json();
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('tutor_files')
      .download(filePath);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Convert file to base64
    const fileContent = await fileData.text();
    
    // Process with GPT
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",  // Updated from "gpt-4o-mini" to "gpt-3.5-turbo"
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that processes educational content. Extract and organize key information, main topics, and important concepts from the provided text. Format the output in a clear, structured way."
          },
          {
            role: "user",
            content: fileContent
          }
        ]
      }),
    });

    const data = await response.json();
    const processedContent = data.choices[0].message.content;

    console.log('Content processed with GPT:', {
      originalLength: fileContent.length,
      processedLength: processedContent.length,
    });

    return new Response(JSON.stringify({ content: processedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing file with GPT:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
