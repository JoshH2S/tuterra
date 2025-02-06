
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_CHUNK_SIZE = 30000; // Maximum safe chunk size for GPT-4
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB max file size

async function generateQuestionsFromChunk(
  chunk: string,
  topics: { name: string; questionCount: number }[]
): Promise<any> {
  console.log('Generating questions for chunk of size:', chunk.length);

  const prompt = `Generate quiz questions from this content snippet:
${chunk}

Generate questions for these topics:
${topics.map((topic, index) => `${index + 1}. ${topic.name} (${topic.questionCount} questions)`).join('\n')}

Format each question as JSON with:
{
  "question": "question text",
  "options": {
    "A": "first option",
    "B": "second option",
    "C": "third option",
    "D": "fourth option"
  },
  "correct_answer": "A/B/C/D",
  "topic": "topic name"
}

Return an array of question objects.`;

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
            content: 'You are an expert at creating focused quiz questions from educational content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error generating questions from chunk:', error);
    throw error;
  }
}

function chunkContent(content: string): string[] {
  const chunks: string[] = [];
  let currentChunk = '';
  const paragraphs = content.split(/\n\s*\n/);

  for (const paragraph of paragraphs) {
    if ((currentChunk.length + paragraph.length) < MAX_CHUNK_SIZE) {
      currentChunk += paragraph + '\n\n';
    } else {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = paragraph + '\n\n';
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

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
      const questions = await generateQuestionsFromChunk(chunk, topics);
      allQuestions = allQuestions.concat(questions);
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '');

    // Create quiz record
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        title,
        course_id: courseId,
        teacher_id: teacherId,
      })
      .select()
      .single();

    if (quizError) {
      console.error('Error creating quiz:', quizError);
      throw new Error('Failed to create quiz');
    }

    // Store file in Storage
    const fileExt = file.name.split('.').pop();
    const sanitizedFileName = file.name.replace(/[^\x00-\x7F]/g, '');
    const uniqueFilePath = `${courseId}/${crypto.randomUUID()}-${sanitizedFileName}`;
    
    const { error: storageError } = await supabase.storage
      .from('course_materials')
      .upload(uniqueFilePath, file);

    if (storageError) {
      console.error('Error uploading file:', storageError);
      throw new Error('Failed to upload file');
    }

    // Store file metadata
    const { error: materialError } = await supabase
      .from('course_materials')
      .insert({
        course_id: courseId,
        file_name: file.name,
        file_type: file.type,
        size: file.size,
        storage_path: uniqueFilePath,
      });

    if (materialError) {
      console.error('Error storing file metadata:', materialError);
      throw new Error('Failed to store file metadata');
    }

    // Store questions
    const formattedQuestions = allQuestions.map((q: any) => ({
      quiz_id: quiz.id,
      question: q.question,
      correct_answer: q.correct_answer,
      topic: q.topic,
      options: q.options
    }));

    const { error: questionsError } = await supabase
      .from('quiz_questions')
      .insert(formattedQuestions);

    if (questionsError) {
      console.error('Error storing questions:', questionsError);
      throw new Error('Failed to store questions');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        quizId: quiz.id,
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
