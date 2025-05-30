import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.1.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Max-Age": "86400"
};

interface RequestBody {
  submission_id: string;
  task_id: string;
  submission_text: string;
  task_description: string;
  task_instructions?: string;
  job_title: string;
  industry: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    // Get the request body
    const requestData: RequestBody = await req.json();
    const { 
      submission_id, 
      task_id, 
      submission_text,
      task_description,
      task_instructions,
      job_title,
      industry
    } = requestData;

    if (!submission_id || !submission_text || !task_description) {
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

    // After getting the submission details, fetch company profile information
    const { data: taskData, error: taskError } = await supabaseClient
      .from('internship_tasks')
      .select('session_id')
      .eq('id', task_id)
      .single();

    if (taskError) {
      console.error('Error fetching task session:', taskError);
      return new Response(
        JSON.stringify({ error: 'Error fetching task information' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const sessionId = taskData.session_id;

    // Get company profile information
    const { data: companyProfile, error: companyError } = await supabaseClient
      .from('internship_company_profiles')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (companyError && companyError.code !== 'PGRST116') {
      console.error('Error fetching company profile:', companyError);
    }

    // Build company context from the company profile
    let companyContext = '';
    if (companyProfile) {
      companyContext = `
Company Name: ${companyProfile.company_name}
Company Overview: ${companyProfile.company_overview || ''}
Company Mission: ${companyProfile.company_mission || ''}
Team Structure: ${companyProfile.team_structure || ''}
Company Values: ${companyProfile.company_values || ''}
`;
    }

    // Initialize OpenAI API
    const configuration = new Configuration({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    });
    const openai = new OpenAIApi(configuration);

    // Add company context to the prompt
    const prompt = `
You are a professional mentor providing feedback on an intern's work.
${companyContext ? 'Use the following company information as context:' : ''}
${companyContext}

Job Title: ${job_title}
Industry: ${industry}
Task Description: ${task_description}
Task Instructions: ${task_instructions || "No specific instructions provided."}

Intern's Submission:
${submission_text}

Provide constructive feedback on this submission. Your feedback should be encouraging but also highlight areas for improvement. Please format your response in this structure:

1. Overall Assessment: A paragraph summarizing the quality of the work
2. Strengths: 2-3 bullet points highlighting what was done well
3. Areas for Improvement: 2-3 bullet points suggesting how the work could be better
4. Recommendations: Specific tips or resources that would help the intern improve

Keep your feedback professional, specific, and actionable. Tie your feedback to industry standards and the skills that would be valuable in the ${industry} field.

Be supportive and encouraging while also providing honest criticism where needed.
`;

    // Generate feedback using OpenAI
    const response = await openai.createCompletion({
      model: "text-davinci-003", // Or gpt-3.5-turbo if available in your setup
      prompt: prompt,
      max_tokens: 1000,
      temperature: 0.7,
    });

    let feedbackText = "";
    let qualityRating = 0;
    let timelinessRating = 0;
    let collaborationRating = 0;
    let overallAssessment = "";

    try {
      // Try to parse the response as JSON
      const responseText = response.data.choices[0].text?.trim() || "";
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const feedbackData = JSON.parse(jsonMatch[0]);
        feedbackText = feedbackData.feedback_text || "Unable to generate feedback at this time.";
        qualityRating = feedbackData.quality_rating || 0;
        timelinessRating = feedbackData.timeliness_rating || 0;
        collaborationRating = feedbackData.collaboration_rating || 0;
        overallAssessment = feedbackData.overall_assessment || "";
      } else {
        // If not JSON, use the text as is
        feedbackText = responseText;
      }
    } catch (error) {
      console.error("Error parsing AI response:", error);
      feedbackText = response.data.choices[0].text?.trim() || "Unable to generate feedback at this time.";
    }

    // Save the feedback to the database
    const { error: updateError } = await supabaseClient
      .from("internship_task_submissions")
      .update({
        feedback_text: feedbackText,
        quality_rating: qualityRating,
        timeliness_rating: timelinessRating,
        collaboration_rating: collaborationRating,
        overall_assessment: overallAssessment,
        feedback_provided_at: new Date().toISOString()
      })
      .eq("id", submission_id);

    if (updateError) {
      console.error("Error updating submission with feedback:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to save feedback" }),
        { 
          status: 500, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          } 
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Feedback generated and saved successfully" 
      }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
  } catch (error) {
    console.error("Error in generate-internship-feedback function:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
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
