
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    if (!openAiApiKey) {
      throw new Error("Missing OpenAI API key");
    }

    // Get request body
    const { industry, role, additionalInfo } = await req.json();

    if (!industry || !role) {
      return new Response(
        JSON.stringify({ error: "Industry and role are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare the prompt for GPT
    const systemPrompt = `Create a comprehensive skill assessment for the ${role} role in the ${industry} industry. 
    The assessment should:
    1. Include 10 multiple-choice questions with 4 options each (A, B, C, D)
    2. Cover key skills, technologies, and knowledge areas relevant to the role
    3. Vary in difficulty (easy, medium, hard)
    4. Include a brief description of the assessment
    5. Include a list of skills being tested

    ${additionalInfo ? `Additional focus areas: ${additionalInfo}` : ""}
    
    Format the response as a JSON object with the following structure:
    {
      "description": "Brief description of the assessment",
      "skills_tested": ["skill1", "skill2", "skill3"],
      "questions": [
        {
          "question": "Question text",
          "type": "multiple_choice",
          "options": {
            "A": "Option A text",
            "B": "Option B text",
            "C": "Option C text",
            "D": "Option D text"
          },
          "correctAnswer": "A", // or the correct option letter
          "skill": "Specific skill being tested",
          "difficulty": "easy"  // easy, medium, or hard
        }
      ]
    }`;

    console.log("Generating assessment for:", { industry, role });

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate a skill assessment for ${role} in ${industry}.` },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error("Failed to generate assessment");
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Parse the JSON response from GPT
    let assessment;
    try {
      assessment = JSON.parse(generatedContent);
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      throw new Error("Invalid response format from assessment generator");
    }

    // Return the generated assessment
    return new Response(
      JSON.stringify({ assessment }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating skill assessment:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
