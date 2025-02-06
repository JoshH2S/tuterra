
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, MAX_FILE_SIZE } from './constants.ts';
import { generateQuestionsFromChunk } from './openai.ts';
import { chunkContent } from './content-utils.ts';
import { storeQuizData } from './db-operations.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const topicsJson = formData.get('topics') as string;
    const topics = JSON.parse(topicsJson);
    const courseId = formData.get('courseId') as string;
    const title = formData.get('title') as string;
    const teacherId = formData.get('teacherId') as string;

    if (!file || !topics || !courseId || !title || !teacherId) {
      throw new Error('Missing required fields');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Read and chunk the file content
    const fileContent = await file.text();
    console.log('Processing file of size:', fileContent.length);
    
    const contentChunks = chunkContent(fileContent);
    console.log(`Split content into ${contentChunks.length} chunks`);

    // Generate questions from each chunk
    let allQuestions: any[] = [];
    for (const chunk of contentChunks) {
      const questions = await generateQuestionsFromChunk(chunk, topics, openAIApiKey || '');
      allQuestions = allQuestions.concat(questions);
    }

    // Store all data
    const quizId = await storeQuizData(
      supabaseUrl || '',
      supabaseServiceKey || '',
      {
        title,
        courseId,
        teacherId,
        file,
        questions: allQuestions
      }
    );

    return new Response(
      JSON.stringify({ 
        success: true, 
        quizId,
        questionCount: allQuestions.length 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to generate quiz questions. Please try again.'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
