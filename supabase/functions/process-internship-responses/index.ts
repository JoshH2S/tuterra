import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResponseProcessingRequest {
  response_id?: string;
  batch_process?: boolean;
}

const ESCALATION_KEYWORDS = [
  'stuck', 'help', 'confused', 'urgent', 'problem', 'issue', 'error', 
  'can\'t', 'cannot', 'unable', 'difficulty', 'struggling', 'lost'
];

const QUESTION_PATTERNS = [
  /\?/,
  /how do i/i,
  /what should/i,
  /can you/i,
  /could you/i,
  /would you/i,
  /when should/i,
  /where can/i
];

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let body: ResponseProcessingRequest = {};
    try {
      body = await req.json();
    } catch {
      // If no body, process batch
      body = { batch_process: true };
    }

    let result;

    if (body.response_id) {
      // Process specific response
      result = await processResponse(supabaseClient, body.response_id);
    } else {
      // Process batch of unprocessed responses
      result = await processBatchResponses(supabaseClient);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Response processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

async function processBatchResponses(supabaseClient: any): Promise<any> {
  try {
    // Get unprocessed responses
    const { data: responses, error } = await supabaseClient
      .from('internship_responses')
      .select('*')
      .eq('processed', false)
      .eq('processing_status', 'pending')
      .order('received_at', { ascending: true })
      .limit(10); // Process in batches

    if (error) throw error;

    const processedResponses = [];
    const failedResponses = [];

    for (const response of responses || []) {
      try {
        const result = await processResponse(supabaseClient, response.id);
        if (result.success) {
          processedResponses.push(response.id);
        } else {
          failedResponses.push({ id: response.id, error: result.error });
        }
      } catch (error) {
        console.error(`Error processing response ${response.id}:`, error);
        failedResponses.push({ id: response.id, error: error.message });
      }
    }

    return {
      success: true,
      processed_count: processedResponses.length,
      failed_count: failedResponses.length,
      processed_responses: processedResponses,
      failed_responses: failedResponses
    };

  } catch (error) {
    console.error('Error in batch processing:', error);
    return { error: error.message };
  }
}

async function processResponse(supabaseClient: any, responseId: string): Promise<any> {
  try {
    // Get the response with related message info
    const { data: response, error: responseError } = await supabaseClient
      .from('internship_responses')
      .select(`
        *,
        internship_messages_v2!inner (
          id,
          session_id,
          user_id,
          sender_type,
          sender_name,
          sender_role,
          content as original_content
        )
      `)
      .eq('id', responseId)
      .single();

    if (responseError || !response) {
      throw new Error('Response not found');
    }

    const originalMessage = response.internship_messages_v2;
    const analysis = analyzeResponse(response.content);

    let autoResponseGenerated = false;
    let escalationReason = null;

    // Determine action based on analysis
    if (analysis.needsEscalation) {
      // Mark for human escalation
      escalationReason = analysis.escalationReason;
      await markForEscalation(supabaseClient, response, escalationReason);
      
    } else if (analysis.isQuestion || analysis.needsFollowup) {
      // Generate automatic response
      const autoResponse = await generateAutoResponse(
        supabaseClient, 
        response, 
        originalMessage, 
        analysis
      );
      
      if (autoResponse.success) {
        autoResponseGenerated = true;
      }
    }

    // Mark response as processed
    const { error: updateError } = await supabaseClient
      .from('internship_responses')
      .update({
        processed: true,
        processing_status: analysis.needsEscalation ? 'escalated' : 'processed',
        auto_response_generated: autoResponseGenerated,
        escalation_reason: escalationReason
      })
      .eq('id', responseId);

    if (updateError) {
      throw updateError;
    }

    return {
      success: true,
      response_id: responseId,
      action_taken: analysis.needsEscalation ? 'escalated' : 
                   autoResponseGenerated ? 'auto_response' : 'processed',
      escalation_reason: escalationReason
    };

  } catch (error) {
    console.error('Error processing response:', error);
    
    // Mark as failed
    await supabaseClient
      .from('internship_responses')
      .update({
        processed: true,
        processing_status: 'failed'
      })
      .eq('id', responseId);

    return { error: error.message };
  }
}

function analyzeResponse(content: string): any {
  const lowerContent = content.toLowerCase();
  
  // Check for escalation keywords
  const hasEscalationKeywords = ESCALATION_KEYWORDS.some(keyword => 
    lowerContent.includes(keyword)
  );

  // Check for questions
  const hasQuestions = QUESTION_PATTERNS.some(pattern => 
    pattern.test(content)
  );

  // Check content length and complexity
  const isLongResponse = content.length > 200;
  const hasMultipleSentences = content.split(/[.!?]+/).length > 2;

  let needsEscalation = false;
  let escalationReason = null;

  if (hasEscalationKeywords) {
    needsEscalation = true;
    escalationReason = 'Contains keywords indicating intern needs help';
  } else if (isLongResponse && hasMultipleSentences) {
    needsEscalation = true;
    escalationReason = 'Complex response that may need human attention';
  }

  return {
    needsEscalation,
    escalationReason,
    isQuestion: hasQuestions,
    needsFollowup: hasQuestions || content.length > 50,
    sentiment: hasEscalationKeywords ? 'negative' : 'neutral',
    complexity: isLongResponse ? 'high' : 'low'
  };
}

async function markForEscalation(
  supabaseClient: any, 
  response: any, 
  reason: string
): Promise<void> {
  try {
    // Create escalation record (you might have a separate table for this)
    console.log(`Escalating response ${response.id}: ${reason}`);
    
    // Could insert into an escalations table, send email to coordinator, etc.
    // For now, just log it
    
  } catch (error) {
    console.error('Error marking for escalation:', error);
  }
}

async function generateAutoResponse(
  supabaseClient: any,
  response: any,
  originalMessage: any,
  analysis: any
): Promise<any> {
  try {
    // Get context about the intern and session
    const { data: sessionInfo } = await supabaseClient
      .from('internship_sessions')
      .select('job_title, industry, company_name')
      .eq('id', originalMessage.session_id)
      .single();

    const { data: userInfo } = await supabaseClient
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', originalMessage.user_id)
      .single();

    // Generate appropriate response based on original sender type
    let responseTemplate = '';
    let senderPersona = {};

    if (originalMessage.sender_type === 'team') {
      // Team member follow-up
      responseTemplate = generateTeamMemberFollowupTemplate(analysis, response.content);
      senderPersona = {
        name: originalMessage.sender_name,
        role: originalMessage.sender_role,
        department: 'Team',
        avatar_style: 'professional'
      };
    } else {
      // Supervisor follow-up
      responseTemplate = generateSupervisorFollowupTemplate(analysis, response.content);
      senderPersona = {
        name: 'Sarah Mitchell',
        role: 'Internship Coordinator',
        department: 'Human Resources',
        avatar_style: 'professional'
      };
    }

    // Use AI to generate the response
    const autoResponseContent = await generateAIResponse(responseTemplate, {
      intern_name: userInfo?.first_name || 'there',
      original_message: originalMessage.original_content,
      intern_reply: response.content,
      job_title: sessionInfo?.job_title || 'intern',
      company_name: sessionInfo?.company_name || 'the company'
    });

    // Insert auto-response as a new message
    const { data: newMessage, error: insertError } = await supabaseClient
      .from('internship_messages_v2')
      .insert({
        session_id: originalMessage.session_id,
        user_id: originalMessage.user_id,
        sender_type: originalMessage.sender_type,
        content: autoResponseContent,
        subject: `Re: ${originalMessage.subject || 'Your message'}`,
        sender_name: senderPersona.name,
        sender_role: senderPersona.role,
        sender_department: senderPersona.department,
        sender_avatar_style: senderPersona.avatar_style,
        status: 'sent',
        context_data: {
          auto_generated: true,
          reply_to_response: response.id,
          original_message_id: originalMessage.id
        }
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return {
      success: true,
      message_id: newMessage.id,
      content: autoResponseContent
    };

  } catch (error) {
    console.error('Error generating auto response:', error);
    return { error: error.message };
  }
}

function generateTeamMemberFollowupTemplate(analysis: any, responseContent: string): string {
  if (analysis.isQuestion) {
    return `Hi {intern_name}! Thanks for your question about my previous message. Let me help clarify that for you. Based on your reply: "{intern_reply}", I can provide some additional guidance...`;
  } else {
    return `Hi {intern_name}! I saw your response to my message. It's great to hear from you! Let me follow up on what you mentioned...`;
  }
}

function generateSupervisorFollowupTemplate(analysis: any, responseContent: string): string {
  if (analysis.isQuestion) {
    return `Hi {intern_name}, I appreciate you reaching out with your question. Let me provide some additional clarity on this topic...`;
  } else {
    return `Hi {intern_name}, thanks for your thoughtful response. I wanted to follow up on your message and provide some additional support...`;
  }
}

async function generateAIResponse(template: string, variables: Record<string, any>): Promise<string> {
  try {
    // Replace template variables
    let prompt = template;
    for (const [key, value] of Object.entries(variables)) {
      prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), String(value));
    }

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are responding to an intern\'s message in a workplace setting. Be helpful, professional, and encouraging. Keep responses concise but informative.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    const result = await openAIResponse.json();
    
    if (!result.choices || !result.choices[0]) {
      throw new Error('Failed to generate response from OpenAI');
    }

    return result.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // Fallback response
    return `Thank you for your message! I appreciate you taking the time to respond. Let me know if you have any other questions.`;
  }
} 