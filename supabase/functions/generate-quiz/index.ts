
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
            content: 'You are an expert educator specializing in creating multiple-choice assessment questions. Return ONLY valid JSON arrays without any markdown formatting or additional text. Use ONLY double quotes (not single quotes) for all keys and string values. Do not use triple quotes or escaped quotes.'
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
    
    console.log('Attempting to parse response');
    
    try {
      // Apply comprehensive JSON cleaning and correction
      content_text = cleanupJSONContent(content_text);
      
      const quizQuestions = JSON.parse(content_text);
      console.log('Successfully parsed quiz questions');

      // Validate and normalize the questions to ensure all required fields exist
      const validatedQuestions = validateAndNormalizeQuestions(quizQuestions, difficulty);

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

// Clean up and fix common JSON issues in AI responses
function cleanupJSONContent(content: string): string {
  // Remove any markdown code blocks
  let cleaned = content.replace(/```json\n|\n```|```/g, '');
  
  // Find the actual JSON array
  if (!cleaned.trim().startsWith('[')) {
    const startIdx = cleaned.indexOf('[');
    if (startIdx >= 0) {
      cleaned = cleaned.substring(startIdx);
    }
  }
  
  // Find the end of the array
  const endIdx = cleaned.lastIndexOf(']');
  if (endIdx >= 0 && endIdx < cleaned.length - 1) {
    cleaned = cleaned.substring(0, endIdx + 1);
  }
  
  // Remove comments
  cleaned = cleaned.replace(/\/\/.*$/gm, '');
  
  // Fix double and triple quotes - major source of errors
  cleaned = cleaned.replace(/"""/g, '"');
  cleaned = cleaned.replace(/""/g, '"');
  
  // Replace single quotes with double quotes for both keys and string values
  // But careful with content that might have apostrophes
  cleaned = cleaned.replace(/'([^']*)'(?=\s*:)/g, '"$1"'); // For keys
  cleaned = cleaned.replace(/:(\s*)'([^']*)'([,}\]])/g, ':$1"$2"$3'); // For values
  
  // Fix unquoted properties in JSON
  cleaned = cleaned.replace(/([{,]\s*)(\w+)(\s*):/g, '$1"$2"$3:');
  
  // Fix missing quotes around string values
  cleaned = cleaned.replace(/:(\s*)([A-Za-z][A-Za-z0-9\s]*[A-Za-z0-9])([,}\]])/g, ':"$2"$3');
  
  // Remove trailing commas in arrays and objects (common syntax error)
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
  
  return cleaned;
}

// Validate and normalize questions to ensure they have all required fields
function validateAndNormalizeQuestions(questions: any[], difficulty: string): any[] {
  if (!Array.isArray(questions)) {
    throw new Error('Questions must be an array');
  }
  
  return questions.map((q, index) => {
    if (!q.question) {
      throw new Error(`Question at index ${index} is missing question text`);
    }
    
    if (!q.options || typeof q.options !== 'object') {
      throw new Error(`Question at index ${index} has invalid options`);
    }
    
    const normalizedOptions = {
      A: q.options.A || '',
      B: q.options.B || '',
      C: q.options.C || '',
      D: q.options.D || ''
    };
    
    if (!q.correctAnswer) {
      throw new Error(`Question at index ${index} is missing correctAnswer`);
    }
    
    // Normalize and clean up string fields
    return {
      question: String(q.question).replace(/^["']|["']$/g, ''),
      options: normalizedOptions,
      correctAnswer: String(q.correctAnswer).replace(/^["']|["']$/g, ''),
      topic: String(q.topic || '').replace(/^["']|["']$/g, ''),
      points: Number(q.points) || 1,
      explanation: String(q.explanation || '').replace(/^["']|["']$/g, ''),
      difficulty: difficulty,
      conceptTested: String(q.conceptTested || '').replace(/^["']|["']$/g, ''),
      learningObjective: String(q.learningObjective || '').replace(/^["']|["']$/g, '')
    };
  });
}

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

    VERY IMPORTANT:
    1. Use ONLY simple double quotes (") for all strings
    2. Do NOT use single quotes (') anywhere in the JSON
    3. Do NOT use escaped quotes or multiple quotes
    4. Make sure all JSON is properly formatted with no syntax errors
    5. Do not include ANY comments in the JSON
    6. Do not include any markdown formatting
    7. Return ONLY the valid JSON array with no additional text

    Generate exactly ${topics.reduce((sum, t) => sum + t.numQuestions, 0)} questions.
    ${teacherContext?.name ? `Created by ${teacherContext.name}` : ''}
    ${teacherContext?.school ? `for ${teacherContext.school}` : ''}
  `;
}
