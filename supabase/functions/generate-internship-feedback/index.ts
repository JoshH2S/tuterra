import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.1.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Initialize OpenAI API
    const configuration = new Configuration({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    });
    const openai = new OpenAIApi(configuration);

    // Create the prompt for feedback generation
    const prompt = `
      You are an expert mentor in the field of ${industry} providing feedback on an internship task submission.
      
      Task Description: ${task_description}
      ${task_instructions ? `Task Instructions: ${task_instructions}` : ""}
      
      The intern is working as a ${job_title}.
      
      Here is their submission:
      """
      ${submission_text}
      """
      
      Please provide constructive feedback on this submission and rate the work on three dimensions on a scale of 1-10:
      
      Your response MUST be in the following JSON format:
      
      {
        "feedback_text": "Your detailed markdown-formatted feedback with sections for strengths, areas for improvement, and next steps",
        "quality_rating": [1-10 numeric rating],
        "timeliness_rating": [1-10 numeric rating],
        "collaboration_rating": [1-10 numeric rating],
        "overall_assessment": "Excellent/Good/Satisfactory/Needs Improvement"
      }
      
      For the ratings:
      - Quality: Rate the accuracy, thoroughness and professionalism of the work
      - Timeliness: Rate how well this would meet deadlines in a real workplace setting
      - Collaboration: Rate how well this demonstrates ability to work with others or build on existing work
      
      Keep the feedback professional, encouraging, and constructive. Format the feedback_text in Markdown.
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
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Feedback generated and saved successfully" 
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-internship-feedback function:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
