
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

async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  try {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(buffer);
    console.log('Extracted text length:', text.length);
    return text;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('Failed to process PDF content');
  }
}

async function generateSummary(content: string, type: string): Promise<string> {
  const prompt = `Summarize the following ${type} content concisely while preserving key information:

${content}

Focus on:
1. Main concepts and ideas
2. Key definitions
3. Important formulas or examples
4. Learning objectives

Keep the summary clear and structured.`;

  try {
    console.log('Sending request to OpenAI...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert educator specializing in creating concise, informative summaries of educational content.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate summary');
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log the incoming request
    console.log('Received request:', req.method);
    
    const { filePath, contentType, title, parentId } = await req.json();
    console.log('Request payload:', { filePath, contentType, title, parentId });
    
    if (!filePath || !contentType || !title) {
      throw new Error('Missing required parameters');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download the file from storage
    console.log('Downloading file from storage:', filePath);
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('textbooks')
      .download(filePath);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Extract text from PDF
    console.log('Extracting text from PDF...');
    const arrayBuffer = await fileData.arrayBuffer();
    const extractedText = await extractTextFromPDF(arrayBuffer);

    // Generate AI summary
    console.log('Generating summary...');
    const summary = await generateSummary(extractedText, contentType);

    // Store processed content
    console.log('Storing processed content...');
    const { data: contentData, error: contentError } = await supabase
      .from('processed_textbook_content')
      .insert({
        original_file_path: filePath,
        content_type: contentType,
        title,
        content: extractedText,
        summary,
        parent_id: parentId || null,
      })
      .select()
      .single();

    if (contentError) {
      console.error('Content storage error:', contentError);
      throw new Error(`Failed to store processed content: ${contentError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: contentData,
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in process-textbook function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
