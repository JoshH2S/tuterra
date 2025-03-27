
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const MAX_CONTENT_LENGTH = 75000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GENERATION_CONFIG = {
  model: 'gpt-4o-mini',  // Using a more reliable model
  temperature: 0.6,      // Lower temperature for more consistent output
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

    // System prompt specifically designed for reliable JSON output
    const systemPrompt = `
You are an expert quiz generator. Create well-structured multiple-choice questions from provided content.

OUTPUT REQUIREMENTS:
1. Return VALID JSON ARRAY without any markdown formatting or commentary
2. Use ONLY standard double quotes (") for ALL string values and keys
3. DO NOT use any single quotes ('), triple quotes ("""), or escaped quotes
4. Ensure ALL required fields are included for EVERY question
5. DO NOT include any comments in the JSON
6. DO NOT include any empty or partial questions
7. DO NOT include escape characters like \\ in your text

QUESTION STRUCTURE:
- "question": Clear, well-formed question (string)
- "options": Object with exactly 4 options labeled A, B, C, D (all strings)
- "correctAnswer": Letter of correct answer (string: "A", "B", "C", or "D")
- "topic": Name of topic this question relates to (string)
- "points": Point value (number, not string)
- "explanation": Brief explanation of answer (string)
- "difficulty": Level of difficulty (string)
- "conceptTested": Main concept being tested (string)
- "learningObjective": What this question assesses (string)

Example of CORRECTLY formatted response:
[
  {
    "question": "What is the capital of France?",
    "options": {
      "A": "Paris",
      "B": "London",
      "C": "Berlin",
      "D": "Madrid"
    },
    "correctAnswer": "A",
    "topic": "Geography",
    "points": 1,
    "explanation": "Paris is the capital city of France.",
    "difficulty": "beginner",
    "conceptTested": "European capitals",
    "learningObjective": "Identify major European capital cities"
  }
]

Your response must be parseable by JSON.parse() with no modifications.`;

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
          { role: 'system', content: systemPrompt },
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
      
      // Log the cleaned content for debugging
      console.log('Cleaned JSON content:', content_text);
      
      const quizQuestions = JSON.parse(content_text);
      console.log('Successfully parsed quiz questions');

      // Filter out any malformed or empty questions
      const filteredQuestions = quizQuestions.filter(q => 
        q && q.question && q.options && q.correctAnswer && q.topic
      );
      
      if (filteredQuestions.length === 0) {
        throw new Error('No valid questions were generated');
      }

      // Validate and normalize the questions to ensure all required fields exist
      const validatedQuestions = validateAndNormalizeQuestions(filteredQuestions, difficulty);

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
      
      // Attempt recovery with more aggressive cleaning
      try {
        const recovery = attemptRecovery(content_text);
        if (recovery.length > 0) {
          // Calculate total points
          const totalPoints = recovery.reduce((sum, q) => sum + (q.points || 1), 0);
          
          // Estimate duration (avg 1 min per question)
          const estimatedDuration = recovery.length * 1;
          
          return new Response(JSON.stringify({ 
            quizQuestions: recovery,
            metadata: {
              topics: topics.map(t => t.description),
              difficulty,
              totalPoints,
              estimatedDuration
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch (recoveryError) {
        console.error('Recovery attempt failed:', recoveryError);
      }
      
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

// Enhanced JSON cleanup function to handle various formatting issues
function cleanupJSONContent(content: string): string {
  try {
    // Find the actual JSON array
    let cleaned = content;
    
    // Remove any markdown code blocks
    cleaned = cleaned.replace(/```json\n|\n```|```/g, '');
    
    // If content doesn't start with '[', try to find it
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
    
    // Remove control characters and non-printable characters
    cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    
    // Remove comments
    cleaned = cleaned.replace(/\/\/.*$/gm, '');
    
    // Replace problematic escape sequences
    cleaned = cleaned.replace(/\\"/g, '"');
    cleaned = cleaned.replace(/\\'/g, "'");
    cleaned = cleaned.replace(/\\n/g, " ");
    cleaned = cleaned.replace(/\\t/g, " ");
    
    // Fix double and triple quotes - major source of errors
    cleaned = cleaned.replace(/"""/g, '"');
    cleaned = cleaned.replace(/""/g, '"');
    
    // Replace single quotes with double quotes for both keys and string values
    cleaned = cleaned.replace(/'([^']*)'/g, '"$1"');
    
    // Fix unquoted properties in JSON
    cleaned = cleaned.replace(/([{,]\s*)(\w+)(\s*):/g, '$1"$2"$3:');
    
    // Remove spaces from property names
    cleaned = cleaned.replace(/"([^"]+)"\s+:/g, '"$1":');
    
    // Ensure strings are properly quoted
    cleaned = cleaned.replace(/:(\s*)(true|false|null|\d+)([,}\]])/g, ':$1$2$3');
    cleaned = cleaned.replace(/:(\s*)([^"{}\[\],\s]+)([,}\]])/g, ':"$2"$3');
    
    // Remove trailing commas in arrays and objects
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
    
    // Remove empty objects
    cleaned = cleaned.replace(/,\s*{\s*}\s*/g, '');
    cleaned = cleaned.replace(/\[\s*{\s*}\s*,\s*/g, '[');
    cleaned = cleaned.replace(/\s*,\s*{\s*}\s*\]/g, ']');
    
    return cleaned;
  } catch (error) {
    console.error('Error cleaning JSON content:', error);
    throw error;
  }
}

// Last resort recovery attempt for malformed JSON
function attemptRecovery(content: string): any[] {
  // Try to extract valid question objects from the string
  const validObjects: any[] = [];
  
  try {
    // Find anything that looks like a complete question object
    const regex = /{[^{}]*"question"[^{}]*"options"[^{}]*"correctAnswer"[^{}]*}/g;
    const matches = content.match(regex);
    
    if (matches && matches.length > 0) {
      for (const match of matches) {
        try {
          // Clean up each potential object
          const cleaned = match
            .replace(/'/g, '"')
            .replace(/([{,]\s*)(\w+)(\s*):/g, '$1"$2"$3:')
            .replace(/:\s*"([^"]*)\\"/g, ':"$1"')
            .replace(/,\s*}/g, '}');
          
          const obj = JSON.parse(cleaned);
          if (obj.question && obj.options && obj.correctAnswer) {
            validObjects.push(obj);
          }
        } catch (e) {
          console.error('Failed to parse potential question:', match);
        }
      }
    }
    
    // If we found any valid objects, return them
    if (validObjects.length > 0) {
      return validateAndNormalizeQuestions(validObjects, "intermediate");
    }
    
    // If regex approach failed, try parsing each line as a potential object
    const lines = content.split('\n');
    let potentialObject = '';
    let inObject = false;
    
    for (const line of lines) {
      if (line.includes('{') && !inObject) {
        inObject = true;
        potentialObject = line;
      } else if (inObject) {
        potentialObject += line;
        if (line.includes('}')) {
          inObject = false;
          try {
            const cleaned = potentialObject
              .replace(/'/g, '"')
              .replace(/([{,]\s*)(\w+)(\s*):/g, '$1"$2"$3:')
              .replace(/,\s*}/g, '}');
            
            const obj = JSON.parse(cleaned);
            if (obj.question && obj.options && obj.correctAnswer) {
              validObjects.push(obj);
            }
          } catch (e) {
            // Skip invalid objects
          }
          potentialObject = '';
        }
      }
    }
    
    return validateAndNormalizeQuestions(validObjects, "intermediate");
  } catch (error) {
    console.error('Recovery attempt failed completely:', error);
    return [];
  }
}

// Validate and normalize questions to ensure they have all required fields
function validateAndNormalizeQuestions(questions: any[], difficulty: string): any[] {
  if (!Array.isArray(questions)) {
    throw new Error('Questions must be an array');
  }
  
  return questions.map((q, index) => {
    try {
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
      
      // Coerce string points to number
      let points = q.points;
      if (typeof points === 'string') {
        points = parseInt(points, 10);
        if (isNaN(points)) points = 1;
      } else if (typeof points !== 'number') {
        points = 1;
      }
      
      // Normalize and clean up string fields
      return {
        question: String(q.question).replace(/^["']|["']$/g, ''),
        options: normalizedOptions,
        correctAnswer: String(q.correctAnswer).replace(/^["']|["']$/g, ''),
        topic: String(q.topic || '').replace(/^["']|["']$/g, ''),
        points: points,
        explanation: String(q.explanation || '').replace(/^["']|["']$/g, ''),
        difficulty: difficulty,
        conceptTested: String(q.conceptTested || '').replace(/^["']|["']$/g, ''),
        learningObjective: String(q.learningObjective || '').replace(/^["']|["']$/g, '')
      };
    } catch (error) {
      console.error(`Error processing question at index ${index}:`, error);
      // Return a default question if individual validation fails
      return {
        question: `[MALFORMED QUESTION ${index + 1}] Please try again`,
        options: {
          A: "Option A",
          B: "Option B",
          C: "Option C",
          D: "Option D"
        },
        correctAnswer: "A",
        topic: "Error Recovery",
        points: 1,
        explanation: "This is a replacement for a malformed question. Please regenerate the quiz.",
        difficulty: difficulty,
        conceptTested: "Error Handling",
        learningObjective: "Understand error recovery mechanisms"
      };
    }
  });
}

// Helper function to generate the regular quiz prompt
function generateRegularQuizPrompt(
  topics: Array<{ description: string, numQuestions: number }>,
  difficulty: string,
  contentContext: string,
  teacherContext?: { name?: string; school?: string }
) {
  // Calculate total questions to generate
  const totalQuestions = topics.reduce((sum, t) => sum + t.numQuestions, 0);
  
  return `
    Generate a quiz with ${totalQuestions} multiple-choice questions based on this content:
    
    ${contentContext}
    
    Focus on these topics: ${topics.map(t => t.description).join(", ")}

    QUESTION DESIGN:
    1. Create questions that:
       - Test conceptual understanding at the ${difficulty} level
       - Apply knowledge to scenarios
       - Build from simpler to complex concepts
       - Are clearly worded with one unambiguous correct answer

    2. Include questions that test:
       - Concept application
       - Problem-solving
       - Analytical thinking
       - Term/concept relationships

    3. For each question, provide:
       - Clear, specific question text
       - Four options (A, B, C, D) with only one correct answer
       - Plausible distractors that test common misconceptions
       - A brief explanation for the correct answer
       - Topic identification
       - Point value (1-5 based on difficulty)
       - The concept being tested
       - Learning objective it addresses

    DISTRIBUTION:
    Generate exactly this many questions per topic:
    ${topics.map(t => `- ${t.description}: ${t.numQuestions} questions`).join('\n')}
    
    ${teacherContext?.name ? `Created by ${teacherContext.name}` : ''}
    ${teacherContext?.school ? `for ${teacherContext.school}` : ''}
  `;
}
