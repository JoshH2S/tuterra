import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Configuration constants
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";

const INTERNSHIP_CONFIG = {
  MIN_DURATION_WEEKS: 6,
  MAX_DURATION_WEEKS: 12,
  TASKS_PER_WEEK: 2,
  DEFAULT_MODEL: "gpt-4",
  MAX_TOKENS: 4000,
  TEMPERATURE: 0.7,
};

interface InternshipPreviewRequest {
  industry: string;
  jobRole?: string;
  jobDescription?: string;
  internshipDurationWeeks: number;
  useExperienceBasedTailoring?: boolean;
  education?: string;
  fieldOfStudy?: string;
  experienceYears?: number;
  certifications?: string[];
  skills?: string[];
  careerGoal?: string;
}

interface Company {
  name: string;
  sector: string;
  description: string;
  logoUrl?: string;
  vision: string;
  mission: string;
  foundedYear: number;
  employeeCount: number;
  headquartersLocation: string;
  websiteUrl?: string;
  coreValues: string[];
}

interface Supervisor {
  name: string;
  title: string;
  introMessage: string;
}

interface Task {
  week: number;
  title: string;
  description: string;
}

interface Expectations {
  duration: string;
  totalTasks: number;
  finalDeliverable: string;
  feedbackCycle: string;
}

interface InternshipPreviewResponse {
  company: Company;
  supervisor: Supervisor;
  tasks: Task[];
  expectations: Expectations;
}

function cleanupJSONContent(content: string): string {
  if (!content) return "";
  
  let cleanContent = content.trim();
  
  // Remove markdown code block formatting
  if (cleanContent.startsWith('```')) {
    cleanContent = cleanContent.replace(/^```[a-z]*\n?/i, '');
    cleanContent = cleanContent.replace(/\n?```$/g, '');
  }
  
  // Remove JavaScript-style comments (// comments)
  cleanContent = cleanContent.replace(/\/\/.*$/gm, '');
  
  // Remove multi-line comments (/* comments */)
  cleanContent = cleanContent.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove trailing commas before closing brackets/braces
  cleanContent = cleanContent.replace(/,(\s*[}\]])/g, '$1');
  
  return cleanContent.trim();
}

