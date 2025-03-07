
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openaiApiKey = Deno.env.get("OPENAI_API_KEY")!;

// Define interface for enhanced interview questions
interface EnhancedInterviewQuestion {
  id: string;
  text: string;
  category: 'behavioral' | 'technical' | 'role-specific' | 'situational' | 'problem-solving';
  difficulty: 'entry' | 'intermediate' | 'advanced';
  estimatedTimeSeconds: number;
  context?: string;
  keywords: string[];
  followUp?: string[];
  expectedTopics?: string[];
  question_order: number;
  created_at: string;
}

// Define interface for request body
interface RequestBody {
  industry: string;
  role?: string;
  jobRole?: string;
  jobDescription?: string;
  sessionId: string;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Initialize Supabase client with admin rights
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Validate request body
const validateRequest = (body: any): body is RequestBody => {
  console.log("Validating request body:", JSON.stringify(body));
  
  if (!body) {
    throw new Error('Request body is missing or empty');
  }
  
  // Check for both 'role' and 'jobRole' parameters to handle both naming conventions
  const role = body.role || body.jobRole;
  
  if (!body.industry || !role || !body.sessionId) {
    throw new Error(`Missing required fields: ${[
      !body.industry && 'industry',
      !role && 'role/jobRole',
      !body.sessionId && 'sessionId'
    ].filter(Boolean).join(', ')}`);
  }

  return true;
};

serve(async (req) => {
  // Log request method and headers for debugging
  console.log("Function called: generate-interview-questions");
  console.log("Request method:", req.method);
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request (CORS preflight)");
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Parse request body
    let reqBody;
    try {
      console.log("Attempting to parse request body...");
      
      // First check if the content type is correct
      const contentType = req.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Invalid content type:", contentType);
        return new Response(
          JSON.stringify({ 
            error: "Invalid content type. Expected application/json",
            receivedContentType: contentType
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      // Clone the request to avoid consuming the body which can only be read once
      const clonedReq = req.clone();
      const bodyText = await clonedReq.text();
      console.log("Raw request body:", bodyText);
      
      if (!bodyText || bodyText.trim() === "") {
        console.error("Empty request body");
        return new Response(
          JSON.stringify({ 
            error: "Empty request body. Please ensure the request includes a JSON payload.",
            requestDetails: {
              method: req.method,
              contentType: contentType,
              url: req.url
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      try {
        reqBody = JSON.parse(bodyText);
        console.log("Request body parsed successfully:", JSON.stringify(reqBody));
      } catch (parseError) {
        console.error("Failed to parse request body:", parseError);
        return new Response(
          JSON.stringify({ 
            error: "Invalid request format: could not parse JSON body",
            details: parseError.message,
            receivedBody: bodyText
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
    } catch (error) {
      console.error("Error handling request body:", error);
      return new Response(
        JSON.stringify({ 
          error: "Error handling request body",
          details: error.message
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Validate request
    try {
      validateRequest(reqBody);
    } catch (validationError) {
      console.error("Request validation failed:", validationError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid request format or missing required fields",
          details: validationError.message,
          received: JSON.stringify(reqBody)
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Support both role and jobRole parameters
    const { industry, role, jobRole, jobDescription, sessionId } = reqBody;
    const effectiveRole = role || jobRole; // Use either parameter name
    
    console.log("Processed parameters:", { 
      industry, 
      role: effectiveRole,
      jobDescription: jobDescription ? jobDescription.substring(0, 50) + "..." : "N/A",
      sessionId
    });
    
    // For testing quickly without session verification - comment out in production
    if (sessionId === "test-123") {
      console.log("Test session ID detected, bypassing session verification");
      const questions = generateBasicInterviewQuestions(industry, effectiveRole, jobDescription);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          sessionId, 
          questions
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    // Verify session exists in database before proceeding
    console.log(`Verifying session ${sessionId} exists in database`);
    const { data: sessionData, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('id, session_id')
      .eq('session_id', sessionId)
      .maybeSingle();

    console.log("Session verification result:", { 
      sessionData, 
      sessionError,
      requestedSessionId: sessionId 
    });

    if (sessionError) {
      console.error("Session verification failed:", sessionError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to verify session",
          details: sessionError.message,
          sessionId 
        }),
        { headers: corsHeaders, status: 500 }
      );
    }

    if (!sessionData) {
      console.error("Session not found:", sessionId);
      return new Response(
        JSON.stringify({ 
          error: "Session not found",
          sessionId,
          suggestion: "Session may still be propagating, please try again"
        }),
        { headers: corsHeaders, status: 404 }
      );
    }
    
    console.log(`Session verified. Generating enhanced questions for session ${sessionId}`);
    let questions = [];
    let requirements = [];

    try {
      // 1. Extract key requirements from job description if available
      if (jobDescription && jobDescription.trim().length > 50) {
        const requirementsResponse = await extractRequirements(effectiveRole, industry, jobDescription);
        requirements = requirementsResponse;
        console.log(`Extracted ${requirements.length} key requirements from job description`);
      } else {
        requirements = [`Role: ${effectiveRole}`, `Industry: ${industry}`];
        console.log("No detailed job description provided, using basic requirements");
      }

      // 2. Generate enhanced questions based on requirements
      questions = await generateEnhancedQuestions(effectiveRole, industry, requirements, jobDescription);
      console.log(`Generated ${questions.length} enhanced questions`);
    } catch (aiError) {
      console.error("Error in AI-based question generation:", aiError);
      console.log("Falling back to basic question generation");
      questions = generateBasicInterviewQuestions(industry, effectiveRole, jobDescription);
    }
    
    // Save the questions to the database
    console.log("Updating session with generated questions");
    const { error: updateError } = await supabase
      .from('interview_sessions')
      .update({ 
        questions,
        job_description: jobDescription || null
      })
      .eq('session_id', sessionId);
    
    if (updateError) {
      console.error("Error updating session with questions:", updateError);
      return new Response(
        JSON.stringify({ 
          error: updateError.message,
          operation: "update session with questions",
          sessionId
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    console.log("Successfully updated session with questions");
    return new Response(
      JSON.stringify({ 
        success: true, 
        sessionId, 
        questions
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred",
        timestamp: new Date().toISOString(),
        stack: error.stack?.split("\n").slice(0, 3).join("\n") || "No stack trace"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Extract key requirements from job description using OpenAI
async function extractRequirements(role: string, industry: string, jobDescription: string): Promise<string[]> {
  try {
    if (!openaiApiKey) {
      console.warn("OpenAI API key not found, skipping requirements extraction");
      return [`Role: ${role}`, `Industry: ${industry}`];
    }

    const prompt = `
      Analyze this job description for a ${role} position in the ${industry} industry and extract key requirements:
      
      ${jobDescription}
      
      Return the response as a JSON array of strings containing only the 5-8 most important key requirements.
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing job requirements."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("OpenAI requirements response:", data);
    
    try {
      const content = data.choices[0].message.content;
      const parsedRequirements = JSON.parse(content);
      
      if (Array.isArray(parsedRequirements) && parsedRequirements.length > 0) {
        return parsedRequirements;
      } else {
        console.warn("Failed to parse requirements from OpenAI response");
        return [`Role: ${role}`, `Industry: ${industry}`];
      }
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      return [`Role: ${role}`, `Industry: ${industry}`];
    }
  } catch (error) {
    console.error("Error extracting requirements:", error);
    return [`Role: ${role}`, `Industry: ${industry}`];
  }
}

// Generate enhanced interview questions with OpenAI
async function generateEnhancedQuestions(
  role: string, 
  industry: string, 
  requirements: string[], 
  jobDescription?: string
): Promise<EnhancedInterviewQuestion[]> {
  try {
    if (!openaiApiKey) {
      console.warn("OpenAI API key not found, using fallback question generation");
      return generateBasicInterviewQuestions(industry, role, jobDescription);
    }

    const questionPrompt = `
      Create an interview question set for a ${role} position in the ${industry} industry.
      
      Key Requirements:
      ${requirements.join('\n')}
      
      Additional context: ${jobDescription ? jobDescription.substring(0, 200) + "..." : "None provided"}
      
      Generate 8-10 questions with this distribution:
      - 3 Behavioral questions relevant to the role
      - 3-4 Technical/Role-specific questions based on the requirements
      - 2 Situational questions related to the industry
      - 1-2 Problem-solving questions
      
      For each question, provide:
      1. The main question text
      2. Category (behavioral/technical/role-specific/situational/problem-solving)
      3. Difficulty level (entry/intermediate/advanced)
      4. Expected topics to be covered in the answer (array of strings)
      5. 1-2 follow-up questions (array of strings)
      6. Estimated answer time in seconds (between 60-180)
      7. Keywords related to the question (array of strings)
      
      Ensure each question:
      - Directly relates to the job requirements
      - Cannot be answered with yes/no
      - Is specific to the role
      - Has clear assessment criteria
      - Progresses in difficulty within each category
      
      Return the response as a JSON array where each object has:
      {
        "text": "question text",
        "category": "one of the categories",
        "difficulty": "entry/intermediate/advanced",
        "estimatedTimeSeconds": number,
        "expectedTopics": ["topic1", "topic2"],
        "followUp": ["follow-up question 1", "follow-up question 2"],
        "keywords": ["keyword1", "keyword2"]
      }
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert technical interviewer with deep knowledge of industry-specific requirements."
          },
          {
            role: "user",
            content: questionPrompt
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("OpenAI questions response:", data);

    try {
      const content = data.choices[0].message.content;
      // Sometimes the API returns content with markdown code blocks
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const parsedQuestions = JSON.parse(cleanedContent);

      if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
        // Map to proper format and add required fields
        return parsedQuestions.map((q, index) => ({
          id: crypto.randomUUID(),
          text: q.text,
          category: q.category,
          difficulty: q.difficulty,
          estimatedTimeSeconds: q.estimatedTimeSeconds || 120,
          expectedTopics: q.expectedTopics || [],
          followUp: q.followUp || [],
          keywords: q.keywords || [],
          context: `${industry} - ${role}`,
          question_order: index,
          created_at: new Date().toISOString()
        }));
      } else {
        console.warn("Failed to parse questions from OpenAI response");
        return generateBasicInterviewQuestions(industry, role, jobDescription);
      }
    } catch (parseError) {
      console.error("Failed to parse OpenAI questions response:", parseError);
      return generateBasicInterviewQuestions(industry, role, jobDescription);
    }
  } catch (error) {
    console.error("Error generating enhanced questions:", error);
    return generateBasicInterviewQuestions(industry, role, jobDescription);
  }
}

// Generate basic fallback interview questions as backup
function generateBasicInterviewQuestions(industry: string, role: string, jobDescription?: string) {
  const currentDate = new Date().toISOString();
  
  // Format role name for better display
  const formattedRole = role
    .split(/[-_\s]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  const baseQuestions: EnhancedInterviewQuestion[] = [
    {
      id: crypto.randomUUID(),
      text: `Tell me about your experience as a ${formattedRole} in the ${industry} industry.`,
      category: "behavioral",
      difficulty: "entry",
      estimatedTimeSeconds: 120,
      keywords: [role.toLowerCase(), industry.toLowerCase(), "experience"],
      expectedTopics: ["previous roles", "responsibilities", "achievements"],
      followUp: ["What specific skills did you develop?", "How did your experience prepare you for this role?"],
      question_order: 0,
      created_at: currentDate
    },
    {
      id: crypto.randomUUID(),
      text: `What skills do you have that make you a good fit for this ${formattedRole} position?`,
      category: "behavioral",
      difficulty: "entry",
      estimatedTimeSeconds: 90,
      keywords: [role.toLowerCase(), "skills", "qualifications"],
      expectedTopics: ["technical skills", "soft skills", "relevant qualifications"],
      followUp: ["How have you applied these skills in previous roles?"],
      question_order: 1,
      created_at: currentDate
    },
    {
      id: crypto.randomUUID(),
      text: `Describe a challenging situation you've faced in a previous role and how you handled it.`,
      category: "behavioral",
      difficulty: "intermediate",
      estimatedTimeSeconds: 150,
      keywords: ["challenge", "problem-solving", "experience"],
      expectedTopics: ["problem identification", "solution approach", "results"],
      followUp: ["What would you do differently now?"],
      question_order: 2,
      created_at: currentDate
    },
    {
      id: crypto.randomUUID(),
      text: `How do you stay updated with trends and changes in the ${industry} industry?`,
      category: "technical",
      difficulty: "intermediate",
      estimatedTimeSeconds: 100,
      keywords: [industry.toLowerCase(), "trends", "professional development"],
      expectedTopics: ["learning sources", "industry publications", "networking"],
      followUp: ["What recent industry trend do you find most interesting?"],
      question_order: 3,
      created_at: currentDate
    },
    {
      id: crypto.randomUUID(),
      text: `Where do you see yourself professionally in five years?`,
      category: "behavioral",
      difficulty: "intermediate",
      estimatedTimeSeconds: 90,
      keywords: ["goals", "career development", "ambition"],
      expectedTopics: ["career goals", "growth plans", "aspirations"],
      followUp: ["How does this role fit into your long-term plans?"],
      question_order: 4,
      created_at: currentDate
    }
  ];
  
  // Add industry-specific questions
  if (industry.toLowerCase() === 'technology' || industry.toLowerCase() === 'tech') {
    baseQuestions.push({
      id: crypto.randomUUID(),
      text: "Describe a technical project you worked on that you're particularly proud of.",
      category: "technical",
      difficulty: "advanced",
      estimatedTimeSeconds: 150,
      keywords: ["project", "technical", "achievement"],
      expectedTopics: ["project goals", "technologies used", "personal contribution", "outcomes"],
      followUp: ["What technical challenges did you overcome?", "How did you measure success?"],
      question_order: 5,
      created_at: currentDate
    });
  } else if (industry.toLowerCase() === 'finance') {
    baseQuestions.push({
      id: crypto.randomUUID(),
      text: "How do you ensure accuracy and attention to detail in your financial work?",
      category: "technical",
      difficulty: "intermediate",
      estimatedTimeSeconds: 120,
      keywords: ["finance", "accuracy", "detail-oriented"],
      expectedTopics: ["quality control processes", "error prevention", "review methodologies"],
      followUp: ["Can you describe a time when your attention to detail prevented a significant error?"],
      question_order: 5,
      created_at: currentDate
    });
  } else if (industry.toLowerCase() === 'healthcare') {
    baseQuestions.push({
      id: crypto.randomUUID(),
      text: "How do you balance patient care with administrative responsibilities?",
      category: "situational",
      difficulty: "advanced",
      estimatedTimeSeconds: 140,
      keywords: ["healthcare", "patient care", "administration"],
      expectedTopics: ["time management", "prioritization", "delegation"],
      followUp: ["How do you maintain quality of care under time constraints?"],
      question_order: 5,
      created_at: currentDate
    });
  }
  
  // Add role-specific questions
  if (role.toLowerCase().includes('manager') || role.toLowerCase().includes('leader')) {
    baseQuestions.push({
      id: crypto.randomUUID(),
      text: "Describe your management style and how you motivate your team.",
      category: "role-specific",
      difficulty: "advanced",
      estimatedTimeSeconds: 150,
      keywords: ["management", "leadership", "team motivation"],
      expectedTopics: ["leadership philosophy", "motivation techniques", "team development"],
      followUp: ["How do you handle conflicts within your team?", "How do you adapt your style to different team members?"],
      question_order: 6,
      created_at: currentDate
    });
  } else if (role.toLowerCase().includes('engineer') || role.toLowerCase().includes('developer')) {
    baseQuestions.push({
      id: crypto.randomUUID(),
      text: "How do you approach debugging and troubleshooting complex technical issues?",
      category: "problem-solving",
      difficulty: "advanced",
      estimatedTimeSeconds: 150,
      keywords: ["debugging", "troubleshooting", "technical"],
      expectedTopics: ["systematic approach", "tools used", "root cause analysis"],
      followUp: ["Describe a particularly difficult bug you solved and how you approached it."],
      question_order: 6,
      created_at: currentDate
    });
  } else if (role.toLowerCase().includes('analyst')) {
    baseQuestions.push({
      id: crypto.randomUUID(),
      text: "Describe how you would approach analyzing a complex dataset to extract meaningful insights.",
      category: "technical",
      difficulty: "advanced",
      estimatedTimeSeconds: 160,
      keywords: ["analysis", "data", "insights"],
      expectedTopics: ["data cleaning", "analysis methodology", "visualization", "communication of findings"],
      followUp: ["What tools do you typically use for data analysis?", "How do you validate your findings?"],
      question_order: 6,
      created_at: currentDate
    });
  }
  
  // Add a situational question
  baseQuestions.push({
    id: crypto.randomUUID(),
    text: `How would you handle a situation where you need to meet a tight deadline but you're waiting on input from colleagues who are unavailable?`,
    category: "situational",
    difficulty: "intermediate",
    estimatedTimeSeconds: 120,
    keywords: ["deadlines", "teamwork", "problem-solving"],
    expectedTopics: ["communication strategies", "contingency planning", "prioritization"],
    followUp: ["How would you prevent this situation in the future?"],
    question_order: baseQuestions.length,
    created_at: currentDate
  });

  return baseQuestions;
}
