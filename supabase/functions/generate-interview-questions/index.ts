
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openaiApiKey = Deno.env.get("OPENAI_API_KEY")!;

// Initialize Supabase client with admin rights
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    console.log("Function called: generate-interview-questions");
    const { industry, jobRole, jobDescription, sessionId } = await req.json();
    
    // Validate required parameters
    if (!sessionId) {
      console.error("Missing sessionId parameter");
      return new Response(
        JSON.stringify({ error: "Missing sessionId parameter" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    if (!industry || !jobRole) {
      console.error("Missing required parameters:", { industry, jobRole });
      return new Response(
        JSON.stringify({ error: "Missing required parameters: industry and jobRole are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log(`Generating questions for session ${sessionId}`);
    console.log("Parameters:", { industry, jobRole, jobDescription: jobDescription ? jobDescription.substring(0, 50) + "..." : "N/A" });
    
    // Here you would normally call the OpenAI API
    // For now, let's generate some mock questions based on the provided information
    // In a production environment, this would be replaced with a real AI API call
    
    const questions = generateMockQuestions(industry, jobRole, jobDescription);
    console.log(`Generated ${questions.length} questions`);
    
    // Save the questions to the database
    console.log("Updating session with generated questions");
    const { error: updateError } = await supabase
      .from('interview_sessions')
      .update({ questions })
      .eq('session_id', sessionId);
    
    if (updateError) {
      console.error("Error updating session with questions:", updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
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
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Generate mock questions based on industry, job role, and description
function generateMockQuestions(industry: string, jobRole: string, jobDescription?: string) {
  const currentDate = new Date().toISOString();
  const baseQuestions = [
    {
      id: `q-${crypto.randomUUID()}`,
      question: `Tell me about your experience as a ${jobRole} in the ${industry} industry.`,
      question_order: 0,
      created_at: currentDate
    },
    {
      id: `q-${crypto.randomUUID()}`,
      question: `What skills do you have that make you a good fit for this ${jobRole} position?`,
      question_order: 1,
      created_at: currentDate
    },
    {
      id: `q-${crypto.randomUUID()}`,
      question: `Describe a challenging situation you've faced in a previous role and how you handled it.`,
      question_order: 2,
      created_at: currentDate
    },
    {
      id: `q-${crypto.randomUUID()}`,
      question: `How do you stay updated with trends and changes in the ${industry} industry?`,
      question_order: 3,
      created_at: currentDate
    },
    {
      id: `q-${crypto.randomUUID()}`,
      question: `Where do you see yourself professionally in five years?`,
      question_order: 4,
      created_at: currentDate
    }
  ];
  
  // Add industry-specific questions
  if (industry.toLowerCase() === 'technology' || industry.toLowerCase() === 'tech') {
    baseQuestions.push({
      id: `q-${crypto.randomUUID()}`,
      question: "Describe a technical project you worked on that you're particularly proud of.",
      question_order: 5,
      created_at: currentDate
    });
  } else if (industry.toLowerCase() === 'finance') {
    baseQuestions.push({
      id: `q-${crypto.randomUUID()}`,
      question: "How do you ensure accuracy and attention to detail in your financial work?",
      question_order: 5,
      created_at: currentDate
    });
  } else if (industry.toLowerCase() === 'healthcare') {
    baseQuestions.push({
      id: `q-${crypto.randomUUID()}`,
      question: "How do you balance patient care with administrative responsibilities?",
      question_order: 5,
      created_at: currentDate
    });
  }
  
  // Add role-specific questions
  if (jobRole.toLowerCase().includes('manager') || jobRole.toLowerCase().includes('leader')) {
    baseQuestions.push({
      id: `q-${crypto.randomUUID()}`,
      question: "Describe your management style and how you motivate your team.",
      question_order: 6,
      created_at: currentDate
    });
  } else if (jobRole.toLowerCase().includes('engineer') || jobRole.toLowerCase().includes('developer')) {
    baseQuestions.push({
      id: `q-${crypto.randomUUID()}`,
      question: "How do you approach debugging and troubleshooting complex technical issues?",
      question_order: 6,
      created_at: currentDate
    });
  } else if (jobRole.toLowerCase().includes('analyst')) {
    baseQuestions.push({
      id: `q-${crypto.randomUUID()}`,
      question: "Describe how you would approach analyzing a complex dataset to extract meaningful insights.",
      question_order: 6,
      created_at: currentDate
    });
  }
  
  return baseQuestions;
}