function generatePrompt(request: InternshipPreviewRequest): string {
  const { 
    industry, 
    jobRole, 
    jobDescription, 
    internshipDurationWeeks,
    useExperienceBasedTailoring,
    education,
    fieldOfStudy,
    experienceYears,
    certifications,
    skills,
    careerGoal
  } = request;

  let roleContext = "";
  if (jobRole) {
    roleContext = `The internship is for a ${jobRole} position.`;
  }
  
  if (jobDescription) {
    roleContext += `\n\nJob Description:\n${jobDescription}`;
  }

  let experienceContext = "";
  if (useExperienceBasedTailoring) {
    experienceContext = `
    Tailor the internship based on the candidate's background:
    - Education: ${education || 'Not specified'}
    - Field of Study: ${fieldOfStudy || 'Not specified'}
    - Years of Experience: ${experienceYears || 0}
    - Certifications: ${certifications?.join(', ') || 'None'}
    - Skills: ${skills?.join(', ') || 'None'}
    - Career Goal: ${careerGoal || 'Not specified'}
    
    Ensure the tasks and expectations align with their experience level and goals.
    `;
  }

  return `
    Create a comprehensive virtual internship preview for the ${industry} industry.
    ${roleContext}
    ${experienceContext}
    
    Duration: ${internshipDurationWeeks} weeks
    Tasks needed: ${internshipDurationWeeks * INTERNSHIP_CONFIG.TASKS_PER_WEEK} (${INTERNSHIP_CONFIG.TASKS_PER_WEEK} per week)
    
    Generate a realistic company profile, virtual supervisor, and weekly task schedule that would provide an engaging and educational internship experience.
    
    CRITICAL VIRTUAL INTERNSHIP REQUIREMENTS:
    - Each task must be fully self-contained and completable within a simulated online environment
    - Tasks should involve written analysis, case studies, scenario-based responses, research reports, or strategic recommendations
    - Avoid tasks requiring real-time collaboration, external meetings, physical presence, or system access
    - Each task must be evaluatable through text input only (written submissions, analysis, reports)
    - Tasks should simulate real workplace challenges but be completable independently
    - Focus on analytical thinking, problem-solving, research, and written communication skills
    - Do not refer to a real company website or communication platforms
    - Provide sufficient context and background information within each task description
    
    Task Examples by Type:
    - Market Research: "Analyze provided competitor data and write a 500-word market positioning report"
    - Case Study Analysis: "Review the attached customer service scenario and propose 3 improvement strategies"
    - Strategic Planning: "Based on the company background provided, draft a social media content calendar for Q1"
    - Data Analysis: "Examine the sales data trends and identify 3 key insights with supporting evidence"
    - Problem Solving: "A client has reported the following issue... propose a step-by-step resolution plan"
    - Content Creation: "Write a blog post outline addressing common customer pain points in [industry]"
    
    Guidelines:
    - Create a believable company with realistic details
    - Tasks should progress in complexity and build upon each other
    - Include a mix of analytical, strategic, and creative assignments
    - Supervisor should be welcoming and professional
    - Company values should align with modern workplace culture
    - Tasks should be appropriate for the specified experience level
    - Each task should clearly state deliverables and evaluation criteria
    
    Format your response as a JSON object with this exact structure:
    
    {
      "company": {
        "name": "Company Name",
        "sector": "Specific sector within ${industry}",
        "description": "2-3 sentence company overview",
        "vision": "Company vision statement",
        "mission": "Company mission statement", 
        "foundedYear": 2010,
        "employeeCount": 250,
        "headquartersLocation": "City, State/Country",
        "coreValues": ["Value 1", "Value 2", "Value 3", "Value 4"]
      },
      "supervisor": {
        "name": "First Last",
        "title": "Job Title",
        "introMessage": "Warm, welcoming message introducing themselves and the virtual internship program, emphasizing the online learning environment (2-3 sentences)"
      },
      "tasks": [
        {
          "week": 1,
          "title": "Task Title",
          "description": "Detailed task description including context, objectives, deliverables, and clear instructions for text-based submission. Include any necessary background information or scenarios."
        },
        {
          "week": 1,
          "title": "Second Task Title",
          "description": "Second task description for week 1 with complete context and submission requirements"
        }
        // IMPORTANT: Generate ALL ${internshipDurationWeeks * INTERNSHIP_CONFIG.TASKS_PER_WEEK} tasks - do not use comments or placeholders
      ],
      "expectations": {
        "duration": "${internshipDurationWeeks} weeks",
        "totalTasks": ${internshipDurationWeeks * INTERNSHIP_CONFIG.TASKS_PER_WEEK},
        "finalDeliverable": "Description of a comprehensive capstone project or portfolio compilation that synthesizes learning from all tasks",
        "feedbackCycle": "Weekly written feedback from your virtual supervisor with detailed insights on performance and areas for improvement"
      }
    }
    
    CRITICAL: 
    - Generate ALL ${internshipDurationWeeks * INTERNSHIP_CONFIG.TASKS_PER_WEEK} tasks in the tasks array
    - Do NOT use comments like "// This pattern continues"
    - Do NOT use placeholders or shortcuts
    - Ensure the JSON is complete and valid
    - Each task should have a unique title and description with complete context
    - Distribute tasks evenly across ${internshipDurationWeeks} weeks (${INTERNSHIP_CONFIG.TASKS_PER_WEEK} tasks per week)
    - All tasks must be completable in a virtual environment through text submissions only
    
    Make the experience feel authentic and engaging while maintaining virtual internship constraints.
  `;
}

