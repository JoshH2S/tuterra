
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
      text: String(q.text || '').trim(),
      category: String(q.category || 'general').trim(),
      difficulty: String(q.difficulty || 'medium').toLowerCase(),
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

      // Add detailed logging
      console.log('Raw OpenAI response type:', typeof content);
      console.log('Raw OpenAI response (first 100 chars):', content?.substring(0, 100));

      if (!content) {
        console.error('Empty response from OpenAI');
        throw new Error('Empty response from OpenAI');
      }

      console.log("Received response length:", content.length);
      
      try {
        let parsedQuestions;
        
        // Improved JSON parsing with better error handling
        try {
          // First try to parse the returned content as JSON directly
          parsedQuestions = JSON.parse(content);
          console.log("Successfully parsed JSON directly, type:", typeof parsedQuestions);
          
          // If the response is an object with a questions property, extract it
          if (parsedQuestions && typeof parsedQuestions === 'object' && !Array.isArray(parsedQuestions)) {
            console.log("Parsed object properties:", Object.keys(parsedQuestions).join(', '));
            if (Array.isArray(parsedQuestions.questions)) {
              parsedQuestions = parsedQuestions.questions;
              console.log("Extracted questions array from object");
            }
          }
        } catch (e) {
          console.error("Direct JSON parsing failed:", e);
          
          // Try to extract JSON array using regex
          console.log("Attempting to extract JSON with regex");
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            try {
              parsedQuestions = JSON.parse(jsonMatch[0]);
              console.log("Extracted JSON using regex");
            } catch (regexError) {
              console.error("Regex extraction failed:", regexError);
              
              // Try cleaning the JSON
              console.log("Attempting to clean malformed JSON...");
              const cleanedJson = jsonMatch[0]
                .replace(/[\n\r]/g, ' ')
                .replace(/,\s*]/g, ']')
                .replace(/,\s*}/g, '}');
                
              try {
                parsedQuestions = JSON.parse(cleanedJson);
                console.log("Successfully parsed cleaned JSON");
              } catch (cleanError) {
                console.error("Cleaned JSON parsing failed:", cleanError);
                throw new Error('Could not parse questions from response');
              }
            }
          } else {
            console.error("Could not extract valid JSON:", content.substring(0, 100) + "...");
            throw new Error('Could not extract valid JSON from the response');
          }
        }
        
        // Validate we have valid questions
        if (!parsedQuestions) {
          console.error("No parsed questions object");
          throw new Error('Failed to parse questions data');
        }
        
        if (!Array.isArray(parsedQuestions)) {
          console.error("Parsed result is not an array:", typeof parsedQuestions);
          throw new Error('Response is not an array');
        }

        const questions = parsedQuestions
          .map(q => this.normalizeQuestion(q))
          .filter(q => {
            const isValid = this.validator.isValidQuestion(q);
            if (!isValid) console.log("Filtered out invalid question:", q.text?.substring(0, 30));
            return isValid;
          });

        console.log(`Generated ${questions.length} valid questions`);

        if (questions.length === 0) {
          console.error("No valid questions were generated");
          throw new Error('No valid questions generated');
        }

        if (questions.length < (request.numberOfQuestions || 5) * 0.6) {
          console.error(`Insufficient valid questions: ${questions.length} < ${(request.numberOfQuestions || 5) * 0.6}`);
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
      
      // Create custom fallback questions based on role and industry
      console.log("Using fallback questions due to error");
      return this.getFallbackQuestions(request);
    }
  }
  
  private getFallbackQuestions(request: QuestionRequest): Question[] {
    const { role, industry } = request;
    console.log(`Creating ${request.numberOfQuestions || 5} fallback questions for ${role} in ${industry}`);
    
    // Role-specific questions
    const fallbackQuestions: Question[] = [
      {
        text: `Tell me about your experience with ${role} roles.`,
        category: 'Experience',
        difficulty: 'medium',
        estimatedTimeSeconds: 120,
        keywords: ['experience', 'background', role.toLowerCase()]
      },
      {
        text: `What qualifications do you have that make you a good fit for this ${role} position?`,
        category: 'Behavioral',
        difficulty: 'medium',
        estimatedTimeSeconds: 120,
        keywords: ['qualifications', 'skills', 'fit']
      },
      {
        text: `Why are you interested in working in the ${industry} industry?`,
        category: 'Behavioral',
        difficulty: 'easy',
        estimatedTimeSeconds: 90,
        keywords: ['interest', 'motivation', industry.toLowerCase()]
      },
      {
        text: `Describe a challenging situation you faced in a previous role and how you resolved it.`,
        category: 'Problem Solving',
        difficulty: 'medium',
        estimatedTimeSeconds: 150,
        keywords: ['challenge', 'problem-solving', 'resolution']
      },
      {
        text: `Where do you see yourself professionally in five years?`,
        category: 'Cultural Fit',
        difficulty: 'medium',
        estimatedTimeSeconds: 120,
        keywords: ['career goals', 'ambition', 'future']
      },
      {
        text: `How do you stay updated with the latest trends and developments in the ${industry} industry?`,
        category: 'Technical',
        difficulty: 'medium',
        estimatedTimeSeconds: 120,
        keywords: ['trends', 'continuous learning', industry.toLowerCase()]
      }
    ];
    
    // Slice to requested number or default to 5
    const requestedQuestions = fallbackQuestions.slice(0, request.numberOfQuestions || 5);
    
    // Add IDs and indexes
    return requestedQuestions.map((q, index) => ({
      ...q,
      id: crypto.randomUUID(),
      orderIndex: index
    }));
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
      id: question.id || crypto.randomUUID(),
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
        timestamp: new Date().toISOString(),
        stack: error.stack
      }),
      { 
        status: error.status || 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
