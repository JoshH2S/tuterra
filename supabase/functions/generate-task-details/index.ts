import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Max-Age": "86400"
};

// Define the request structure
interface TaskDetailsRequest {
  task_id: string;
  task_title: string;
  task_description: string;
  job_title: string;
  industry: string;
  company_name?: string;
}

// Define the response structure
interface TaskDetails {
  task_id: string;
  background: string;
  instructions: string;
  deliverables: string;
  success_criteria: string;
  resources: string;
  generation_status: string;
  generated_by: string;
}

serve(async (req) => {
  // Add this debug log
  console.log("Starting generate-task-details function with GPT-4o model");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Create a Supabase client with the SERVICE ROLE key for admin access
    // This bypasses RLS policies
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "", 
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "" // Use service role key instead
    );

    // Create a regular client with the user's auth context for reading
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "", 
      Deno.env.get("SUPABASE_ANON_KEY") ?? "", 
      {
        global: {
          headers: {
            Authorization: req.headers.get("Authorization")!
          }
        }
      }
    );

    // Get the request body
    const requestData = await req.json();
    const { task_id, task_title, task_description, job_title, industry, company_name } = requestData;

    if (!task_id || !task_title || !job_title || !industry) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }), 
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    // Check if details already exist using regular client (with user auth)
    const { data: existingDetails } = await supabaseClient
      .from("internship_task_details")
      .select("*")
      .eq("task_id", task_id)
      .limit(1);

    if (existingDetails && existingDetails.length > 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Task details already exist",
          data: existingDetails[0]
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    
    // Get company profile information if company_name wasn't provided
    let companyInfo = company_name ? { company_name } : null;
    
    if (!companyInfo) {
      // Get the internship session_id from the task
      const { data: taskData, error: taskError } = await supabaseClient
        .from('internship_tasks')
        .select('session_id')
        .eq('id', task_id)
        .single();

      if (!taskError && taskData) {
        const sessionId = taskData.session_id;

        // Get company profile information
        const { data: companyProfile } = await supabaseClient
          .from('internship_company_profiles')
          .select('*')
          .eq('session_id', sessionId)
          .single();

        if (companyProfile) {
          companyInfo = companyProfile;
        }
      }
    }

    // Create the prompt for task detail generation
    const prompt = `
You are simulating a task for a ${job_title} at a fictional company called ${companyInfo?.company_name || "Innovatech"} in the ${industry} industry.

Here is the task title: "${task_title}"
Task summary: "${task_description || "Complete the assigned task."}"

IMPORTANT CONSTRAINTS:
1. The intern will NOT have access to internal company systems like intranets, knowledge portals, proprietary dashboards, or company databases.
2. Do NOT require premium tools like Bloomberg Terminal, FactSet, or Thomson Reuters Eikon without offering free alternatives.
3. All instructions must be completable with freely available online tools and resources.
4. If you must reference an industry-specific tool, always include a free alternative (e.g., "Use Bloomberg Terminal or alternatively, Yahoo Finance").
5. Make tasks realistic and professionally valuable without requiring access to fictional internal systems.

Generate realistic and detailed task content in the following JSON format:

{
  "background": "A paragraph providing context and background for the task",
  "instructions": ["Step 1: First instruction step here", "Step 2: Second instruction step here", "...and so on"],
  "deliverables": ["Deliverable 1", "Deliverable 2", "Deliverable 3"],
  "success_criteria": ["Criteria 1", "Criteria 2", "Criteria 3"],
  "resources": [
    {
      "title": "Resource Title",
      "description": "Brief description of what this resource provides",
      "url": "https://example.com/resource" (optional)
    }
  ]
}

ADDITIONAL REQUIREMENTS:
1. The "instructions" field MUST be an array of strings, with each string representing a single step in the process.
2. Each instruction step should be clear, actionable, and completable using freely available tools.
3. Number the steps in the text (e.g., "Step 1: Do this first")
4. Format deliverables and success_criteria as arrays of strings.
5. Include at least 3 resources with links to free, publicly available tools or information sources relevant to the task.
6. Always include a disclaimer resource explaining that if any premium tools are mentioned, free alternatives can be used.

Make the content realistic, professionally written, and appropriate for the industry and job role.
Respond ONLY with the JSON object, no additional text before or after.
`;

    // Use fetch directly instead of OpenAI client - this is more compatible with Deno
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    // Use the chat/completions endpoint with GPT-4o instead
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates detailed internship task information. Always respond with valid JSON only. Never reference internal company systems or premium tools without alternatives. Ensure all tasks can be completed with freely available resources."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: {
          type: "json_object"
        }
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`);
    }

    const openaiData = await openaiResponse.json();
    let taskDetails;

    try {
      // Parse the response as JSON
      const responseText = openaiData.choices[0].message.content.trim();
      taskDetails = JSON.parse(responseText);
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to generate task details",
          details: error.message
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    // Add standard disclaimer to resources if not already present
    if (Array.isArray(taskDetails.resources)) {
      let hasDisclaimer = false;
      
      // Check if a disclaimer resource already exists
      for (const resource of taskDetails.resources) {
        if (resource.title?.toLowerCase().includes('disclaimer') || 
            resource.description?.toLowerCase().includes('alternative') ||
            resource.description?.toLowerCase().includes('free tool')) {
          hasDisclaimer = true;
          break;
        }
      }
      
      // Add disclaimer if not present
      if (!hasDisclaimer) {
        taskDetails.resources.push({
          title: "Tools & Resources Disclaimer",
          description: "If you don't have access to any premium tools mentioned in this task, feel free to use publicly available alternatives like Google Search, free datasets, or open-source software.",
          url: null
        });
      }
    }

    // Ensure all fields are proper JSON strings
    const processedDetails = {
      task_id: task_id,
      background: taskDetails.background || "",
      instructions: Array.isArray(taskDetails.instructions) ? JSON.stringify(taskDetails.instructions) : (taskDetails.instructions || ""),
      deliverables: Array.isArray(taskDetails.deliverables) ? JSON.stringify(taskDetails.deliverables) : (taskDetails.deliverables || ""),
      success_criteria: Array.isArray(taskDetails.success_criteria) ? JSON.stringify(taskDetails.success_criteria) : (taskDetails.success_criteria || ""),
      resources: Array.isArray(taskDetails.resources) ? JSON.stringify(taskDetails.resources) : (taskDetails.resources || ""),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      generated_by: "gpt-4o",
      generation_status: "completed"
    };

    // Save the task details to the database using supabaseAdmin with error handling
    try {
      const { data: savedDetails, error } = await supabaseAdmin
        .from("internship_task_details")
        .insert(processedDetails)
        .select()
        .limit(1);

      if (error) {
        // If the error is related to resources column
        if (error.message && error.message.includes('resources')) {
          // Try again without the resources field
          const { resources, ...detailsWithoutResources } = processedDetails;
          
          const { data: retryDetails, error: retryError } = await supabaseAdmin
            .from("internship_task_details")
            .insert(detailsWithoutResources)
            .select()
            .limit(1);
            
          if (retryError) {
            throw retryError;
          }
          
          return new Response(
            JSON.stringify({
              success: true,
              message: "Task details generated and saved successfully (without resources)",
              data: retryDetails?.[0] || null
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders
              }
            }
          );
        } else {
          // Different error, throw it
          throw error;
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Task details generated and saved successfully",
          data: savedDetails?.[0] || null
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    } catch (dbError) {
      console.error("Error saving task details:", dbError);
      return new Response(
        JSON.stringify({
          error: "Failed to save task details",
          details: dbError?.message || "Unknown database error"
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
  } catch (error) {
    console.error("Error in generate-task-details function:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
}); 