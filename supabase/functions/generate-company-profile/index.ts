import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Define the request structure
interface CompanyProfileRequest {
  session_id: string;
  job_title: string;
  industry: string;
}

// Define the company details structure
interface CompanyDetails {
  id: string;
  session_id: string;
  name: string;
  industry: string;
  description: string;
  mission: string;
  vision: string;
  values: string[] | string;
  founded_year: string | number;
  size: string;
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: 'No authorization header provided'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Create a Supabase client with the service key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the request body
    const requestData = await req.json();
    const { session_id, job_title, industry } = requestData;

    if (!session_id || !job_title || !industry) {
      return new Response(JSON.stringify({
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Check if a profile already exists for this session
    const { data: existingProfile, error: profileError } = await supabase
      .from('internship_company_profiles')
      .select('id, profile_status')
      .eq('session_id', session_id)
      .limit(1);

    if (profileError) {
      console.error('Error checking existing profile:', profileError);
      return new Response(JSON.stringify({
        error: 'Error checking for existing company profile'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Create or update pending profile record with placeholder values
    let profileId;
    const pendingProfileData = {
      session_id,
      industry,
      profile_status: 'pending',
      company_name: `${industry} Company (Generating...)`,
      company_overview: 'Company profile is being generated...',
      company_mission: 'Generating company mission...',
      company_vision: 'Generating company vision...',
      team_structure: 'Generating team structure...',
      company_values: 'Generating company values...',
      clients_or_products: 'Generating products and services...',
      headquarters_location: 'Determining headquarters location...',
      supervisor_name: 'Assigning supervisor...',
      background_story: 'Crafting company history...',
      company_size: 'Calculating company size...',
      founded_year: '2000',
      ceo_name: 'Appointing CEO...',
      ceo_bio: 'Writing CEO biography...',
      company_tagline: 'Creating company tagline...',
      departments: [],
      team_members: [],
      tools_technologies: [],
      target_market: 'Analyzing target market...',
      notable_clients: [],
      intern_department: 'Selecting intern department...',
      sample_projects: [],
      intern_expectations: []
    };

    if (existingProfile && existingProfile.length > 0) {
      const profile = existingProfile[0];
      
      if (profile.profile_status === 'completed') {
        const { data: fullProfile, error: fetchError } = await supabase
          .from('internship_company_profiles')
          .select('*')
          .eq('id', profile.id)
          .single();

        if (fetchError) {
          console.error('Error fetching existing profile:', fetchError);
        } else {
          return new Response(JSON.stringify({ 
            data: fullProfile, 
            message: "Existing completed company profile retrieved",
            status: 'completed' 
          }), { 
            status: 200, 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            } 
          });
        }
      }
      
      // If profile exists but is pending or error, update it
      console.log(`Found existing profile with status: ${profile.profile_status}, updating to pending...`);
      const { data: updatedProfile, error: updateError } = await supabase
        .from('internship_company_profiles')
        .update(pendingProfileData)
        .eq('id', profile.id)
        .select('id')
        .single();

      if (updateError) {
        console.error('Error updating profile to pending:', updateError);
        throw new Error('Failed to update profile status');
      }
      profileId = updatedProfile.id;
    } else {
      // Create new pending profile
      const { data: pendingProfile, error: pendingError } = await supabase
        .from('internship_company_profiles')
        .insert(pendingProfileData)
        .select('id')
        .single();

      if (pendingError) {
        console.error('Error creating pending profile:', pendingError);
        throw new Error('Failed to create pending profile');
      }
      profileId = pendingProfile.id;
    }

    console.log(`Created/updated pending profile with ID: ${profileId}`);

    // Check if company_details already exist from internship creation
    console.log('Checking for existing company details...');
    let baseCompanyInfo = null;
    let retryCount = 0;
    const maxRetries = 8;  // Will check for up to 40 seconds
    const retryDelay = 5000;  // 5 second delay between checks

    while (retryCount < maxRetries) {
    const { data: existingDetails, error: detailsError } = await supabase
      .from('internship_company_details')
      .select('*')
      .eq('session_id', session_id)
      .limit(1);

    if (detailsError) {
      console.error('Error checking existing company details:', detailsError);
      } else if (existingDetails && existingDetails.length > 0) {
      baseCompanyInfo = existingDetails[0];
        console.log('Found existing company details on attempt', retryCount + 1);
        break;
      }

      // If no details found and not last retry, wait and try again
      if (retryCount < maxRetries - 1) {
        const timeWaited = retryCount * retryDelay / 1000;
        const timeLeft = (maxRetries - retryCount - 1) * retryDelay / 1000;
        console.log(`No company details yet (waited ${timeWaited}s). Retry ${retryCount + 1}/${maxRetries}. Will keep trying for ${timeLeft}s more...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
      retryCount++;
    }

    if (!baseCompanyInfo) {
      console.log(`No company details found after ${maxRetries} attempts (${(maxRetries * retryDelay) / 1000}s total wait time)`);
    }

    try {
    // Create the prompt for the AI - use a single comprehensive prompt regardless of whether baseCompanyInfo exists
    let prompt = `
      Generate a comprehensive, immersive company profile for a virtual internship with the following characteristics:
      - Job Title: ${job_title}
      - Industry: ${industry}
      ${baseCompanyInfo ? `
      IMPORTANT: Use the EXISTING company information as a foundation:
      - Company Name: ${baseCompanyInfo.name}
      - Description: ${baseCompanyInfo.description}
      - Mission: ${baseCompanyInfo.mission}
      - Vision: ${baseCompanyInfo.vision || 'Not specified'}
      - Values: ${Array.isArray(baseCompanyInfo.values) ? baseCompanyInfo.values.join(', ') : baseCompanyInfo.values}
      - Founded: ${baseCompanyInfo.founded_year}
      - Size: ${baseCompanyInfo.size}
      ` : `Create a realistic, fictional company that would provide an authentic internship experience. The company should feel professional and credible.`}
      
      Please provide ALL of the following information in a valid JSON format:
      
      🏢 BASIC COMPANY INFORMATION:
      1. company_name: ${baseCompanyInfo ? `"${baseCompanyInfo.name}" (MUST use this exact name)` : 'A creative and realistic company name appropriate for the industry'}
      2. company_overview: ${baseCompanyInfo ? 'Expand on the existing description with more detail (2-3 sentences)' : 'A detailed 2-3 sentence description of what the company does'}
      3. company_mission: ${baseCompanyInfo ? `"${baseCompanyInfo.mission}" (use existing mission)` : 'A compelling one-line mission statement'}
      4. company_vision: ${baseCompanyInfo && baseCompanyInfo.vision ? `"${baseCompanyInfo.vision}" (use existing vision)` : 'A forward-looking vision statement about the company\'s aspirations'}
      5. headquarters_location: A realistic city/location for headquarters
      6. company_size: ${baseCompanyInfo ? `"${baseCompanyInfo.size}" (use existing size)` : 'Employee count range (e.g., "250-500 employees")'}
      7. founded_year: ${baseCompanyInfo ? `"${baseCompanyInfo.founded_year}" (use existing founding year)` : 'A realistic founding year (between 2000-2020)'}
      8. company_tagline: A memorable motto or tagline
      
      👥 LEADERSHIP & TEAM:
      9. ceo_name: A fictional but realistic full name for the CEO/Founder
      10. ceo_bio: A 2-3 sentence bio of the CEO highlighting their background and vision
      11. supervisor_name: A fictional but realistic full name for the intern's direct supervisor
      12. team_structure: Overview of how teams are organized (key departments/roles the intern may interact with)
      
      🏛️ ORGANIZATIONAL DETAILS:
      13. departments: Array of 4-6 key departments (e.g., ["Engineering", "Marketing", "Sales", "Operations"])
      14. team_members: Array of 3-5 team member objects with structure: {"name": "Full Name", "role": "Job Title", "email": "email@company.com", "department": "Department Name"}
      15. intern_department: The specific department where the intern will be placed (related to the ${job_title} role)
      
      💼 BUSINESS INFORMATION:
      16. company_values: ${baseCompanyInfo ? `"${Array.isArray(baseCompanyInfo.values) ? baseCompanyInfo.values.join(', ') : baseCompanyInfo.values}" (use existing values)` : '3-4 core values as a comma-separated string'}
      17. target_market: Description of the company's target audience or market segment
      18. clients_or_products: Key products or services the company offers
      19. notable_clients: Array of 3-5 fictional but realistic client names
      
      🛠️ TOOLS & TECHNOLOGY:
      20. tools_technologies: Array of 5-8 realistic tools/software the company uses (mix of common tools like Slack, and industry-specific ones)
      
      🎯 INTERNSHIP-SPECIFIC:
      21. sample_projects: Array of 4-5 project types the intern might work on
      22. intern_expectations: Array of 3-4 expectations from interns (e.g., "Strong communication skills", "Willingness to learn")
      
      📖 COMPANY STORY:
      23. background_story: A detailed 4-6 sentence narrative about the company's history, founding story, and key milestones ${baseCompanyInfo ? `that aligns with founded year ${baseCompanyInfo.founded_year}` : ''}
      
      The response should be a valid JSON object with ONLY these fields. Ensure all details are internally consistent and appropriate for the ${industry} industry and ${job_title} role. Make the company feel authentic and professional.
      `;

      console.log('Calling OpenAI API...');

    // Call the OpenAI API for completion
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
          model: "gpt-4o",
        messages: [
          {
            role: "system",
              content: "You are a helpful assistant that generates realistic company profiles for virtual internships. You MUST respond with valid JSON only - no explanations, no markdown formatting, no code blocks. Return only the raw JSON object."
          },
          {
            role: "user",
              content: prompt + "\n\nIMPORTANT: Respond with ONLY valid JSON. Do not include any explanations, markdown formatting, or code blocks. The response must be a single JSON object that can be parsed directly."
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
          max_tokens: 2000 // Limit response size
      }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: "Failed to parse error response" } }));
      console.error("OpenAI API error:", errorData);
        throw new Error(`OpenAI API error: ${errorData.error?.message || "Request failed"}`);
    }

    const aiResponse = await response.json();
    let generatedProfile;
    try {
        generatedProfile = JSON.parse(aiResponse.choices[0].message.content);
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      throw new Error("Failed to parse company profile data");
    }

    // Validate required fields
    if (!generatedProfile.company_name || !generatedProfile.company_overview) {
      throw new Error("Generated profile missing required fields");
    }

    // Ensure we're not storing placeholder values in a completed profile
    const hasPlaceholderValues = (
      generatedProfile.company_name.includes("Generating...") ||
      generatedProfile.company_tagline === "Creating company tagline..." ||
      generatedProfile.company_size === "Calculating company size..." ||
      generatedProfile.company_vision === "Generating company vision..." ||
      generatedProfile.ceo_name === "Appointing CEO..." ||
      generatedProfile.ceo_bio === "Writing CEO biography..." ||
      generatedProfile.intern_department === "Selecting intern department..." ||
      generatedProfile.company_overview === "Company profile is being generated..." ||
      generatedProfile.company_mission === "Generating company mission..." ||
      generatedProfile.team_structure === "Generating team structure..." ||
      generatedProfile.company_values === "Generating company values..." ||
      generatedProfile.clients_or_products === "Generating products and services..." ||
      generatedProfile.headquarters_location === "Determining headquarters location..." ||
      generatedProfile.supervisor_name === "Assigning supervisor..." ||
      generatedProfile.background_story === "Crafting company history..." ||
      generatedProfile.target_market === "Analyzing target market..."
    );

    if (hasPlaceholderValues) {
      console.warn("Generated profile contains placeholder values, treating as incomplete");
      throw new Error("Generated profile contains placeholder values");
    }

    console.log('Successfully generated profile, updating database...');

    // Update the profile with the generated data and mark as completed
    const { data: savedProfile, error: saveError } = await supabase
      .from('internship_company_profiles')
        .update({
        industry,
        company_name: generatedProfile.company_name,
        company_overview: generatedProfile.company_overview,
        company_mission: generatedProfile.company_mission,
        company_vision: generatedProfile.company_vision || "To become a leading force in innovation and excellence",
        team_structure: generatedProfile.team_structure || "Cross-functional teams with agile methodologies",
        company_values: generatedProfile.company_values,
        clients_or_products: generatedProfile.clients_or_products || `Various ${industry} products and services`,
        headquarters_location: generatedProfile.headquarters_location || "New York, NY",
        company_logo_url: generatedProfile.company_logo_url,
        supervisor_name: generatedProfile.supervisor_name || `${["Alex", "Jordan", "Taylor", "Morgan", "Casey"][Math.floor(Math.random() * 5)]} ${["Smith", "Johnson", "Williams", "Brown", "Jones"][Math.floor(Math.random() * 5)]}`,
        background_story: generatedProfile.background_story || `Founded in ${generatedProfile.founded_year || new Date().getFullYear() - Math.floor(Math.random() * 20 + 5)}, the company began with a vision to transform the ${industry} industry. Through innovation and dedication, it has grown steadily, expanding its offerings and market presence.`,
        company_size: generatedProfile.company_size || `${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 1000)} employees`,
        founded_year: generatedProfile.founded_year || new Date().getFullYear() - Math.floor(Math.random() * 20 + 5),
        ceo_name: generatedProfile.ceo_name || `${["Michael", "Sarah", "David", "Jessica", "Robert"][Math.floor(Math.random() * 5)]} ${["Lee", "Chen", "Garcia", "Patel", "Kim"][Math.floor(Math.random() * 5)]}`,
        ceo_bio: generatedProfile.ceo_bio || `A seasoned leader with over ${Math.floor(Math.random() * 15 + 10)} years of experience in the ${industry} industry. Known for strategic vision and commitment to innovation.`,
        company_tagline: generatedProfile.company_tagline || `Innovating ${industry} for a better tomorrow`,
        departments: generatedProfile.departments && generatedProfile.departments.length > 0 
          ? generatedProfile.departments 
          : ["Engineering", "Marketing", "Sales", "Operations", "Human Resources", "Research & Development"],
        team_members: generatedProfile.team_members && generatedProfile.team_members.length > 0 
          ? generatedProfile.team_members 
          : [
              { name: "Jamie Wilson", role: "Senior Manager", email: "jwilson@example.com", department: "Engineering" },
              { name: "Sam Thompson", role: "Team Lead", email: "sthompson@example.com", department: "Product" },
              { name: "Alex Rivera", role: "Project Coordinator", email: "arivera@example.com", department: "Operations" }
            ],
        tools_technologies: generatedProfile.tools_technologies && generatedProfile.tools_technologies.length > 0 
          ? generatedProfile.tools_technologies 
          : ["Slack", "Microsoft Office", "Zoom", "Trello", "Google Workspace"],
        target_market: generatedProfile.target_market || `Mid to large-sized businesses in the ${industry} sector`,
        notable_clients: generatedProfile.notable_clients && generatedProfile.notable_clients.length > 0 
          ? generatedProfile.notable_clients 
          : ["Acme Corporation", "Global Enterprises", "Innovative Solutions", "Premium Services Inc."],
        intern_department: generatedProfile.intern_department || "Operations",
        sample_projects: generatedProfile.sample_projects && generatedProfile.sample_projects.length > 0 
          ? generatedProfile.sample_projects 
          : ["Market Analysis", "Process Optimization", "Client Engagement", "Product Development"],
        intern_expectations: generatedProfile.intern_expectations && generatedProfile.intern_expectations.length > 0 
          ? generatedProfile.intern_expectations 
          : ["Strong communication skills", "Problem-solving ability", "Team collaboration", "Willingness to learn"],
        profile_status: 'completed',
        error_message: null
      })
        .eq('id', profileId)
      .select('*')
      .single();

    if (saveError) {
      console.error("Error saving company profile:", saveError);
        throw new Error('Error saving company profile to database');
    }

    // If no existing company_details, create them to maintain consistency
    let detailsInserted = false;
    if (!baseCompanyInfo) {
        // Double-check one last time before creating details
        const { data: finalCheck } = await supabase
          .from('internship_company_details')
          .select('*')
          .eq('session_id', session_id)
          .limit(1);

        if (finalCheck && finalCheck.length > 0) {
          console.log('Company details were created while generating profile, skipping creation');
        } else {
      console.log('Creating company_details to match the generated profile...');
      const { error: detailsError } = await supabase
        .from('internship_company_details')
        .insert({
          session_id,
          name: generatedProfile.company_name,
          industry,
          description: generatedProfile.company_overview,
          mission: generatedProfile.company_mission,
          vision: generatedProfile.company_vision || "To become a leading force in innovation and excellence",
          values: JSON.stringify(generatedProfile.company_values.split(',').map(v => v.trim())),
          founded_year: generatedProfile.founded_year || new Date().getFullYear() - Math.floor(Math.random() * 20 + 5),
          size: generatedProfile.company_size || `${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 1000)} employees`
        });

      if (detailsError) {
        console.error("Error saving company details:", detailsError);
        // Don't fail the whole request if details insertion fails
      } else {
        detailsInserted = true;
      }
        }
      }

      console.log(`✅ Company profile generation completed successfully for session ${session_id}`);

      return new Response(JSON.stringify({ 
        data: savedProfile, 
        message: baseCompanyInfo ? "Company profile generated based on existing company details" : "Company profile generated successfully",
        details_saved: detailsInserted,
        used_existing_company: !!baseCompanyInfo,
        status: 'completed'
      }), { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      });

    } catch (generationError) {
      console.error("Error during profile generation:", generationError);
      
      // Update profile status to error
      const { error: errorUpdateError } = await supabase
        .from('internship_company_profiles')
        .update({
          profile_status: 'error',
          error_message: generationError.message || 'Unknown error during profile generation'
        })
        .eq('id', profileId);

      if (errorUpdateError) {
        console.error("Error updating profile error status:", errorUpdateError);
      }

      throw generationError; // Re-throw to be caught by outer catch block
    }

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "An unexpected error occurred",
      status: 'error'
    }), { 
      status: 500, 
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      } 
    });
  }
}); 