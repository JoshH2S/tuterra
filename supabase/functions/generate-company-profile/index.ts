import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define the request structure
interface CompanyProfileRequest {
  session_id: string;
  job_title: string;
  industry: string;
}

// Define the generated company profile structure
interface CompanyProfile {
  company_name: string;
  company_overview: string;
  company_mission: string;
  team_structure: string;
  company_values: string;
  clients_or_products: string;
  headquarters_location: string;
  company_logo_url: string | null;
  supervisor_name: string;
  background_story: string;
}

serve(async (req) => {
  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header provided' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a Supabase client with the service key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the request body
    const requestData: CompanyProfileRequest = await req.json();
    const { session_id, job_title, industry } = requestData;

    if (!session_id || !job_title || !industry) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if a profile already exists for this session
    const { data: existingProfile, error: profileError } = await supabase
      .from('internship_company_profiles')
      .select('id')
      .eq('session_id', session_id)
      .limit(1);

    if (profileError) {
      console.error('Error checking existing profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Error checking for existing company profile' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (existingProfile && existingProfile.length > 0) {
      // Return the existing profile instead of generating a new one
      const { data: profile, error: fetchError } = await supabase
        .from('internship_company_profiles')
        .select('*')
        .eq('id', existingProfile[0].id)
        .single();

      if (fetchError) {
        return new Response(
          JSON.stringify({ error: 'Error fetching existing company profile' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ data: profile, message: "Existing company profile retrieved" }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create the prompt for the AI
    const prompt = `
    Generate a fictional but realistic company profile for a virtual internship with the following characteristics:
    - Job Title: ${job_title}
    - Industry: ${industry}
    
    Please provide ALL of the following information in a valid JSON format:
    1. company_name: A creative and realistic company name appropriate for the industry
    2. company_overview: A short 1-2 sentence description of what the company does
    3. company_mission: A concise one-line mission statement
    4. team_structure: Key departments/roles the intern may interact with (comma-separated list)
    5. company_values: 2-3 core values (comma-separated list)
    6. clients_or_products: Sample products or key clients the company works with
    7. headquarters_location: A realistic city/location for the company headquarters
    8. supervisor_name: A fictional but realistic full name for the intern's supervisor
    9. background_story: A paragraph (3-5 sentences) with company history or narrative
    
    The response should be a valid JSON object with ONLY these fields, nothing else. Make sure all company details are consistent with each other and appropriate for the job title and industry.
    `;

    // Call the OpenAI API for completion
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o", // Use GPT-4o model
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates realistic company profiles for virtual internships. Respond with valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`);
    }

    const aiResponse = await response.json();
    const generatedProfile = JSON.parse(aiResponse.choices[0].message.content) as CompanyProfile;

    // Store the generated profile in Supabase
    const { data: savedProfile, error: saveError } = await supabase
      .from('internship_company_profiles')
      .insert({
        session_id,
        industry,
        ...generatedProfile
      })
      .select('*')
      .single();

    if (saveError) {
      console.error("Error saving company profile:", saveError);
      return new Response(
        JSON.stringify({ error: 'Error saving company profile' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ data: savedProfile, message: "Company profile generated successfully" }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}); 