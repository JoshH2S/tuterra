import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const openAiKey = Deno.env.get("OPENAI_API_KEY");

    // Validate environment variables
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey || !openAiKey) {
      console.error("Missing required environment variables:", {
        supabaseUrl: !!supabaseUrl,
        supabaseAnonKey: !!supabaseAnonKey,
        supabaseServiceRoleKey: !!supabaseServiceRoleKey,
        openAiKey: !!openAiKey
      });
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { 
          status: 500, 
          headers: { 
            "Content-Type": "application/json", 
            ...corsHeaders 
          } 
        }
      );
    }

    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );
    
    // Create a Supabase admin client with service role for bypassing RLS
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceRoleKey
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

    // Add detailed request validation and logging
    console.log("Request data received:", {
      has_submission_id: !!submission_id,
      has_task_id: !!task_id,
      has_submission_text: !!submission_text,
      has_task_description: !!task_description,
      has_task_instructions: !!task_instructions,
      has_job_title: !!job_title,
      has_industry: !!industry,
    });

    if (!submission_id || !task_id) {
      console.error("Missing critical fields:", { submission_id, task_id });
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields", 
          details: "submission_id and task_id are required"
        }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json", 
            ...corsHeaders 
          } 
        }
      );
    }

    // Get submission data from database (including user_id which we need later)
    let finalSubmissionText = submission_text;
    let user_id: string;
    
    console.log("Fetching submission data from database");
    const { data: submissionData, error: submissionError } = await supabaseAdmin
      .from("internship_task_submissions")
      .select("response_text, file_url, file_name, content_type, user_id")
      .eq("id", submission_id)
      .single();
      
    if (submissionError) {
      console.error("Error fetching submission data:", submissionError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch submission data", 
          details: submissionError 
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
    
    if (!submissionData) {
      return new Response(
        JSON.stringify({ 
          error: "Submission not found", 
          details: "No submission found with the provided ID" 
        }),
        { 
          status: 404, 
          headers: { 
            "Content-Type": "application/json", 
            ...corsHeaders 
          } 
        }
      );
    }
    
    // Extract user_id from submission data
    user_id = submissionData.user_id;
    
    // Use submission text from request if provided, otherwise get from database
    if (!finalSubmissionText) {
      // If it's a file submission, include the file information
      if (submissionData?.content_type === 'file' || submissionData?.content_type === 'both') {
        const fileInfo = submissionData.file_url ? 
          `\n\nFile Submission: ${submissionData.file_name || 'Unnamed file'} (${submissionData.file_url})` : '';
        
        finalSubmissionText = (submissionData?.response_text || '') + fileInfo;
      } else {
        finalSubmissionText = submissionData?.response_text || "No submission text provided.";
      }
      
      if (!finalSubmissionText.trim()) {
        finalSubmissionText = "No text submission provided. Please review the attached file.";
      }
    }

    // If task description is missing, fetch it
    let finalTaskDescription = task_description;
    let finalTaskInstructions = task_instructions;
    
    if (!finalTaskDescription) {
      console.log("Task description missing from request, fetching from database");
      const { data: taskData, error: taskError } = await supabaseAdmin
        .from("internship_tasks")
        .select("description, instructions")
        .eq("id", task_id)
        .single();
      
      if (taskError) {
        console.error("Error fetching task data:", taskError);
        return new Response(
          JSON.stringify({ 
            error: "Failed to fetch task data", 
            details: taskError 
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
      
      finalTaskDescription = taskData?.description || "No task description available.";
      if (!finalTaskInstructions) {
        finalTaskInstructions = taskData?.instructions || "";
      }
    }

    // If job title or industry is missing, fetch from session
    let finalJobTitle = job_title;
    let finalIndustry = industry;
    
    if (!finalJobTitle || !finalIndustry) {
      console.log("Job title or industry missing, fetching from session");
      // After getting the submission details, fetch company profile information
      const { data: taskData, error: taskError } = await supabaseAdmin
        .from('internship_tasks')
        .select('session_id')
        .eq('id', task_id)
        .single();

      if (taskError) {
        console.error('Error fetching task session:', taskError);
        return new Response(
          JSON.stringify({ error: 'Error fetching task information' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      const sessionId = taskData.session_id;
      
      const { data: sessionData, error: sessionError } = await supabaseAdmin
        .from("internship_sessions")
        .select("job_title, industry")
        .eq("id", sessionId)
        .single();
        
      if (sessionError) {
        console.error("Error fetching session data:", sessionError);
        return new Response(
          JSON.stringify({ 
            error: "Failed to fetch session data", 
            details: sessionError 
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
      
      finalJobTitle = sessionData?.job_title || "Intern";
      finalIndustry = sessionData?.industry || "Technology";
    }

    console.log(`Processing feedback for submission ${submission_id} for task ${task_id}`);

    // First get the session_id for the task
    const { data: taskSessionData, error: taskSessionError } = await supabaseAdmin
      .from('internship_tasks')
      .select('session_id')
      .eq('id', task_id)
      .single();

    if (taskSessionError) {
      console.error('Error fetching task session:', taskSessionError);
      // Continue without company profile
    }

    const sessionId = taskSessionData?.session_id;

    // Get company profile information if we have a session ID
    let companyContext = '';
    if (sessionId) {
      const { data: companyProfile, error: companyError } = await supabaseAdmin
        .from('internship_company_profiles')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (companyError && companyError.code !== 'PGRST116') {
        console.error('Error fetching company profile:', companyError);
        // Non-critical error, continue without company profile
      }

      // Build company context from the company profile
      if (companyProfile) {
        companyContext = `
Company Name: ${companyProfile.company_name}
Company Overview: ${companyProfile.company_overview || ''}
Company Mission: ${companyProfile.company_mission || ''}
Team Structure: ${companyProfile.team_structure || ''}
Company Values: ${companyProfile.company_values || ''}
`;
      }
    }

    // Get available skills for this analysis
    const { data: availableSkills } = await supabaseAdmin
      .from("skills")
      .select("id, name, description, category");

    const skillsContext = availableSkills ? availableSkills.map(skill => 
      `${skill.name}: ${skill.description} (Category: ${skill.category})`
    ).join('\n') : '';

    // Create the enhanced system prompt with skills analysis
    const systemPrompt = `
You are a professional mentor providing feedback on an intern's work. 
${companyContext ? 'Use the following company information as context:' : ''}
${companyContext}

Job Title: ${finalJobTitle}
Industry: ${finalIndustry}

Available Skills to Evaluate:
${skillsContext}

Please analyze the submission for a ${finalJobTitle} intern task. You need to provide detailed, constructive feedback AND identify which skills were demonstrated.

Provide the feedback in the following JSON format:
{
  "feedback_text": "Detailed and well-structured feedback using plain text only. Do NOT use markdown formatting, asterisks, hashtags, or any special characters for formatting. Use clear paragraphs and natural language structure instead.",
  "quality_rating": <number between 1-10>,
  "timeliness_rating": <number between 1-10>,
  "collaboration_rating": <number between 1-10>,
  "overall_assessment": "<one of: Excellent, Good, Satisfactory, Needs Improvement>",
  "skills_demonstrated": [
    {
      "skill_name": "Technical Writing",
      "proficiency_score": 7.5,
      "xp_earned": 18,
      "evidence_quality": "high",
      "specific_examples": ["Clear methodology section", "Professional tone throughout"],
      "improvement_suggestions": ["Could add more specific examples", "Consider using bullet points for clarity"]
    }
  ]
}

For skills_demonstrated:
- Only include skills that are clearly evident in the submission
- proficiency_score: 1-10 scale of how well the skill was demonstrated
- xp_earned: 10-25 XP based on quality of demonstration (higher for better examples)
- evidence_quality: "high", "medium", or "low" based on how well this submission showcases the skill
- specific_examples: 2-3 concrete examples from the submission
- improvement_suggestions: 1-2 actionable ways to improve this skill

Your feedback should:
1. Be supportive and encouraging
2. Provide specific insights on strengths
3. Give actionable suggestions for improvement
4. Relate to industry standards for a ${finalJobTitle} in the ${finalIndustry} field
5. Accurately identify and assess demonstrated skills
6. Use PLAIN TEXT ONLY - no markdown, asterisks (*), hashtags (#), or special formatting characters
7. Structure content with clear paragraphs and natural language flow
`;

    const userContent = `
Task Description: ${finalTaskDescription}
Task Instructions: ${finalTaskInstructions || "No specific instructions provided."}

Intern's Submission:
${finalSubmissionText}
`;

    console.log("Calling OpenAI API for feedback generation");

    // Call OpenAI API using fetch
    try {
      const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent }
          ],
          temperature: 0.7,
          max_tokens: 1500,
          response_format: { type: "json_object" }
        })
      });

      if (!openAiResponse.ok) {
        const errorDetails = await openAiResponse.text();
        console.error("OpenAI API error:", errorDetails);
        throw new Error(`OpenAI API request failed: ${openAiResponse.status} - ${errorDetails}`);
      }

      const completion = await openAiResponse.json();
      const responseText = completion.choices[0]?.message?.content || "";

      console.log("Successfully received response from OpenAI");

      // Parse the response
      let feedbackText = "";
      let qualityRating = 0;
      let timelinessRating = 0;
      let collaborationRating = 0;
      let overallAssessment = "";
      let skillsData = {};
      let skillsAnalysis = {};

      try {
        // Parse the JSON response directly since we're enforcing JSON format
        const feedbackData = JSON.parse(responseText);
        feedbackText = feedbackData.feedback_text || "Unable to generate feedback at this time.";
        qualityRating = feedbackData.quality_rating || 0;
        timelinessRating = feedbackData.timeliness_rating || 0;
        collaborationRating = feedbackData.collaboration_rating || 0;
        overallAssessment = feedbackData.overall_assessment || "";
        
        // Process skills data
        if (feedbackData.skills_demonstrated && Array.isArray(feedbackData.skills_demonstrated)) {
          const skillsMap = {};
          const skillsAnalysisMap = {};
          
          for (const skill of feedbackData.skills_demonstrated) {
            // Find skill ID by name
            const skillRecord = availableSkills?.find(s => s.name === skill.skill_name);
            if (skillRecord) {
              skillsMap[skillRecord.id] = {
                xp_earned: Math.max(10, Math.min(25, skill.xp_earned || 15)),
                proficiency_score: Math.max(1, Math.min(10, skill.proficiency_score || 5))
              };
              
              skillsAnalysisMap[skillRecord.id] = {
                skill_name: skill.skill_name,
                evidence_quality: skill.evidence_quality || 'medium',
                specific_examples: skill.specific_examples || [],
                improvement_suggestions: skill.improvement_suggestions || []
              };
            }
          }
          
          skillsData = skillsMap;
          skillsAnalysis = skillsAnalysisMap;
        }
        
        console.log("Successfully parsed feedback data with skills:", {
          skillsCount: Object.keys(skillsData).length,
          totalXP: Object.values(skillsData).reduce((sum, skill) => {
            const typedSkill = skill as { xp_earned: number; proficiency_score: number };
            return sum + (typedSkill.xp_earned || 0);
          }, 0)
        });
      } catch (error) {
        console.error("Error parsing AI response:", error);
        console.error("Raw response:", responseText);
        feedbackText = responseText || "Unable to generate feedback at this time.";
      }

      // Save the feedback to the database using admin client to bypass RLS
      const { error: updateError } = await supabaseAdmin
        .from("internship_task_submissions")
        .update({
          feedback_provided_at: new Date().toISOString(),
          quality_rating: qualityRating,
          timeliness_rating: timelinessRating,
          collaboration_rating: collaborationRating,
          overall_assessment: overallAssessment,
          skills_earned: skillsData,
          skill_analysis: skillsAnalysis,
          status: "feedback_received"
        })
        .eq("id", submission_id);

      if (updateError) {
        console.error("Error updating submission with feedback:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to save feedback", details: updateError }),
          { 
            status: 500, 
            headers: { 
              "Content-Type": "application/json",
              ...corsHeaders 
            } 
          }
        );
      }

      // Update user skill progress for each demonstrated skill
      if (Object.keys(skillsData).length > 0) {
        console.log("Updating skill progress for user:", { userId: user_id, skills: Object.keys(skillsData) });
        
          for (const [skillId, skillProgress] of Object.entries(skillsData)) {
            try {
              const typedSkillProgress = skillProgress as { xp_earned: number; proficiency_score: number };
              const { error: skillUpdateError } = await supabaseAdmin.rpc('update_user_skill_progress', {
                p_user_id: user_id,
                p_skill_id: skillId,
                p_xp_gained: typedSkillProgress.xp_earned,
                p_submission_id: submission_id
              });

            if (skillUpdateError) {
              console.error("Error updating skill progress:", skillUpdateError);
            } else {
              console.log(`Updated skill ${skillId} with ${typedSkillProgress.xp_earned} XP`);
            }
          } catch (skillError) {
            console.error("Error in skill progress update:", skillError);
          }
        }
      }

      // Store the detailed feedback text in the internship_feedback_details table
      const { error: detailsError } = await supabaseAdmin
        .from("internship_feedback_details")
        .upsert({
          submission_id: submission_id,
          specific_comments: feedbackText,
          quality_score: qualityRating,
          timeliness_score: timelinessRating,
          collaboration_score: collaborationRating,
          overall_assessment: overallAssessment,
          generation_status: "completed",
          updated_at: new Date().toISOString()
        });

      if (detailsError) {
        console.error("Error saving detailed feedback:", detailsError);
        // Non-critical error, continue with the process
      }

      console.log(`Successfully saved feedback for submission ${submission_id}`);

      // Update the task status if needed
      try {
        const { error: taskUpdateError } = await supabaseAdmin
          .from("internship_tasks")
          .update({ status: "feedback_received" })
          .eq("id", task_id);
          
        if (taskUpdateError) {
          console.warn("Error updating task status:", taskUpdateError);
          // Non-critical error, continue
        }
      } catch (taskUpdateError) {
        console.warn("Error in task status update:", taskUpdateError);
        // Non-critical error, continue
      }

      // Return success response
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Feedback generated and saved successfully",
          data: {
            submission_id,
            task_id,
            feedback_provided_at: new Date().toISOString(),
            overall_assessment: overallAssessment
          }
        }),
        { 
          status: 200, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          } 
        }
      );
    } catch (openAiError) {
      console.error("OpenAI API error:", openAiError);
      
      return new Response(
        JSON.stringify({ 
          error: "Error generating feedback", 
          details: String(openAiError)
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
    console.error("Error in generate-internship-feedback function:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
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
