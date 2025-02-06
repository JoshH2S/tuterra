
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from './constants.ts';
import { processFileContent } from './file-utils.ts';
import { generateQuestionsWithOpenAI } from './openai.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    if (!file || !topics || !title) {
      throw new Error('Missing required fields');
    }

    // Extract file content
    const fileContent = await processFileContent(file);
    console.log('File content extracted, length:', fileContent.length);

    // Generate questions using OpenAI
    const questions = await generateQuestionsWithOpenAI(fileContent, topics, openAIApiKey || '');
    console.log(`Generated ${questions.length} questions`);

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
