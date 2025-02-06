
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from './constants.ts';
import { processFileContent, storeTemporaryFile, cleanupTemporaryFile } from './file-utils.ts';
import { generateQuestionsWithOpenAI } from './openai.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const topicsJson = formData.get('topics') as string;
    const topics = JSON.parse(topicsJson);
    const title = formData.get('title') as string;
    const userId = formData.get('userId') as string;

    if (!file || !topics || !title || !userId) {
      throw new Error('Missing required fields');
    }

    // Store file temporarily and get URL
    const fileUrl = await storeTemporaryFile(file, supabaseUrl, supabaseServiceKey, userId);
    console.log('Temporary file stored:', fileUrl);

    // Extract file content
    const fileContent = await processFileContent(file);
    console.log('File content extracted, length:', fileContent.length);

    // Generate questions using OpenAI
    const questions = await generateQuestionsWithOpenAI(fileContent, topics, openAIApiKey || '');
    console.log(`Generated ${questions.length} questions`);

    // Clean up temporary file
    const filePath = new URL(fileUrl).pathname.split('/').pop() || '';
    await cleanupTemporaryFile(filePath, supabaseUrl, supabaseServiceKey);
    console.log('Temporary file cleaned up');

    return new Response(
      JSON.stringify({ 
        success: true, 
        questions,
        questionCount: questions.length 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to generate quiz questions.'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
