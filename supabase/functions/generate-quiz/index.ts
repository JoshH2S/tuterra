
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const MAX_CONTENT_LENGTH = 75000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LIMITS = {
  MAX_FILE_SIZE: 75000, // Keep original max file size
  MAX_CHUNK_SIZE: 12000, // Size for each processing chunk
  MAX_TOKENS_PER_REQUEST: 14000, // Safe limit for GPT-3.5-turbo
};

const GENERATION_CONFIG = {
  model: 'gpt-3.5-turbo',
  temperature: 0.3,  // Lowered for more consistent JSON output
  max_tokens: 2000,
  presence_penalty: 0.0,
  frequency_penalty: 0.0
};

interface ContentChunk {
  content: string;
  topics: Array<{ description: string; numQuestions: number }>;
  startIndex: number;
}

function splitContentIntoChunks(content: string, topics: any[]): ContentChunk[] {
  const chunks: ContentChunk[] = [];
  let currentIndex = 0;

  while (currentIndex < content.length) {
    // Calculate remaining questions based on content size
    const remainingContent = content.length - currentIndex;
    const questionsPerChunk = Math.ceil(
      (remainingContent / content.length) * topics.reduce((sum, t) => sum + t.numQuestions, 0)
    );

    // Distribute questions across topics for this chunk
    const chunkTopics = topics.map(topic => ({
      description: topic.description,
      numQuestions: Math.ceil((topic.numQuestions / topics.reduce((sum, t) => sum + t.numQuestions, 0)) * questionsPerChunk)
    }));

    // Get chunk content
    let chunkContent = content.slice(currentIndex, currentIndex + LIMITS.MAX_CHUNK_SIZE);
    // Ensure chunk ends at a sentence
    const lastSentenceEnd = chunkContent.match(/[.!?][^.!?]*$/);
    if (lastSentenceEnd) {
      chunkContent = chunkContent.slice(0, lastSentenceEnd.index + 1);
    }

    chunks.push({
      content: chunkContent,
      topics: chunkTopics,
      startIndex: currentIndex
    });

    currentIndex += chunkContent.length;
  }

  return chunks;
}

function generatePromptForChunk(chunk: ContentChunk, difficulty: string) {
  return `
Generate ${chunk.topics.reduce((sum, t) => sum + t.numQuestions, 0)} questions from:

${chunk.content}

Topics: ${chunk.topics.map(t => `${t.description} (${t.numQuestions} questions)`).join(', ')}
Difficulty: ${difficulty}

Return valid JSON array with required fields:
{
  "question": "text",
  "options": {"A": "text", "B": "text", "C": "text", "D": "text"},
  "correctAnswer": "A|B|C|D",
  "topic": "topic name",
  "points": number,
  "explanation": "text",
  "difficulty": "${difficulty}",
  "conceptTested": "text",
  "learningObjective": "text"
}`;
}

