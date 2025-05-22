
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

// Define content limits
const CONTENT_LIMITS = {
  MAX_CONTENT_LENGTH: 75_000, // Maximum character count for processing
  RECOMMENDED_LENGTH: 25_000, // Recommended optimal character count
  MAX_TOPICS: 10, // Maximum number of topics allowed
  MAX_QUESTIONS_PER_TOPIC: 20, // Maximum questions per topic
  MAX_TOTAL_QUESTIONS: 50, // Maximum total questions allowed
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Add a simple health check endpoint
  const url = new URL(req.url);
  if (url.pathname.endsWith('/health')) {
    console.log("Health check received");
    return new Response(JSON.stringify({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      contentLimits: CONTENT_LIMITS,
      apiKeys: {
        openAI: !!openAIApiKey,
        deepSeek: !!deepSeekApiKey
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  // Add a limits endpoint to expose backend constraints to frontend
  if (url.pathname.endsWith('/limits')) {
    console.log("Content limits requested");
    return new Response(JSON.stringify({ 
      contentLimits: CONTENT_LIMITS
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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
        details: parseError.message,
        success: false
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const { content, topics, difficulty, maxTokens, modelType } = requestBody;
    
    // Input validation with detailed errors
    if (!content || typeof content !== 'string') {
      console.error("Invalid content format:", content);
      return new Response(JSON.stringify({ 
        error: "Invalid content format", 
        details: "Content must be a non-empty string",
        success: false
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!Array.isArray(topics) || topics.length === 0) {
      console.error("Invalid topics format:", topics);
      return new Response(JSON.stringify({ 
        error: "Invalid topics format", 
        details: "Topics must be a non-empty array",
        success: false
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Check for excessive topics
    if (topics.length > CONTENT_LIMITS.MAX_TOPICS) {
      return new Response(JSON.stringify({
        error: "Too many topics",
        details: `Maximum ${CONTENT_LIMITS.MAX_TOPICS} topics are allowed, but ${topics.length} were provided`,
        success: false
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Check for excessive questions per topic
    const totalQuestionsRequested = topics.reduce((sum, t: Topic) => sum + t.numQuestions, 0);
    if (totalQuestionsRequested > CONTENT_LIMITS.MAX_TOTAL_QUESTIONS) {
      return new Response(JSON.stringify({
        error: "Too many questions requested",
        details: `Maximum ${CONTENT_LIMITS.MAX_TOTAL_QUESTIONS} total questions are allowed, but ${totalQuestionsRequested} were requested`,
        success: false
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Check individual topic question counts
    const topicWithTooManyQuestions = topics.find((t: Topic) => t.numQuestions > CONTENT_LIMITS.MAX_QUESTIONS_PER_TOPIC);
    if (topicWithTooManyQuestions) {
      return new Response(JSON.stringify({
        error: "Too many questions for a single topic",
        details: `Maximum ${CONTENT_LIMITS.MAX_QUESTIONS_PER_TOPIC} questions per topic are allowed, but ${topicWithTooManyQuestions.numQuestions} were requested for "${topicWithTooManyQuestions.description}"`,
        success: false
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Validate difficulty
    const validDifficulties = Object.keys(DIFFICULTY_GUIDELINES);
    if (!validDifficulties.includes(difficulty)) {
      console.error("Invalid difficulty level:", difficulty);
      return new Response(JSON.stringify({ 
        error: "Invalid difficulty level", 
        details: `Supported difficulty levels: ${validDifficulties.join(', ')}`,
        success: false
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
        details: "OpenAI API key is missing",
        success: false
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Check if content is too long and explicitly reject if so
    const contentLength = content.length;
    if (contentLength > CONTENT_LIMITS.MAX_CONTENT_LENGTH) {
      return new Response(JSON.stringify({
        error: "Content too large",
        details: `Content length (${contentLength} characters) exceeds the maximum allowed (${CONTENT_LIMITS.MAX_CONTENT_LENGTH} characters)`,
        recommendation: "Please reduce your content size or split it into multiple quiz generations",
        contentLimits: CONTENT_LIMITS,
        success: false
      }), {
        status: 413, // Payload Too Large
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Warn if content is approaching the limit
    const isApproachingLimit = contentLength > CONTENT_LIMITS.RECOMMENDED_LENGTH;
    
    // Trim content to maximum length - shouldn't happen since we reject above, but safety measure
    const trimmedContent = content.slice(0, CONTENT_LIMITS.MAX_CONTENT_LENGTH);
    console.log(`Processing request with content length: ${trimmedContent.length} of ${contentLength} original characters`);
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
        details: chunkError.message,
        success: false
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Generate questions from chunks
    let generationResult;
    try {
      const selectedModel = modelType || 'gpt-3.5-turbo';
      const tokensToUse = maxTokens || 2000;
      
      generationResult = await generateQuizFromChunks(
        chunks, 
        difficulty, 
        openAIApiKey, 
        deepSeekApiKey,
        selectedModel,
        tokensToUse
      );
      console.log(`Generated ${generationResult.questions.length} raw questions`);
    } catch (generationError) {
      console.error("Error generating questions:", generationError);
      return new Response(JSON.stringify({ 
        error: "Question generation failed", 
        details: generationError.message,
        success: false
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const { questions: generatedQuestions, modelsUsed, stemDetected, tokenUsage } = generationResult;
    
    if (!generatedQuestions || !Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
      console.error("No questions were generated");
      return new Response(JSON.stringify({ 
        error: "Question generation failed", 
        details: "No questions were generated. The content may not contain enough relevant information for the requested topics.",
        recommendation: "Try providing more detailed content or fewer topics",
        success: false
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
        details: validationError.message,
        success: false
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
        details: "No questions could be generated for the requested topics. The content may not contain relevant information.",
        recommendation: "Try different topics or provide more relevant content",
        success: false
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`Returning ${finalQuestions.length} final questions`);
    
    // Add mobile-friendly design considerations to questions
    const mobileOptimizedQuestions = finalQuestions.map(q => ({
      ...q,
      mobileOptimized: true
    }));
    
    return new Response(JSON.stringify({
      quizQuestions: mobileOptimizedQuestions,
      metadata: {
        topics: topics.map((t: Topic) => t.description),
        difficulty,
        totalPoints: finalQuestions.reduce((sum, q) => sum + q.points, 0),
        estimatedDuration: Math.max(15, finalQuestions.length),
        modelsUsed: Array.from(modelsUsed),
        stemTopicsDetected: stemDetected,
        contentStats: {
          originalLength: contentLength,
          processedLength: trimmedContent.length,
          wasContentTrimmed: contentLength > trimmedContent.length,
          isApproachingLimit,
          contentLimits: CONTENT_LIMITS
        },
        tokenUsage,
        generatedAt: new Date().toISOString(),
        optimizedForMobile: true
      },
      success: true
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
      details: errorDetails,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
