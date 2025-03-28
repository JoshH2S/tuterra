
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Difficulty type and guidelines
type QuestionDifficulty = "middle_school" | "high_school" | "university" | "post_graduate";

const DIFFICULTY_GUIDELINES = {
  middle_school: {
    complexity: "basic concepts and definitions",
    language: "simple and clear language",
    points: { min: 1, max: 2 }
  },
  high_school: {
    complexity: "intermediate concepts and basic applications",
    language: "straightforward academic language",
    points: { min: 2, max: 3 }
  },
  university: {
    complexity: "advanced concepts and practical applications",
    language: "technical academic language",
    points: { min: 3, max: 4 }
  },
  post_graduate: {
    complexity: "expert-level concepts and complex analysis",
    language: "sophisticated technical language",
    points: { min: 4, max: 5 }
  }
};

const LIMITS = {
  MAX_FILE_SIZE: 75_000, // Keep original max file size
  MAX_CHUNK_SIZE: 12_000, // Size for each processing chunk
  MAX_TOKENS_PER_REQUEST: 14_000, // Safe limit for GPT-3.5-turbo
};

interface Topic {
  description: string;
  numQuestions: number;
}

interface ContentChunk {
  content: string;
  topics: Topic[];
  startIndex: number;
}

function splitContentIntoChunks(content: string, topics: Topic[]): ContentChunk[] {
  const chunks: ContentChunk[] = [];
  let currentIndex = 0;

  // Calculate total questions requested
  const totalQuestions = topics.reduce((sum, t) => sum + t.numQuestions, 0);
  console.log(`Total questions requested: ${totalQuestions}`);
  console.log(`Content split into chunks`);

  while (currentIndex < content.length) {
    // Calculate remaining content percentage
    const remainingContent = content.length - currentIndex;
    const contentPercentage = remainingContent / content.length;
    
    // Calculate questions for this chunk based on content percentage
    const questionsForChunk = Math.max(1, Math.ceil(contentPercentage * totalQuestions));
    
    // Distribute questions proportionally across topics
    const chunkTopics = topics.map(topic => {
      const topicPercentage = topic.numQuestions / totalQuestions;
      const topicQuestions = Math.max(1, Math.round(questionsForChunk * topicPercentage));
      return {
        description: topic.description,
        numQuestions: topicQuestions
      };
    });
    
    // Ensure we don't exceed the original requested number of questions
    let assignedQuestions = chunkTopics.reduce((sum, t) => sum + t.numQuestions, 0);
    if (assignedQuestions > questionsForChunk) {
      // Adjust the largest topic down if we allocated too many questions
      const largestTopic = chunkTopics.reduce(
        (max, topic) => topic.numQuestions > max.numQuestions ? topic : max, 
        chunkTopics[0]
      );
      largestTopic.numQuestions -= (assignedQuestions - questionsForChunk);
    }

    // Get chunk content
    const endIndex = Math.min(content.length, currentIndex + LIMITS.MAX_CHUNK_SIZE);
    let chunkContent = content.slice(currentIndex, endIndex);
    
    // Try to end at a sentence if possible
    if (endIndex < content.length) {
      const lastSentenceMatch = chunkContent.match(/[.!?][^.!?]*$/);
      if (lastSentenceMatch && lastSentenceMatch.index) {
        chunkContent = chunkContent.slice(0, lastSentenceMatch.index + 1);
      }
    }

    chunks.push({
      content: chunkContent,
      topics: chunkTopics,
      startIndex: currentIndex
    });

    currentIndex += chunkContent.length;
    console.log(`Processing chunk starting at index ${currentIndex} with topics: ${chunkTopics.map(t => t.description).join(', ')}`);
  }

  return chunks;
}

