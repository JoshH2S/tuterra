
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const MAX_CONTENT_LENGTH = 75000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GENERATION_CONFIG = {
  model: 'gpt-4o-mini',  // Updated to use a more current model
  temperature: 0.7,
  max_tokens: 2000,
  presence_penalty: 0.6,
  frequency_penalty: 0.8
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, topics, difficulty, teacherName, school } = await req.json();

    if (!content || !topics) {
      throw new Error('Missing required parameters: content and topics');
    }

    const trimmedContent = content.slice(0, MAX_CONTENT_LENGTH);
    console.log('Processing request with content length:', trimmedContent.length);
    console.log('Number of topics:', topics.length);

    const teacherContext = { name: teacherName, school: school };
    const prompt = generateRegularQuizPrompt(topics, difficulty, trimmedContent, teacherContext);

    console.log('Sending request to OpenAI API');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...GENERATION_CONFIG,
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert educator specializing in creating multiple-choice assessment questions. Return ONLY valid JSON arrays without any markdown formatting or additional text.'
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
    
    // Improved response cleaning
    if (content_text.includes('```')) {
      content_text = content_text.replace(/```json\n|\n```|```/g, '');
    }

    console.log('Attempting to parse response');
    
    try {
      // Sanitize the response to ensure valid JSON
      content_text = content_text.trim();
      if (!content_text.startsWith('[')) {
        // Find the first occurrence of '[' to start the JSON array
        const startIdx = content_text.indexOf('[');
        if (startIdx >= 0) {
          content_text = content_text.substring(startIdx);
        } else {
          throw new Error('Response does not contain a JSON array');
        }
      }
      
      const quizQuestions = JSON.parse(content_text);
      console.log('Successfully parsed quiz questions');

      // Validate the questions have all required fields
      const validatedQuestions = quizQuestions.map(q => ({
        question: q.question || "",
        options: q.options || { A: "", B: "", C: "", D: "" },
        correctAnswer: q.correctAnswer || "",
        topic: q.topic || "",
        points: q.points || 1,
        explanation: q.explanation || "",
        difficulty: difficulty,
        conceptTested: q.conceptTested || "",
        learningObjective: q.learningObjective || ""
      }));

      // Calculate total points
      const totalPoints = validatedQuestions.reduce((sum, q) => sum + (q.points || 1), 0);
      
      // Estimate duration (avg 1 min per question)
      const estimatedDuration = validatedQuestions.length * 1;

      return new Response(JSON.stringify({ 
        quizQuestions: validatedQuestions,
        metadata: {
          topics: topics.map(t => t.description),
          difficulty,
          totalPoints,
          estimatedDuration
        }
      }), {
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

// Helper function to generate the regular quiz prompt
function generateRegularQuizPrompt(
  topics: Array<{ description: string, numQuestions: number }>,
  difficulty: string,
  contentContext: string,
  teacherContext?: { name?: string; school?: string }
) {
  return `
    As an expert educational content creator, generate a comprehensive quiz based on this content:
    
    ${contentContext}
    
    Follow these specific guidelines for topics: ${topics.map(t => t.description).join(", ")}

    QUESTION DESIGN:
    1. Create questions that:
       - Test conceptual understanding
       - Apply knowledge to scenarios
       - Build from simpler to complex concepts
       - Match ${difficulty} education level

    2. Include a mix of:
       - Concept application
       - Problem-solving
       - Analytical thinking
       - Term/concept relationships

    3. Ensure questions:
       - Are clearly worded
       - Have one unambiguous correct answer
       - Include plausible distractors
       - Test understanding, not memorization

    TECHNICAL REQUIREMENTS:
    Return a JSON array where each question has:
    {
      "question": "clear, specific question text",
      "options": {
        "A": "option text",
        "B": "option text",
        "C": "option text",
        "D": "option text"
      },
      "correctAnswer": "A|B|C|D",
      "topic": "specific topic",
      "points": number (1-5),
      "explanation": "detailed explanation",
      "difficulty": "${difficulty}",
      "conceptTested": "specific concept",
      "learningObjective": "what this tests"
    }

    IMPORTANT: Your response MUST be a valid JSON array with no markdown formatting, comments, or extra text.
    Generate exactly ${topics.reduce((sum, t) => sum + t.numQuestions, 0)} questions.
    ${teacherContext?.name ? `Created by ${teacherContext.name}` : ''}
    ${teacherContext?.school ? `for ${teacherContext.school}` : ''}
  `;
}
