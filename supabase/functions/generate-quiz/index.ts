
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { QuestionDifficulty, Topic } from "./types.ts";
import { corsHeaders, DIFFICULTY_GUIDELINES } from "./config.ts";
import { splitContentIntoChunks } from "./content-processor.ts";
import { generateQuizFromChunks } from "./question-generator.ts";
import { validateAndNormalizeQuestions } from "./question-validator.ts";
import { cleanupJSONContent } from "./utils.ts";

// Get API keys from environment
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const deepSeekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Quiz generation request received");
    
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request parsed successfully");
    } catch (parseError) {
      console.error("Error parsing request JSON:", parseError);
      return new Response(JSON.stringify({ 
        error: "Invalid request format", 
        details: parseError.message
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const { content, topics, difficulty } = requestBody;
    
    // Input validation with detailed errors
    if (!content || typeof content !== 'string') {
      console.error("Invalid content format:", content);
      return new Response(JSON.stringify({ 
        error: "Invalid content format", 
        details: "Content must be a non-empty string"
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!Array.isArray(topics) || topics.length === 0) {
      console.error("Invalid topics format:", topics);
      return new Response(JSON.stringify({ 
        error: "Invalid topics format", 
        details: "Topics must be a non-empty array"
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Validate difficulty
    if (!Object.keys(DIFFICULTY_GUIDELINES).includes(difficulty)) {
      console.error("Invalid difficulty level:", difficulty);
      return new Response(JSON.stringify({ 
        error: "Invalid difficulty level", 
        details: `Supported difficulty levels: ${Object.keys(DIFFICULTY_GUIDELINES).join(', ')}`
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Log available API keys (without showing the actual keys)
    console.log(`OpenAI API key available: ${!!openAIApiKey}`);
    console.log(`DeepSeek API key available: ${!!deepSeekApiKey}`);
    
    if (!openAIApiKey) {
      console.error("OpenAI API key is missing");
      return new Response(JSON.stringify({ 
        error: "Configuration error", 
        details: "OpenAI API key is missing"
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Trim content to maximum length
    const LIMITS = {
      MAX_FILE_SIZE: 75_000, // Maximum content size in characters
    };
    
    const trimmedContent = content.slice(0, LIMITS.MAX_FILE_SIZE);
    console.log(`Processing request with content length: ${trimmedContent.length}`);
    console.log(`Number of topics: ${topics.length}`);
    
    // Track originally requested question counts
    const requestedQuestionsByTopic = topics.reduce((acc, topic) => {
      acc[topic.description] = topic.numQuestions;
      return acc;
    }, {} as Record<string, number>);
    
    // Split content into manageable chunks
    let chunks;
    try {
      chunks = splitContentIntoChunks(trimmedContent, topics);
      console.log(`Content split into ${chunks.length} chunks`);
    } catch (chunkError) {
      console.error("Error splitting content:", chunkError);
      return new Response(JSON.stringify({ 
        error: "Content processing error", 
        details: chunkError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Generate questions from chunks
    let generationResult;
    try {
      generationResult = await generateQuizFromChunks(chunks, difficulty, openAIApiKey, deepSeekApiKey);
      console.log(`Generated ${generationResult.questions.length} raw questions`);
    } catch (generationError) {
      console.error("Error generating questions:", generationError);
      return new Response(JSON.stringify({ 
        error: "Question generation failed", 
        details: generationError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const { questions: generatedQuestions, modelsUsed, stemDetected } = generationResult;
    
    if (!generatedQuestions || !Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
      console.error("No questions were generated");
      return new Response(JSON.stringify({ 
        error: "Question generation failed", 
        details: "No questions were generated"
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Validate and normalize questions
    let validatedQuestions;
    try {
      validatedQuestions = validateAndNormalizeQuestions(generatedQuestions, difficulty);
      console.log(`Validated ${validatedQuestions.length} questions`);
    } catch (validationError) {
      console.error("Error validating questions:", validationError);
      return new Response(JSON.stringify({ 
        error: "Question validation failed", 
        details: validationError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
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
    
    if (finalQuestions.length === 0) {
      console.error("No questions matched the requested topics");
      return new Response(JSON.stringify({ 
        error: "Question generation failed", 
        details: "No questions could be generated for the requested topics"
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`Returning ${finalQuestions.length} final questions`);
    
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
    console.error('Unhandled error in generate-quiz function:', error);
    console.error('Error stack:', error.stack);
    
    // Attempt to identify specific error causes
    let errorMessage = "Unknown error occurred";
    let errorDetails = error.stack || "No details available";
    
    if (error.message?.includes('fetch')) {
      errorMessage = "API communication error";
      if (error.message?.includes('429')) {
        errorMessage = "AI service rate limit exceeded";
      } else if (error.message?.includes('401') || error.message?.includes('403')) {
        errorMessage = "AI service authentication failed";
      } else if (error.message?.includes('timeout')) {
        errorMessage = "AI service request timed out";
      }
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: errorDetails
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