serve(async (req) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`[${requestId}] === INTERNSHIP PREVIEW REQUEST START ===`);
  console.log(`[${requestId}] Method: ${req.method}`);
  console.log(`[${requestId}] Headers:`, Object.fromEntries(req.headers.entries()));
  
  // Handle CORS
  if (req.method === "OPTIONS") {
    console.log(`[${requestId}] CORS preflight request`);
    return new Response("ok", { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    console.log(`[${requestId}] Invalid method: ${req.method}`);
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Parse request body
    console.log(`[${requestId}] Parsing request body...`);
    const requestText = await req.text();
    console.log(`[${requestId}] Raw request body length: ${requestText.length}`);
    console.log(`[${requestId}] Raw request body: ${requestText.substring(0, 500)}${requestText.length > 500 ? '...' : ''}`);
    
    let request: InternshipPreviewRequest;
    try {
      request = JSON.parse(requestText);
      console.log(`[${requestId}] Parsed request successfully:`, {
        industry: request.industry,
        jobRole: request.jobRole,
        duration: request.internshipDurationWeeks,
        useExperienceBasedTailoring: request.useExperienceBasedTailoring,
        hasJobDescription: !!request.jobDescription,
        education: request.education,
        fieldOfStudy: request.fieldOfStudy,
        experienceYears: request.experienceYears,
        certificationsCount: request.certifications?.length || 0,
        skillsCount: request.skills?.length || 0,
        careerGoal: request.careerGoal
      });
    } catch (parseError) {
      console.error(`[${requestId}] JSON parse error:`, parseError);
      console.error(`[${requestId}] Failed to parse:`, requestText);
      return new Response(
        JSON.stringify({ 
          error: "Invalid JSON in request body",
          details: parseError.message,
          success: false 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate required fields
    if (!request.industry) {
      console.log(`[${requestId}] Validation failed: Missing industry`);
      return new Response(
        JSON.stringify({ 
          error: "Industry is required",
          success: false 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!request.internshipDurationWeeks || 
        request.internshipDurationWeeks < INTERNSHIP_CONFIG.MIN_DURATION_WEEKS || 
        request.internshipDurationWeeks > INTERNSHIP_CONFIG.MAX_DURATION_WEEKS) {
      console.log(`[${requestId}] Validation failed: Invalid duration ${request.internshipDurationWeeks}`);
      return new Response(
        JSON.stringify({ 
          error: `Internship duration must be between ${INTERNSHIP_CONFIG.MIN_DURATION_WEEKS} and ${INTERNSHIP_CONFIG.MAX_DURATION_WEEKS} weeks`,
          success: false 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate experience-based tailoring fields if enabled
    if (request.useExperienceBasedTailoring) {
      if (!request.education || !request.fieldOfStudy) {
        console.log(`[${requestId}] Validation failed: Missing education/fieldOfStudy for experience-based tailoring`);
        return new Response(
          JSON.stringify({ 
            error: "Education and field of study are required when using experience-based tailoring",
            success: false 
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    console.log(`[${requestId}] Validation passed, generating prompt...`);

    // Generate the prompt
    const prompt = generatePrompt(request);
    
    console.log(`[${requestId}] Generated prompt length: ${prompt.length}`);
    console.log(`[${requestId}] Prompt preview: ${prompt.substring(0, 300)}...`);
    
    console.log(`[${requestId}] Generating internship preview for:`, {
      industry: request.industry,
      jobRole: request.jobRole,
      duration: request.internshipDurationWeeks,
      tailored: request.useExperienceBasedTailoring
    });

    // Check OpenAI API key
    if (!OPENAI_API_KEY) {
      console.error(`[${requestId}] Missing OpenAI API key`);
      return new Response(
        JSON.stringify({ 
          error: "OpenAI API key not configured",
          success: false 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[${requestId}] Making OpenAI API call...`);

    // Call OpenAI API
    const openAIResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: INTERNSHIP_CONFIG.DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an expert in creating realistic virtual internship programs. Generate comprehensive, engaging, and educational internship experiences that feel authentic and valuable. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: INTERNSHIP_CONFIG.TEMPERATURE,
        max_tokens: INTERNSHIP_CONFIG.MAX_TOKENS,
      }),
    });

    console.log(`[${requestId}] OpenAI response status: ${openAIResponse.status}`);
    console.log(`[${requestId}] OpenAI response headers:`, Object.fromEntries(openAIResponse.headers.entries()));

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error(`[${requestId}] OpenAI API error status: ${openAIResponse.status}`);
      console.error(`[${requestId}] OpenAI API error text: ${errorText}`);
      
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText };
      }
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to generate internship preview", 
          details: error,
          openaiStatus: openAIResponse.status,
          success: false
        }),
        {
          status: openAIResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[${requestId}] OpenAI API call successful, parsing response...`);
    const data = await openAIResponse.json();
    console.log(`[${requestId}] OpenAI response data keys:`, Object.keys(data));
    console.log(`[${requestId}] OpenAI usage:`, data.usage);
    
    const responseContent = data.choices[0].message.content;
    console.log(`[${requestId}] OpenAI response content length: ${responseContent.length}`);
    console.log(`[${requestId}] OpenAI response first 200 chars: ${responseContent.substring(0, 200)}...`);
    console.log(`[${requestId}] OpenAI response last 200 chars: ...${responseContent.substring(responseContent.length - 200)}`);
    
    // Clean up and parse the JSON response
    console.log(`[${requestId}] Cleaning JSON content...`);
    const cleanedContent = cleanupJSONContent(responseContent);
    console.log(`[${requestId}] Cleaned content length: ${cleanedContent.length}`);
    console.log(`[${requestId}] Cleaned content first 200 chars: ${cleanedContent.substring(0, 200)}...`);
    
    try {
      console.log(`[${requestId}] Parsing cleaned JSON...`);
      const internshipPreview: InternshipPreviewResponse = JSON.parse(cleanedContent);
      console.log(`[${requestId}] JSON parsed successfully`);
      
      // Validate the response structure
      console.log(`[${requestId}] Validating response structure...`);
      if (!internshipPreview.company || !internshipPreview.supervisor || !internshipPreview.tasks || !internshipPreview.expectations) {
        console.error(`[${requestId}] Invalid response structure:`, {
          hasCompany: !!internshipPreview.company,
          hasSupervisor: !!internshipPreview.supervisor,
          hasTasks: !!internshipPreview.tasks,
          hasExpectations: !!internshipPreview.expectations
        });
        throw new Error("Invalid response structure from AI");
      }

      // Validate task count
      const expectedTaskCount = request.internshipDurationWeeks * INTERNSHIP_CONFIG.TASKS_PER_WEEK;
      console.log(`[${requestId}] Expected ${expectedTaskCount} tasks, got ${internshipPreview.tasks.length}`);
      if (internshipPreview.tasks.length !== expectedTaskCount) {
        console.warn(`[${requestId}] Task count mismatch: expected ${expectedTaskCount}, got ${internshipPreview.tasks.length}`);
      }

      // Add metadata
      const response = {
        ...internshipPreview,
        metadata: {
          generatedAt: new Date().toISOString(),
          industry: request.industry,
          duration: request.internshipDurationWeeks,
          tailored: request.useExperienceBasedTailoring || false
        }
      };
      
      const processingTime = Date.now() - startTime;
      console.log(`[${requestId}] === SUCCESS === Processing time: ${processingTime}ms`);
      
      return new Response(
        JSON.stringify({ 
          ...response,
          success: true
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );

    } catch (parseError) {
      console.error(`[${requestId}] JSON parsing error:`, parseError);
      console.error(`[${requestId}] Parse error message:`, parseError.message);
      console.error(`[${requestId}] Parse error stack:`, parseError.stack);
      console.error(`[${requestId}] Content that failed to parse (first 1000 chars):`, cleanedContent.substring(0, 1000));
      console.error(`[${requestId}] Content that failed to parse (last 1000 chars):`, cleanedContent.substring(cleanedContent.length - 1000));
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to parse internship preview", 
          details: parseError.message,
          contentLength: cleanedContent.length,
          contentPreview: cleanedContent.substring(0, 500),
          success: false
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[${requestId}] === FUNCTION ERROR === Processing time: ${processingTime}ms`);
    console.error(`[${requestId}] Error:`, error);
    console.error(`[${requestId}] Error message:`, error.message);
    console.error(`[${requestId}] Error stack:`, error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error.message,
        requestId: requestId,
        processingTime: processingTime,
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}); 