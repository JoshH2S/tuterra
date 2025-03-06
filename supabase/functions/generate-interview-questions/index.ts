
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
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    return response.json();
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
    // Check cache first
    const cacheKey = this.cache.generateKey(request);
    const cachedQuestions = await this.cache.get(cacheKey);
    if (cachedQuestions) {
      console.log('Using cached questions for session:', request.sessionId);
      return cachedQuestions;
    }

    const prompt = this.generatePrompt(request);
    const data = await this.callOpenAI(prompt);
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    try {
      let parsedQuestions;
      
      // Try to parse the returned content as JSON directly
      try {
        parsedQuestions = JSON.parse(content);
      } catch (e) {
        // If direct parsing fails, try to extract JSON array using regex
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedQuestions = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not extract valid JSON from the response');
        }
      }
      
      if (!Array.isArray(parsedQuestions)) {
        throw new Error('Response is not an array');
      }

      const questions = parsedQuestions
        .map(q => this.normalizeQuestion(q))
        .filter(q => this.validator.isValidQuestion(q));

      if (questions.length < (request.numberOfQuestions || 5) * 0.8) {
        throw new Error('Insufficient valid questions generated');
      }

      // Cache the results
      await this.cache.set(cacheKey, questions, CACHE_DURATION);
      return questions;

    } catch (error) {
      console.error('Error processing questions:', error);
      throw new Error('Failed to process questions');
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
      return new Response(
        JSON.stringify({ error: 'Industry and role are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating questions for session ${request.sessionId}`);
    const questions = await questionGenerator.generateQuestions(request);

    return new Response(
      JSON.stringify({ questions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
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
