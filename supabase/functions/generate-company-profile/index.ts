import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define the request structure
interface CompanyProfileRequest {
  session_id: string;
  job_title: string;
  industry: string;
}

// Define the comprehensive company profile structure
interface ComprehensiveCompanyProfile {
  company_name: string;
  company_overview: string;
  company_mission: string;
  company_vision: string;
  team_structure: string;
  company_values: string;
  clients_or_products: string;
  headquarters_location: string;
  company_logo_url: string | null;
  supervisor_name: string;
  background_story: string;
  company_size: string;
  founded_year: string;
  ceo_name: string;
  ceo_bio: string;
  company_tagline: string;
  departments: string[];
  team_members: Array<{
    name: string;
    role: string;
    email: string;
    department: string;
  }>;
  tools_technologies: string[];
  target_market: string;
  notable_clients: string[];
  intern_department: string;
  sample_projects: string[];
  intern_expectations: string[];
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

    // Check if company_details already exist from internship creation
    console.log('Checking for existing company details...');
    const { data: existingDetails, error: detailsError } = await supabase
      .from('internship_company_details')
      .select('*')
      .eq('session_id', session_id)
      .limit(1);

    if (detailsError) {
      console.error('Error checking existing company details:', detailsError);
    }

    let baseCompanyInfo = null;
    if (existingDetails && existingDetails.length > 0) {
      baseCompanyInfo = existingDetails[0];
      console.log('Found existing company details:', baseCompanyInfo);
    }

    // Create the prompt for the AI - use existing company info if available
    let prompt;
    if (baseCompanyInfo) {
      // Generate profile based on existing company details to ensure consistency
      prompt = `
      Generate a detailed company profile for a virtual internship based on this EXISTING company information:
      - Company Name: ${baseCompanyInfo.name}
      - Industry: ${baseCompanyInfo.industry}
      - Description: ${baseCompanyInfo.description}
      - Mission: ${baseCompanyInfo.mission}
      - Vision: ${baseCompanyInfo.vision || 'Not specified'}
      - Values: ${Array.isArray(baseCompanyInfo.values) ? baseCompanyInfo.values.join(', ') : baseCompanyInfo.values}
      - Founded: ${baseCompanyInfo.founded_year}
      - Size: ${baseCompanyInfo.size}
      
      Job Title: ${job_title}
      
      IMPORTANT: Use the EXACT company name "${baseCompanyInfo.name}" and maintain consistency with the existing details above.
      
      Please provide ALL of the following information in a valid JSON format:
      1. company_name: "${baseCompanyInfo.name}" (MUST use this exact name)
      2. company_overview: Expand on the existing description with more detail (2-3 sentences)
      3. company_mission: "${baseCompanyInfo.mission}" (use existing mission)
      4. team_structure: Key departments/roles the intern may interact with (comma-separated list)
      5. company_values: "${Array.isArray(baseCompanyInfo.values) ? baseCompanyInfo.values.join(', ') : baseCompanyInfo.values}" (use existing values)
      6. clients_or_products: Sample products or key clients the company works with (based on industry and company info)
      7. headquarters_location: A realistic city/location for the company headquarters
      8. supervisor_name: A fictional but realistic full name for the intern's supervisor
      9. background_story: A detailed paragraph (4-6 sentences) with company history that aligns with founded year ${baseCompanyInfo.founded_year}
      
      The response should be a valid JSON object with ONLY these fields. Ensure all details are consistent with the existing company information.
      `;
    } else {
      // Generate fresh company profile if no existing details
      prompt = `
      Generate a comprehensive, immersive company profile for a virtual internship with the following characteristics:
      - Job Title: ${job_title}
      - Industry: ${industry}
      
      Create a realistic, fictional company that would provide an authentic internship experience. The company should feel professional and credible.
      
      Please provide ALL of the following information in a valid JSON format:
      
      🏢 BASIC COMPANY INFORMATION:
      1. company_name: A creative and realistic company name appropriate for the industry
      2. company_overview: A detailed 2-3 sentence description of what the company does
      3. company_mission: A compelling one-line mission statement
      4. company_vision: A forward-looking vision statement about the company's aspirations
      5. headquarters_location: A realistic city/location for headquarters
      6. company_size: Employee count range (e.g., "250-500 employees")
      7. founded_year: A realistic founding year (between 2000-2020)
      8. company_tagline: A memorable motto or tagline
      
      👥 LEADERSHIP & TEAM:
      9. ceo_name: A fictional but realistic full name for the CEO/Founder
      10. ceo_bio: A 2-3 sentence bio of the CEO highlighting their background and vision
      11. supervisor_name: A fictional but realistic full name for the intern's direct supervisor
      12. team_structure: Overview of how teams are organized
      
      🏛️ ORGANIZATIONAL DETAILS:
      13. departments: Array of 4-6 key departments (e.g., ["Engineering", "Marketing", "Sales", "Operations"])
      14. team_members: Array of 3-5 team member objects with structure: {"name": "Full Name", "role": "Job Title", "email": "email@company.com", "department": "Department Name"}
      15. intern_department: The specific department where the intern will be placed
      
      💼 BUSINESS INFORMATION:
      16. company_values: 3-4 core values as a comma-separated string
      17. target_market: Description of the company's target audience or market segment
      18. clients_or_products: Key products or services the company offers
      19. notable_clients: Array of 3-5 fictional but realistic client names
      
      🛠️ TOOLS & TECHNOLOGY:
      20. tools_technologies: Array of 5-8 realistic tools/software the company uses (mix of common tools like Slack, and industry-specific ones)
      
      🎯 INTERNSHIP-SPECIFIC:
      21. sample_projects: Array of 4-5 project types the intern might work on
      22. intern_expectations: Array of 3-4 expectations from interns (e.g., "Strong communication skills", "Willingness to learn")
      
      📖 COMPANY STORY:
      23. background_story: A detailed 4-6 sentence narrative about the company's history, founding story, and key milestones
      
      The response should be a valid JSON object with ONLY these fields. Ensure all details are internally consistent and appropriate for the ${industry} industry and ${job_title} role. Make the company feel authentic and professional.
      `;
    }

