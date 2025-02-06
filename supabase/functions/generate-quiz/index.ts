
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from './constants.ts';
import { generateQuestionsWithOpenAI } from './openai.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const MAX_CONTENT_LENGTH = 5000; // Match lesson plan limit

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
    const teacherName = formData.get('teacherName') as string;
    const school = formData.get('school') as string;

    if (!file || !topics || !title || !userId) {
      throw new Error('Missing required fields');
    }

    // Read and trim file content
    const fileContent = await file.text();
    const trimmedContent = fileContent.slice(0, MAX_CONTENT_LENGTH);
    console.log('File content extracted and trimmed, length:', trimmedContent.length);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Generate questions using OpenAI with teacher context
    const questions = await generateQuestionsWithOpenAI(
      trimmedContent, 
      topics, 
      openAIApiKey,
      { teacherName, school }
    );
    console.log(`Generated ${questions.length} questions`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        questions,
        questionCount: questions.length,
        contentTrimmed: trimmedContent.length < fileContent.length
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    const errorMessage = error.message?.includes('Too Many Requests')
      ? 'OpenAI is currently busy. Please try again in a few moments.'
      : error.message || 'Failed to generate quiz questions.';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Failed to generate quiz questions.',
        retry: error.message?.includes('Too Many Requests') || false
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
