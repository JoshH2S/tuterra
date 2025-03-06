
import { QuestionValidator } from "./questionValidator.ts";
import { OpenAIClient, openaiClient } from "./openaiClient.ts";
import { CacheManager, cacheManager } from "./cacheManager.ts";

// Constants
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface QuestionRequest {
  industry: string;
  role: string;
  jobDescription?: string;
  numberOfQuestions?: number;
  timeLimit?: number;
  categories?: Array<{ name: string; weight: number }>;
  sessionId: string;
}

export interface Question {
  id: string;
  text: string;
  category: string;
  difficulty: string;
  estimatedTimeSeconds: number;
  keywords: string[];
  orderIndex?: number;
}

export class QuestionGenerator {
  private validator: QuestionValidator;

  constructor() {
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

  private parseJsonResponse(content: string): any {
    console.log("Received response length:", content.length);
    
    try {
      // First try to parse the returned content as JSON directly
      const parsedQuestions = JSON.parse(content);
      console.log("Successfully parsed JSON directly, type:", typeof parsedQuestions);
      
      // If the response is an object with a questions property, extract it
      if (parsedQuestions && typeof parsedQuestions === 'object' && !Array.isArray(parsedQuestions)) {
        console.log("Parsed object properties:", Object.keys(parsedQuestions).join(', '));
        if (Array.isArray(parsedQuestions.questions)) {
          return parsedQuestions.questions;
        }
      }
      
      return parsedQuestions;
    } catch (e) {
      console.error("Direct JSON parsing failed:", e);
      
      // Try to extract JSON array using regex
      console.log("Attempting to extract JSON with regex");
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (regexError) {
          console.error("Regex extraction failed:", regexError);
          
          // Try cleaning the JSON
          console.log("Attempting to clean malformed JSON...");
          const cleanedJson = jsonMatch[0]
            .replace(/[\n\r]/g, ' ')
            .replace(/,\s*]/g, ']')
            .replace(/,\s*}/g, '}');
            
          try {
            return JSON.parse(cleanedJson);
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
  }

  async generateQuestions(request: QuestionRequest): Promise<Question[]> {
    console.log("Generating questions with params:", JSON.stringify({
      industry: request.industry,
      role: request.role,
      hasJobDescription: !!request.jobDescription,
      requestedQuestions: request.numberOfQuestions
    }));
    
    // Check cache first
    const cacheKey = cacheManager.generateKey(request);
    const cachedQuestions = await cacheManager.get(cacheKey);
    if (cachedQuestions) {
      console.log('Using cached questions for session:', request.sessionId, 'found', cachedQuestions.length, 'questions');
      return cachedQuestions;
    }

    const prompt = this.generatePrompt(request);
    console.log("Generated prompt length:", prompt.length);
    
    try {
      const data = await openaiClient.generateCompletion({
        prompt: prompt,
        systemPrompt: 'You are an expert AI interviewer. Respond ONLY with valid JSON arrays containing interview questions.',
        temperature: 0.7,
        enforceJsonFormat: true
      });
      
      const content = data.choices?.[0]?.message?.content?.trim();

      // Add detailed logging
      console.log('Raw OpenAI response type:', typeof content);
      console.log('Raw OpenAI response (first 100 chars):', content?.substring(0, 100));

      if (!content) {
        console.error('Empty response from OpenAI');
        throw new Error('Empty response from OpenAI');
      }

      const parsedQuestions = this.parseJsonResponse(content);
      
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

      // Add IDs to questions
      const questionsWithIds = questions.map((question, index) => ({
        ...question,
        id: crypto.randomUUID(),
        orderIndex: index
      }));

      // Cache the results
      await cacheManager.set(cacheKey, questionsWithIds, CACHE_DURATION);
      return questionsWithIds;
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

export const questionGenerator = new QuestionGenerator();
