import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to trim content to a reasonable length while preserving meaning
const trimContent = (content: string, maxLength: number = 4000): string => {
  if (!content) return '';
  if (content.length <= maxLength) return content;

  // Split into paragraphs and select the most relevant ones
  const paragraphs = content.split('\n\n');
  let trimmedContent = '';
  let currentLength = 0;

  // Keep adding paragraphs until we reach the max length
  for (const paragraph of paragraphs) {
    if (currentLength + paragraph.length > maxLength) break;
    trimmedContent += paragraph + '\n\n';
    currentLength += paragraph.length + 2; // +2 for the newlines
  }

  console.log(`Content trimmed from ${content.length} to ${trimmedContent.length} characters`);
  return trimmedContent.trim();
};

// Function to generate quiz questions for a content chunk
async function generateQuestionsForChunk(
  content: string,
  topics: { name: string; questionCount: number }[]
): Promise<any> {
  if (!content || !topics || topics.length === 0) {
    console.error('Invalid input for question generation:', { content: !!content, topicsLength: topics?.length });
    throw new Error('Invalid input for question generation');
  }

  const prompt = `You are a quiz generator. Create a quiz based on the following content and topics.

Content:
${content}

Topics to cover:
${topics.map((topic, index) => `${index + 1}. ${topic.name} (${topic.questionCount} questions)`).join('\n')}

Requirements:
1. Each question must test understanding, not just recall
2. Each question must have exactly four answer options labeled A, B, C, and D
3. One option must be correct, three must be plausible but incorrect
4. Questions must directly reference the content
5. Avoid obvious incorrect answers

Format each question as a JSON object with:
{
  "question": "the question text",
  "options": {
    "A": "first option",
    "B": "second option",
    "C": "third option",
    "D": "fourth option"
  },
  "correct_answer": "A/B/C/D",
  "topic": "the topic name"
}

Return an array of these question objects.`;

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
            content: 'You are an expert at creating educational quiz questions. Generate clear, focused questions with specific, unambiguous answers.'
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
    console.error('Error generating questions:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log('Received request data:', requestData);

    if (!requestData.courseContent || !requestData.topics) {
      throw new Error('Missing required fields: courseContent and topics are required');
    }

    // Validate topics structure
    if (!Array.isArray(requestData.topics)) {
      throw new Error('Topics must be an array');
    }

    const content = trimContent(requestData.courseContent);
    console.log('Trimmed content length:', content.length);

    // Generate questions
    const questions = await generateQuestionsForChunk(content, requestData.topics);
    console.log(`Generated ${questions.length} questions`);

    // Deduplicate questions
    const uniqueQuestions = Array.from(new Set(questions.map(q => JSON.stringify(q))))
      .map(q => JSON.parse(q));

    console.log(`Returning ${uniqueQuestions.length} unique questions`);

    return new Response(
      JSON.stringify({ questions: uniqueQuestions }), 
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