
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const openAIApiKey = Deno.env.get('OPENAI_API_KEY') ?? '';

interface FeedbackResponse {
  manager_feedback: string;
  strengths: string[];
  improvements: string[];
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { task_id, deliverable_id, submission, job_title, industry } = await req.json();

    // Input validation
    if (!task_id || !deliverable_id || !submission) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Idempotency check - see if feedback already exists for this deliverable
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
        JSON.stringify({ 
          success: true, 
          feedback: {
            manager_feedback: existingFeedback.feedback,
            strengths: existingFeedback.strengths,
            improvements: existingFeedback.improvements
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Fetch task details
    const { data: task, error: taskError } = await supabase
      .from('internship_tasks')
      .select('title, description, instructions')
      .eq('id', task_id)
      .single();

    if (taskError || !task) {
      return new Response(
        JSON.stringify({ error: 'Task not found', details: taskError }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Call GPT-4o with OpenAI API
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const messages = [
      {
        role: "system",
        content: `
You are a professional internship manager at a mid-sized company. Your job is to review submitted work from interns and provide helpful, personalized, and encouraging feedback.

The feedback should include:
- A short message from the manager (1 paragraph)
- 1–2 specific strengths
- 1 area for improvement

Be specific and base your analysis on the actual submission. Do not use generic praise.

Always return the response in JSON format with the following keys:
{
  "manager_feedback": string,
  "strengths": string[],
  "improvements": string[]
}
`.trim()
      },
      {
        role: "user",
        content: `
Job Title: ${job_title}
Industry: ${industry}

Task Title: ${task.title}
Task Description: ${task.description}
Task Instructions: ${task.instructions}

Submission:
${submission}
`.trim()
      }
    ];

    console.log('Sending request to OpenAI...');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to generate feedback from OpenAI', details: errorData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Parse GPT response
    const openAIData = await openAIResponse.json();
    let feedbackJson: FeedbackResponse;
    
    try {
      const content = openAIData.choices[0].message.content;
      // Try to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || content.match(/{[\s\S]*}/);
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
      
      feedbackJson = JSON.parse(jsonString);
      
      // Validate the JSON structure
      if (!feedbackJson.manager_feedback || !Array.isArray(feedbackJson.strengths) || !Array.isArray(feedbackJson.improvements)) {
        throw new Error('Invalid JSON structure returned from OpenAI');
      }
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.error('OpenAI raw response:', openAIData?.choices?.[0]?.message?.content);
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse feedback from OpenAI', 
          details: error.message,
          raw_content: openAIData?.choices?.[0]?.message?.content 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 4: Store in internship_feedback
    const { data: insertedFeedback, error: insertError } = await supabase
      .from('internship_feedback')
      .insert({
        deliverable_id,
        feedback: feedbackJson.manager_feedback,
        strengths: feedbackJson.strengths,
        improvements: feedbackJson.improvements
      })
      .select()
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: 'Failed to store feedback', details: insertError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update task status to 'feedback_given'
    const { error: updateError } = await supabase
      .from('internship_tasks')
      .update({ status: 'feedback_given' })
      .eq('id', task_id);
      
    if (updateError) {
      console.error('Error updating task status:', updateError);
      // Continue with the process but log the error
    }

    // Step 5: Return to frontend
    return new Response(
      JSON.stringify({ 
        success: true, 
        feedback: {
          manager_feedback: feedbackJson.manager_feedback,
          strengths: feedbackJson.strengths,
          improvements: feedbackJson.improvements
        }
      }),
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
