import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { QuestionValidator } from "./validators.ts";
import { CacheManager } from "./cache.ts";

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface QuestionRequest {
  industry: string;
  role: string;
  jobDescription?: string;
  numberOfQuestions?: number;
  timeLimit?: number;
  categories?: Array<{ name: string; weight: number }>;
  sessionId: string;
}

interface Question {
  text: string;
  category: string;
  difficulty: string;
  estimatedTimeSeconds: number;
  keywords: string[];
}

class QuestionGenerator {
  private cache: CacheManager;
  private validator: QuestionValidator;

  constructor() {
    this.cache = new CacheManager();
    this.validator = new QuestionValidator();
  }

  private generatePrompt(request: QuestionRequest): string {
    const {
      industry,
      role,
      jobDescription,
      numberOfQuestions = 5,
      categories
    } = request;

    const categoryPrompt = categories
      ? `Focus on these question categories with their weights: ${categories
          .map(c => `${c.name} (${c.weight}%)`)
          .join(', ')}`
      : 'Include a mix of technical, behavioral, problem-solving, and cultural fit questions';

    return `
      Generate ${numberOfQuestions} realistic job interview questions for a ${role} position in the ${industry} industry.
      
      ${jobDescription ? `Job Description: ${jobDescription}` : ''}
      
      ${categoryPrompt}
      
      Requirements:
      1. Questions should progress from easier to more complex
      2. Each question must include:
         - Question text
         - Category (Technical, Behavioral, Problem Solving, Cultural Fit)
         - Difficulty (easy, medium, hard)
         - Estimated answer time (60-300 seconds)
         - 3-5 relevant keywords for good answers
      
      Return ONLY a valid JSON array of objects with this structure:
      [{ 
        "text": "question text", 
        "category": "category name", 
        "difficulty": "difficulty level",
        "estimatedTimeSeconds": number, 
        "keywords": ["keyword1", "keyword2"]
      }]
    `.trim();
  }

  private async callOpenAI(prompt: string): Promise<any> {
    console.log("Calling OpenAI API...");
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert AI interviewer. Respond ONLY with valid JSON arrays containing interview questions.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" } // Enforce JSON response
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("OpenAI API error:", error);
        throw new Error(error.error?.message || 'OpenAI API error');
      }

      return response.json();
    } catch (error) {
      console.error("Error calling OpenAI:", error);
      throw error;
    }
  }

  private normalizeQuestion(q: any): Question {
    return {
      text: String(q.text).trim(),
      category: String(q.category).trim(),
      difficulty: String(q.difficulty).toLowerCase(),
      estimatedTimeSeconds: Math.min(Math.max(60, Number(q.estimatedTimeSeconds) || 120), 300),
      keywords: Array.isArray(q.keywords) 
        ? q.keywords.map((k: any) => String(k).toLowerCase()).slice(0, 5)
        : []
    };
  }

  async generateQuestions(request: QuestionRequest): Promise<Question[]> {
    console.log("Generating questions with params:", JSON.stringify({
      industry: request.industry,
      role: request.role,
      hasJobDescription: !!request.jobDescription,
      requestedQuestions: request.numberOfQuestions
    }));
    
    // Check cache first
    const cacheKey = this.cache.generateKey(request);
    const cachedQuestions = await this.cache.get(cacheKey);
    if (cachedQuestions) {
      console.log('Using cached questions for session:', request.sessionId, 'found', cachedQuestions.length, 'questions');
      return cachedQuestions;
    }

    const prompt = this.generatePrompt(request);
    console.log("Generated prompt length:", prompt.length);
    
    try {
      const data = await this.callOpenAI(prompt);
      const content = data.choices?.[0]?.message?.content?.trim();

      if (!content) {
        console.error('Empty response from OpenAI');
        throw new Error('Empty response from OpenAI');
      }

      console.log("Received response length:", content.length);
      
      try {
        let parsedQuestions;
        
        // Try to parse the returned content as JSON directly
        try {
          parsedQuestions = JSON.parse(content);
          console.log("Successfully parsed JSON directly");
        } catch (e) {
          console.error("Direct JSON parsing failed:", e);
          // If direct parsing fails, try to extract JSON array using regex
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            parsedQuestions = JSON.parse(jsonMatch[0]);
            console.log("Extracted JSON using regex");
          } else {
            console.error("Could not extract valid JSON:", content.substring(0, 100) + "...");
            throw new Error('Could not extract valid JSON from the response');
          }
        }
        
        if (!Array.isArray(parsedQuestions?.questions)) {
          console.error("Response is not an array:", typeof parsedQuestions, parsedQuestions ? Object.keys(parsedQuestions) : null);
          throw new Error('Response does not contain a questions array');
        }

        const questions = parsedQuestions.questions
          .map(q => this.normalizeQuestion(q))
          .filter(q => this.validator.isValidQuestion(q));

        console.log(`Generated ${questions.length} valid questions`);

        if (questions.length < (request.numberOfQuestions || 5) * 0.8) {
          console.error(`Insufficient valid questions: ${questions.length} < ${(request.numberOfQuestions || 5) * 0.8}`);
          throw new Error('Insufficient valid questions generated');
        }

        // Cache the results
        await this.cache.set(cacheKey, questions, CACHE_DURATION);
        return questions;

      } catch (error) {
        console.error('Error processing questions:', error);
        throw new Error('Failed to process questions: ' + error.message);
      }
    } catch (error) {
      console.error('Error in question generation:', error);
      throw error;
    }
  }
}

const questionGenerator = new QuestionGenerator();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const request: QuestionRequest = await req.json();

    if (!request.industry || !request.role) {
      console.error('Missing required fields:', { industry: request.industry, role: request.role });
      return new Response(
        JSON.stringify({ error: 'Industry and role are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating questions for session ${request.sessionId}`);
    const questions = await questionGenerator.generateQuestions(request);

    // Add IDs and order index to questions
    const questionsWithIds = questions.map((question, index) => ({
      ...question,
      id: crypto.randomUUID(),
      orderIndex: index
    }));

    console.log(`Generated ${questionsWithIds.length} questions successfully`);

    return new Response(
      JSON.stringify({ 
        questions: questionsWithIds,
        metadata: {
          totalTime: questionsWithIds.reduce((sum, q) => sum + (q.estimatedTimeSeconds || 0), 0),
          questionCount: questionsWithIds.length
        }  
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error handling request:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString()
      }),
      { 
        status: error.status || 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
