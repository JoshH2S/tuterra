
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const openAIApiKey = Deno.env.get('OPENAI_API_KEY') ?? '';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { job_title, industry, session_id } = await req.json();

    if (!job_title || !industry || !session_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if tasks already exist for this session (idempotency check)
    const { data: existingTasks, error: checkError } = await supabase
      .from('internship_tasks')
      .select('id')
      .eq('session_id', session_id)
      .limit(1);

    if (checkError) {
      console.error('Error checking existing tasks:', checkError);
      return new Response(
        JSON.stringify({ error: 'Failed to check existing tasks', details: checkError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If tasks already exist, return them instead of creating new ones
    if (existingTasks && existingTasks.length > 0) {
      console.log(`Tasks already exist for session ${session_id}, retrieving existing tasks`);
      const { data: tasks, error: fetchError } = await supabase
        .from('internship_tasks')
        .select('*')
        .eq('session_id', session_id)
        .order('task_order', { ascending: true });
      
      if (fetchError) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch existing tasks', details: fetchError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, tasks: tasks }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get session info to determine start date
    const { data: sessionData, error: sessionError } = await supabase
      .from('internship_sessions')
      .select('created_at')
      .eq('id', session_id)
      .single();

    if (sessionError || !sessionData) {
      return new Response(
        JSON.stringify({ error: 'Session not found', details: sessionError }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate tasks based on job_title and industry
    const tasks = await generateTasks(job_title, industry, sessionData.created_at, session_id);

    // Validate generated tasks
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate valid tasks' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Additional validation for required fields
    const validTasks = tasks.filter(task => 
      task.title && 
      task.description && 
      task.due_date && 
      task.session_id &&
      task.task_order
    );

    if (validTasks.length === 0) {
      return new Response(
        JSON.stringify({ error: 'All generated tasks failed validation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert tasks into internship_tasks table
    const { data: insertedTasks, error: insertError } = await supabase
      .from('internship_tasks')
      .insert(validTasks)
      .select();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: 'Failed to insert tasks', details: insertError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, tasks: insertedTasks }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating tasks:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to generate internship tasks
async function generateTasks(jobTitle: string, industry: string, startDate: string, sessionId: string) {
  const startDateObj = new Date(startDate);
  
  // Pre-defined task templates based on common internship activities
  const taskTemplates = [
    {
      title: `Orientation and Team Introduction`,
      description: `Meet your virtual team and familiarize yourself with our ${industry} projects.`,
      instructions: `Review the company structure, meet team members, and set up your virtual workspace.`,
      task_type: "onboarding",
      days_offset: 3
    },
    {
      title: `Research Industry Trends`,
      description: `Conduct research on current trends in the ${industry} industry.`,
      instructions: `Create a brief report highlighting key trends, challenges, and opportunities in the industry.`,
      task_type: "research",
      days_offset: 10
    },
    {
      title: `Project Planning`,
      description: `Develop a project plan for your main internship deliverable.`,
      instructions: `Create a timeline, identify resources needed, and outline key milestones.`,
      task_type: "planning",
      days_offset: 17
    },
    {
      title: `Mid-point Presentation`,
      description: `Present your progress and findings to the team.`,
      instructions: `Prepare a presentation on your work so far, challenges faced, and next steps.`,
      task_type: "presentation",
      days_offset: 30
    },
    {
      title: `Data Analysis and Insights`,
      description: `Analyze provided data and extract actionable insights.`,
      instructions: `Review the data set and provide at least 3 key insights relevant to our business.`,
      task_type: "analysis",
      days_offset: 40
    },
    {
      title: `Stakeholder Communication`,
      description: `Draft communications for various stakeholders about your project.`,
      instructions: `Create appropriate messaging for team members, management, and external partners.`,
      task_type: "communication",
      days_offset: 47
    },
    {
      title: `Final Project Submission`,
      description: `Complete and submit your internship project.`,
      instructions: `Finalize all deliverables and prepare final presentation and/or documentation.`,
      task_type: "deliverable",
      days_offset: 55
    }
  ];

  // Adjust task titles and descriptions based on job title
  let specializedTasks = taskTemplates.map((template, index) => {
    let title = template.title;
    let description = template.description;
    let instructions = template.instructions;

    // Customize based on job title
    if (jobTitle.toLowerCase().includes('data')) {
      if (template.task_type === "analysis") {
        title = "Data Visualization Dashboard";
        description = `Create a dashboard to visualize key metrics for our ${industry} business.`;
        instructions = "Use appropriate data visualization techniques to present insights clearly and effectively.";
      } else if (template.task_type === "research") {
        title = "Data Collection Methodology";
        description = "Design a methodology for collecting relevant data for our business.";
      }
    } else if (jobTitle.toLowerCase().includes('market')) {
      if (template.task_type === "analysis") {
        title = "Marketing Campaign Analysis";
        description = `Analyze the performance of our recent marketing campaigns in the ${industry} sector.`;
        instructions = "Review key performance indicators and suggest improvements for future campaigns.";
      } else if (template.task_type === "communication") {
        title = "Social Media Content Plan";
        description = "Develop a content plan for our social media channels.";
      }
    }

    // Calculate due date based on start date and days offset
    const dueDate = new Date(startDateObj);
    dueDate.setDate(dueDate.getDate() + template.days_offset);

    return {
      session_id: sessionId,
      title,
      description,
      instructions,
      due_date: dueDate.toISOString(),
      status: "not_started",
      task_type: template.task_type,
      task_order: index + 1
    };
  });

  return specializedTasks;
}
