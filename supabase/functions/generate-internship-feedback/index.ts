
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openAiKey = Deno.env.get("OPENAI_API_KEY");

// Initialize Supabase client with admin rights
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Check if OpenAI API key exists
    if (!openAiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    // Parse the request body
    const { sessionId, userId, taskId, taskTitle, taskSummary, userResponse, jobTitle, industry } = await req.json();

    // Validate required fields
    if (!sessionId || !taskTitle || !userResponse) {
      return new Response(
        JSON.stringify({ error: "Missing required fields", details: "sessionId, taskTitle, and userResponse are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(`Generating feedback for task "${taskTitle}" in session ${sessionId}`);

    // Create system prompt for OpenAI
    const prompt = `You are acting as an internship supervisor for a virtual internship. 
The intern is working as a ${jobTitle || 'professional'} in the ${industry || 'relevant'} industry. 
They just submitted the following task: ${taskTitle}. 
${taskSummary ? `Task summary: ${taskSummary}.` : ''}
Their response was: ${userResponse}.

Give them a short feedback paragraph (2–4 sentences), and rate them from 1 to 10 on quality, timeliness, and collaboration. 
Respond in the following JSON format:
{
  "feedback_text": "...",
  "quality_rating": 8,
  "timeliness_rating": 9,
  "collaboration_rating": 7
}`;

    // Make a request to OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API request failed: ${response.status} - ${error}`);
    }

    // Parse the OpenAI response
    const completion = await response.json();
    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    // Parse the JSON content (handling potential formatting issues)
    let parsedFeedback;
    try {
      parsedFeedback = JSON.parse(content.trim());
    } catch (err) {
      console.error("Error parsing OpenAI response:", err);
      // Try to extract JSON from text if it's not properly formatted
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedFeedback = JSON.parse(jsonMatch[0]);
        } catch {
          throw new Error("Could not parse feedback from OpenAI response");
        }
      } else {
        throw new Error("Could not extract JSON from OpenAI response");
      }
    }

    // Validate parsed feedback
    if (!parsedFeedback.feedback_text || 
        !parsedFeedback.quality_rating || 
        !parsedFeedback.timeliness_rating || 
        !parsedFeedback.collaboration_rating) {
      throw new Error("Incomplete feedback data from OpenAI");
    }

    // Save feedback to the database
    const { data: feedbackData, error: insertError } = await supabase
      .from("internship_feedback")
      .insert({
        user_id: userId,
        session_id: sessionId,
        task_title: taskTitle,
        deliverable_id: taskId || null,
        feedback_text: parsedFeedback.feedback_text,
        quality_rating: parsedFeedback.quality_rating,
        timeliness_rating: parsedFeedback.timeliness_rating,
        collaboration_rating: parsedFeedback.collaboration_rating,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error saving feedback to database:", insertError);
      throw new Error(`Database error: ${insertError.message}`);
    }

    // Return the feedback data
    return new Response(
      JSON.stringify({
        success: true,
        feedback: feedbackData,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in generate-internship-feedback function:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "An unexpected error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
