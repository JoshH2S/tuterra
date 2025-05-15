
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
    const { task_id, deliverable_id, submission, job_title, industry } = await req.json();

    if (!task_id || !deliverable_id || !submission) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if feedback already exists for this deliverable (idempotency check)
    const { data: existingFeedback, error: checkError } = await supabase
      .from('internship_feedback')
      .select('*')
      .eq('deliverable_id', deliverable_id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking for existing feedback:', checkError);
      return new Response(
        JSON.stringify({ error: 'Failed to check existing feedback', details: checkError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If feedback already exists, return it instead of generating new feedback
    if (existingFeedback) {
      console.log(`Feedback already exists for deliverable ${deliverable_id}, returning existing feedback`);
      return new Response(
        JSON.stringify({ success: true, feedback: existingFeedback }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get task details
    const { data: taskData, error: taskError } = await supabase
      .from('internship_tasks')
      .select('title, description, instructions')
      .eq('id', task_id)
      .single();

    if (taskError || !taskData) {
      return new Response(
        JSON.stringify({ error: 'Task not found', details: taskError }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the deliverable to verify it exists and contains valid content
    const { data: deliverableData, error: deliverableError } = await supabase
      .from('internship_deliverables')
      .select('content, user_id')
      .eq('id', deliverable_id)
      .single();

    if (deliverableError || !deliverableData) {
      return new Response(
        JSON.stringify({ error: 'Deliverable not found', details: deliverableError }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate feedback based on submission and task details
    const feedback = generateFeedback(submission, taskData, job_title, industry);

    // Validate feedback
    if (!feedback || typeof feedback.feedback !== 'string' || !feedback.feedback.trim()) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate valid feedback' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert feedback into internship_feedback table
    const { data: insertedFeedback, error: insertError } = await supabase
      .from('internship_feedback')
      .insert({
        deliverable_id,
        feedback: feedback.feedback,
        strengths: feedback.strengths,
        improvements: feedback.improvements
      })
      .select();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: 'Failed to insert feedback', details: insertError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update task status in a transaction-like manner
    const { data: taskBefore, error: getTaskError } = await supabase
      .from('internship_tasks')
      .select('status')
      .eq('id', task_id)
      .single();
      
    if (getTaskError) {
      console.error('Error getting task status:', getTaskError);
      // Continue with the process but log the error
    } else {
      // Only update if the status is not already 'feedback_given'
      if (!taskBefore || taskBefore.status !== 'feedback_given') {
        const { error: updateError } = await supabase
          .from('internship_tasks')
          .update({ status: 'feedback_given' })
          .eq('id', task_id);
          
        if (updateError) {
          console.error('Error updating task status:', updateError);
          // Continue with the process but log the error
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, feedback: insertedFeedback }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating feedback:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to generate feedback
function generateFeedback(submission: string, task: any, jobTitle: string, industry: string) {
  // For this demo, we'll use pre-defined feedback templates
  // In a production environment, this would call an LLM API like OpenAI
  
  const strengths = [
    "Clear and concise communication",
    "Good understanding of core concepts",
    "Thoughtful analysis"
  ];
  
  const improvements = [
    "Consider adding more specific examples",
    "Expand on the implementation details",
    "Include more industry-specific context"
  ];
  
  const feedbackTemplate = `
Great work on this submission! Here's my feedback as your virtual manager:

Your work on the ${task.title} task shows good understanding of the requirements and solid effort.

Your approach to ${task.description.toLowerCase()} demonstrates professional thinking appropriate for a ${jobTitle} role.

I particularly appreciate how you've addressed the main objectives of this task and shown initiative.

For future tasks, consider incorporating more specific ${industry}-related examples and metrics to strengthen your analysis.

Overall, this is solid work that would contribute value to our team in a real-world setting.

Keep up the good work!
`;

  return {
    feedback: feedbackTemplate.trim(),
    strengths,
    improvements
  };
}