function cleanupJSONContent(content: string): string {
  try {
    let cleaned = content;
    
    // Remove markdown and find JSON array
    cleaned = cleaned.replace(/```json\n|\n```|```/g, '');
    
    // Extract the JSON array
    const startBracket = cleaned.indexOf('[');
    const endBracket = cleaned.lastIndexOf(']');
    if (startBracket >= 0 && endBracket >= 0) {
      cleaned = cleaned.substring(startBracket, endBracket + 1);
    }
    
    // Fix quotes - more careful replacement
    cleaned = cleaned.replace(/=>"/g, ':"');  // Fix arrow syntax
    cleaned = cleaned.replace(/(\w)"(\w)/g, '$1\\"$2');  // Escape internal quotes
    cleaned = cleaned.replace(/([{,]\s*)(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '$1"$3":');  // Fix property names
    
    // Remove problematic characters
    cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    cleaned = cleaned.replace(/\\n|\\r|\\t/g, ' ');
    
    // Fix trailing commas
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
    
    // Validate JSON structure
    try {
      JSON.parse(cleaned);
      return cleaned;
    } catch (parseError) {
      console.error("First parse attempt failed:", parseError.message);
      // If parsing fails, try more aggressive cleaning
      cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');  // Remove trailing commas
      cleaned = cleaned.replace(/\s+/g, ' ');  // Normalize whitespace
      return cleaned;
    }
  } catch (error) {
    console.error('Error in cleanupJSONContent:', error);
    throw error;
  }
}

function generatePromptForChunk(chunk: ContentChunk, difficulty: string) {
  // Ensure difficulty is a valid QuestionDifficulty
  const difficultyLevel = difficulty as QuestionDifficulty;
  const guidelines = DIFFICULTY_GUIDELINES[difficultyLevel];
  
  // Make sure to explicitly request the correct number of questions for each topic
  const topicsWithCounts = chunk.topics
    .map(t => `${t.description} (${t.numQuestions} questions)`)
    .join(', ');
  
  const totalQuestions = chunk.topics.reduce((sum, t) => sum + t.numQuestions, 0);
  
  return `
Generate exactly ${totalQuestions} multiple-choice questions from the following content, 
matching the ${difficulty} difficulty level:

Content:
${chunk.content}

Topics and question counts: ${topicsWithCounts}

Difficulty Requirements for ${difficulty}:
- Complexity Level: ${guidelines.complexity}
- Language Level: ${guidelines.language}
- Points Range: ${guidelines.points.min}-${guidelines.points.max} points per question
- Questions should challenge ${difficulty.replace('_', ' ')} level students appropriately

Topics distribution:
${chunk.topics.map(t => `- ${t.description}: ${t.numQuestions} questions`).join('\n')}

Important instructions:
1. Generate EXACTLY the number of questions requested for each topic.
2. For topic "${chunk.topics[0].description}", create ${chunk.topics[0].numQuestions} questions.
${chunk.topics.slice(1).map(t => `3. For topic "${t.description}", create ${t.numQuestions} questions.`).join('\n')}

Return a valid JSON array with each question having these fields:
{
  "question": "Question text matching ${difficulty} level",
  "options": {"A": "First option", "B": "Second option", "C": "Third option", "D": "Fourth option"},
  "correctAnswer": "A or B or C or D",
  "topic": "The topic this question belongs to - must match one of the provided topics",
  "points": a number between ${guidelines.points.min} and ${guidelines.points.max},
  "explanation": "Explanation appropriate for ${difficulty} level",
  "difficulty": "${difficulty}",
  "conceptTested": "Specific concept being tested",
  "learningObjective": "Clear learning objective"
}

Return ONLY the JSON array with no additional text.`;
}

async function generateQuizFromChunks(chunks: ContentChunk[], difficulty: string) {
  const allQuestions = [];
  let processedChunks = 0;

  for (const chunk of chunks) {
    try {
      console.log(`Processing chunk ${++processedChunks} of ${chunks.length}`);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          temperature: 0.3,
          max_tokens: 2000,
          messages: [
            {
              role: 'system',
              content: 'Generate multiple-choice questions in valid JSON format. Each question must belong to one of the specified topics and follow the exact format requested.'
            },
            {
              role: 'user',
              content: generatePromptForChunk(chunk, difficulty)
            }
          ],
        }),
      });

      const result = await response.json();
      
      if (!result.choices || !result.choices[0] || !result.choices[0].message) {
        console.error("Invalid response from OpenAI:", result);
        throw new Error("Invalid response from OpenAI");
      }
      
      const cleanedContent = cleanupJSONContent(result.choices[0].message.content);
      
      try {
        const questions = JSON.parse(cleanedContent);
        console.log(`Successfully received response for chunk at index ${chunk.startIndex}`);
        
        // Validate that we got the right number of questions for each topic
        const topicCounts = {};
        questions.forEach(q => {
          topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
        });
        
        console.log("Topic distribution in response:", topicCounts);
        allQuestions.push(...questions);
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        console.error("Cleaned content that failed to parse:", cleanedContent);
        throw new Error(`Failed to parse questions: ${parseError.message}`);
      }
    } catch (error) {
      console.error(`Error processing chunk ${processedChunks}:`, error);
      throw error;
    }
  }

  console.log(`Generated a total of ${allQuestions.length} questions`);
  return allQuestions;
}

function validateAndNormalizeQuestions(questions: any[], difficulty: string) {
  // Ensure difficulty is a valid QuestionDifficulty
  const difficultyLevel = difficulty as QuestionDifficulty;
  const guidelines = DIFFICULTY_GUIDELINES[difficultyLevel];
  
  const validatedQuestions = questions.map(q => {
    // Convert points to number if it's a string
    let points = typeof q.points === 'string' ? parseInt(q.points, 10) : q.points;
    
    // Enforce points range according to difficulty level
    points = Math.min(Math.max(points, guidelines.points.min), guidelines.points.max);
    
    return {
      ...q,
      points: isNaN(points) ? guidelines.points.min : points, // Default to min if invalid
      difficulty: difficultyLevel,
      validated_at: new Date().toISOString()
    };
  });
  
  console.log(`Validated ${validatedQuestions.length} questions`);
  return validatedQuestions;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, topics, difficulty } = await req.json();
    
    // Validate difficulty
    if (!Object.keys(DIFFICULTY_GUIDELINES).includes(difficulty)) {
      throw new Error('Invalid difficulty level');
    }
    
    // Validate input
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid content format');
    }

    if (!Array.isArray(topics) || topics.length === 0) {
      throw new Error('Invalid topics format');
    }
    
    // Trim content to maximum length
    const trimmedContent = content.slice(0, LIMITS.MAX_FILE_SIZE);
    console.log(`Processing request with content length: ${trimmedContent.length}`);
    console.log(`Number of topics: ${topics.length}`);
    
    // Split content into manageable chunks
    const chunks = splitContentIntoChunks(trimmedContent, topics);
    
    // Generate questions from chunks
    const questions = await generateQuizFromChunks(chunks, difficulty);
    
    // Validate and normalize questions
    const validatedQuestions = validateAndNormalizeQuestions(questions, difficulty);
    
    return new Response(JSON.stringify({
      quizQuestions: validatedQuestions,
      metadata: {
        topics: topics.map(t => t.description),
        difficulty,
        totalPoints: validatedQuestions.reduce((sum, q) => sum + q.points, 0),
        estimatedDuration: Math.max(15, validatedQuestions.length)
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