async function generateQuizFromChunks(chunks: ContentChunk[], difficulty: string, teacherContext?: { name?: string; school?: string }) {
  const allQuestions = [];
  let errorOccurred = false;
  let errorDetails = null;

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
8. Points value MUST be a number, not a string

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

Your response must be parseable by JSON.parse() with no modifications.`;

  for (const chunk of chunks) {
    try {
      console.log(`Processing chunk starting at index ${chunk.startIndex} with topics: ${chunk.topics.map(t => t.description).join(', ')}`);
      
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
            { role: 'user', content: generatePromptForChunk(chunk, difficulty) }
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error generating questions for chunk at index ${chunk.startIndex}:`, errorData);
        errorOccurred = true;
        errorDetails = errorData;
        continue; // Try the next chunk
      }

      const data = await response.json();
      console.log(`Successfully received response for chunk at index ${chunk.startIndex}`);

      try {
        // Apply comprehensive JSON cleaning and correction
        const content_text = cleanupJSONContent(data.choices[0].message.content);
        
        // Parse the cleaned content
        const chunkQuestions = JSON.parse(content_text);
        
        // Validate and add chunk questions to all questions
        if (Array.isArray(chunkQuestions) && chunkQuestions.length > 0) {
          allQuestions.push(...chunkQuestions);
        }
      } catch (parseError) {
        console.error(`JSON Parse Error for chunk at index ${chunk.startIndex}:`, parseError);
        console.error('Raw content:', data.choices[0].message.content);
        // Continue processing other chunks
      }

    } catch (error) {
      console.error(`Error processing chunk at index ${chunk.startIndex}:`, error);
      errorOccurred = true;
      errorDetails = error;
      // Continue processing other chunks
    }
  }

  // Return whatever questions we were able to generate, or throw error if none
  if (allQuestions.length === 0 && errorOccurred) {
    throw new Error(`Failed to generate any valid questions: ${JSON.stringify(errorDetails)}`);
  }

  return allQuestions;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, topics, difficulty, teacherName, school } = await req.json();

    // Validate input
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid content format');
    }

    if (!Array.isArray(topics) || topics.length === 0) {
      throw new Error('Invalid topics format');
    }

    if (content.length > LIMITS.MAX_FILE_SIZE) {
      throw new Error(`Content exceeds maximum length of ${LIMITS.MAX_FILE_SIZE} characters`);
    }
    
    const trimmedContent = content.slice(0, MAX_CONTENT_LENGTH);
    console.log('Processing request with content length:', trimmedContent.length);
    console.log('Number of topics:', topics.length);

    // Split content into manageable chunks
    const chunks = splitContentIntoChunks(trimmedContent, topics);
    console.log(`Content split into ${chunks.length} chunks`);
    
    const teacherContext = { name: teacherName, school: school };
    
    // Generate questions from each chunk
    const quizQuestions = await generateQuizFromChunks(chunks, difficulty, teacherContext);
    console.log(`Generated a total of ${quizQuestions.length} questions`);

    // Validate and normalize the questions to ensure all required fields exist
    const validatedQuestions = validateAndNormalizeQuestions(quizQuestions, difficulty);
    console.log(`Validated ${validatedQuestions.length} questions`);

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
  } catch (error) {
    console.error('Error processing quiz:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.stack
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
    let cleaned = content;
    
    // Remove markdown and find JSON array
    cleaned = cleaned.replace(/```json\n|\n```|```/g, '');
    cleaned = cleaned.substring(cleaned.indexOf('['), cleaned.lastIndexOf(']') + 1);
    
    // Fix quotes - more careful replacement
    cleaned = cleaned.replace(/=>"/g, ':"');  // Fix arrow syntax
    cleaned = cleaned.replace(/(\w)"(\w)/g, '$1\\"$2');  // Escape internal quotes
    cleaned = cleaned.replace(/([{,]\s*)(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '$1"$3":');  // Fix property names
    
    // Remove problematic characters
    cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    cleaned = cleaned.replace(/\\n|\\r|\\t/g, ' ');
    
    // Fix common JSON errors
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');  // Remove trailing commas
    cleaned = cleaned.replace(/\s+/g, ' ');  // Normalize whitespace
    cleaned = cleaned.replace(/"points"\s*:\s*"(\d+)"/g, '"points": $1');  // Convert string points to numbers
    
    // Validate JSON structure
    try {
      JSON.parse(cleaned);
      return cleaned;
    } catch (parseError) {
      // More aggressive cleaning if basic cleaning fails
      cleaned = cleaned.replace(/([{,]\s*)(\w+)(\s*):/g, '$1"$2"$3:'); // Fix unquoted property names
      cleaned = cleaned.replace(/:\\?['"]?([^"'{}[\],\s]+)['"]?([,}])/g, ':"$1"$2'); // Fix unquoted string values
      return cleaned;
    }
  } catch (error) {
    console.error('Error in cleanupJSONContent:', error);
    throw error;
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