    // Call the OpenAI API for completion
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4", // Fixed model name
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
    let generatedProfile;
    try {
      generatedProfile = JSON.parse(aiResponse.choices[0].message.content) as ComprehensiveCompanyProfile;
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      throw new Error("Failed to parse company profile data");
    }

    // Validate required fields
    if (!generatedProfile.company_name || !generatedProfile.company_overview) {
      throw new Error("Generated profile missing required fields");
    }

    // Store the generated profile in Supabase
    const { data: savedProfile, error: saveError } = await supabase
      .from('internship_company_profiles')
      .insert({
        session_id,
        industry,
        company_name: generatedProfile.company_name,
        company_overview: generatedProfile.company_overview,
        company_mission: generatedProfile.company_mission,
        company_vision: generatedProfile.company_vision,
        team_structure: generatedProfile.team_structure,
        company_values: generatedProfile.company_values,
        clients_or_products: generatedProfile.clients_or_products,
        headquarters_location: generatedProfile.headquarters_location,
        company_logo_url: generatedProfile.company_logo_url,
        supervisor_name: generatedProfile.supervisor_name,
        background_story: generatedProfile.background_story,
        company_size: generatedProfile.company_size,
        founded_year: generatedProfile.founded_year,
        ceo_name: generatedProfile.ceo_name,
        ceo_bio: generatedProfile.ceo_bio,
        company_tagline: generatedProfile.company_tagline,
        departments: generatedProfile.departments,
        team_members: generatedProfile.team_members,
        tools_technologies: generatedProfile.tools_technologies,
        target_market: generatedProfile.target_market,
        notable_clients: generatedProfile.notable_clients,
        intern_department: generatedProfile.intern_department,
        sample_projects: generatedProfile.sample_projects,
        intern_expectations: generatedProfile.intern_expectations
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

    // If no existing company_details, create them to maintain consistency
    let detailsInserted = false;
    if (!baseCompanyInfo) {
      console.log('Creating company_details to match the generated profile...');
      const { error: detailsError } = await supabase
        .from('internship_company_details')
        .insert({
          session_id,
          name: generatedProfile.company_name,
          industry,
          description: generatedProfile.company_overview,
          mission: generatedProfile.company_mission,
          vision: "To become a leading force in innovation and excellence",
          values: JSON.stringify(generatedProfile.company_values.split(',').map(v => v.trim())),
          founded_year: new Date().getFullYear() - Math.floor(Math.random() * 20 + 5), // Random founding year between 5-25 years ago
          size: `${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 1000)} employees` // Random company size
        });

      if (detailsError) {
        console.error("Error saving company details:", detailsError);
        // Don't fail the whole request if details insertion fails
      } else {
        detailsInserted = true;
      }
    } else {
      // Update existing company_details if needed to maintain consistency
      console.log('Existing company details found, ensuring consistency...');
      if (baseCompanyInfo.name !== generatedProfile.company_name) {
        console.warn(`Company name mismatch detected! Details: ${baseCompanyInfo.name}, Profile: ${generatedProfile.company_name}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        data: savedProfile, 
        message: baseCompanyInfo ? "Company profile generated based on existing company details" : "Company profile generated successfully",
        details_saved: detailsInserted,
        used_existing_company: !!baseCompanyInfo
      }),
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