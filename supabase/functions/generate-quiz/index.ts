
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const MAX_CONTENT_LENGTH = 5000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, topics, teacherName, school } = await req.json();

    if (!content || !topics) {
      throw new Error('Missing required parameters: content and topics');
    }

    const trimmedContent = content.slice(0, MAX_CONTENT_LENGTH);
    console.log('Processing request with content length:', trimmedContent.length);
    console.log('Number of topics:', topics.length);

    const prompt = `
      As an expert educator, create a comprehensive quiz based on the following content and topics.
      Format your response as a pure JSON array without any markdown formatting.
      Each question should have these properties:
      - question: the actual question text
      - correctAnswer: the correct answer
      - topic: which topic this question relates to
      - points: number of points for this question (1 point for each question)

      Teacher Information:
      Teacher: ${teacherName || 'Not specified'}
      School: ${school || 'Not specified'}

      Content:
      ${trimmedContent}

      Topics to cover (with number of questions per topic):
      ${topics.map((topic: any, index: number) => 
        `${index + 1}. ${topic.description} (Number of questions: ${topic.numQuestions})`
      ).join('\n')}

      Instructions:
      1. Create multiple-choice questions
      2. Ensure questions are clear and unambiguous
      3. Create EXACTLY the specified number of questions for each topic
      4. Return ONLY a valid JSON array without any markdown formatting or explanatory text
      5. Each question is worth 1 point
    `;

    console.log('Sending request to OpenAI API');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert educator specializing in creating assessment questions. Return ONLY pure JSON arrays without any markdown formatting or additional text.'
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Received response from OpenAI API');

    if (!data.choices?.[0]?.message?.content) {
      console.error('Unexpected API response structure:', data);
      throw new Error('Invalid response format from OpenAI API');
    }

    let content_text = data.choices[0].message.content;
    
    // Clean up the response if it contains markdown formatting
    if (content_text.includes('```')) {
      content_text = content_text.replace(/```json\n|\n```|```/g, '');
    }

    console.log('Attempting to parse response:', content_text);
    
    try {
      const quizQuestions = JSON.parse(content_text);
      console.log('Successfully parsed quiz questions');

      return new Response(JSON.stringify({ quizQuestions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Error parsing quiz questions:', parseError);
      console.error('Raw content that failed to parse:', content_text);
      throw new Error(`Failed to parse quiz questions: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
