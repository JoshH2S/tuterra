import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to trim content to a reasonable length while preserving meaning
const trimContent = (content: string, maxLength: number = 4000): string => {
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { courseContent, topics } = await req.json();
    console.log('Received request with topics:', topics);

    if (!courseContent || !topics || !Array.isArray(topics) || topics.length === 0) {
      throw new Error('Invalid request: Missing course content or topics');
    }

    // Trim content to avoid token limit issues
    const trimmedContent = trimContent(courseContent);
    console.log('Content length after trimming:', trimmedContent.length);

    // Format the prompt for quiz generation with a more structured approach
    const prompt = `You are a quiz generator. Create a quiz based on the uploaded textbook content and the specified topics with corresponding question counts. The quiz must follow this exact format:

1. Each question must be preceded by a number followed by a period (e.g., 1., 2., 3.)
2. Each question must have exactly four answer options labeled A, B, C, and D
3. The correct answer must be explicitly marked after the options
4. All questions must directly reference the content for accuracy

Course Content:
${trimmedContent}

Topics to cover:
${topics.map((t: any, index: number) => `${index + 1}. ${t.name}: ${t.questionCount} questions`).join('\n')}

Generate the questions in this format:

1. [Question Text]
   A. [Answer Option A]
   B. [Answer Option B]
   C. [Answer Option C]
   D. [Answer Option D]
   Correct Answer: [A/B/C/D]

Each question should test key concepts comprehensively and be relevant to the topics.
Format your response as a JSON array where each object has:
{
  "question": "the full question text",
  "correct_answer": "the correct answer (A, B, C, or D)",
  "topic": "the topic name"
}`;

    console.log('Sending request to OpenAI...');

    // Call OpenAI API
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
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Received response from OpenAI');

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI');
    }

    let generatedQuestions;
    try {
      generatedQuestions = JSON.parse(data.choices[0].message.content);
      console.log('Successfully parsed questions:', generatedQuestions);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      throw new Error('Failed to parse generated questions');
    }

    // Validate the response format
    if (!Array.isArray(generatedQuestions)) {
      console.error('Generated questions is not an array:', generatedQuestions);
      throw new Error('Generated questions must be an array');
    }

    // Validate each question has required fields
    generatedQuestions.forEach((q: any, index: number) => {
      if (!q.question || !q.correct_answer || !q.topic) {
        throw new Error(`Question at index ${index} is missing required fields`);
      }
    });

    return new Response(JSON.stringify({ questions: generatedQuestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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