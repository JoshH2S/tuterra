
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { QuestionDifficulty, Topic } from "./types.ts";
import { LIMITS, corsHeaders, DIFFICULTY_GUIDELINES } from "./config.ts";
import { splitContentIntoChunks } from "./content-processor.ts";
import { generateQuizFromChunks } from "./question-generator.ts";
import { validateAndNormalizeQuestions } from "./question-validator.ts";

// Get API keys from environment
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const deepSeekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

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
    
    // Log available API keys (without showing the actual keys)
    console.log(`OpenAI API key available: ${!!openAIApiKey}`);
    console.log(`DeepSeek API key available: ${!!deepSeekApiKey}`);
    
    // Trim content to maximum length
    const trimmedContent = content.slice(0, LIMITS.MAX_FILE_SIZE);
    console.log(`Processing request with content length: ${trimmedContent.length}`);
    console.log(`Number of topics: ${topics.length}`);
    
    // Track originally requested question counts
    const requestedQuestionsByTopic = topics.reduce((acc, topic) => {
      acc[topic.description] = topic.numQuestions;
      return acc;
    }, {} as Record<string, number>);
    
    // Split content into manageable chunks
    const chunks = splitContentIntoChunks(trimmedContent, topics);
    
    // Generate questions from chunks
    const { questions: generatedQuestions, modelsUsed, stemDetected } = 
      await generateQuizFromChunks(chunks, difficulty, openAIApiKey, deepSeekApiKey);
    
    // Validate and normalize questions
    const validatedQuestions = validateAndNormalizeQuestions(generatedQuestions, difficulty);
    
    // Ensure we don't exceed the requested number of questions per topic
    const finalQuestions: any[] = [];
    const questionsByTopic: Record<string, any[]> = {};
    
    // Group questions by topic
    validatedQuestions.forEach(q => {
      if (!questionsByTopic[q.topic]) {
        questionsByTopic[q.topic] = [];
      }
      questionsByTopic[q.topic].push(q);
    });
    
    // Take exactly the requested number of questions for each topic
    Object.entries(requestedQuestionsByTopic).forEach(([topic, requestedCount]) => {
      const topicQuestions = questionsByTopic[topic] || [];
      const questionsToInclude = topicQuestions.slice(0, requestedCount);
      finalQuestions.push(...questionsToInclude);
      
      console.log(`Topic "${topic}": requested ${requestedCount}, generated ${topicQuestions.length}, included ${questionsToInclude.length}`);
    });
    
    return new Response(JSON.stringify({
      quizQuestions: finalQuestions,
      metadata: {
        topics: topics.map((t: Topic) => t.description),
        difficulty,
        totalPoints: finalQuestions.reduce((sum, q) => sum + q.points, 0),
        estimatedDuration: Math.max(15, finalQuestions.length),
        modelsUsed: Array.from(modelsUsed),
        stemTopicsDetected: stemDetected
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
