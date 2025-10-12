import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
}

interface ReplyRequest {
  content: string;
}

interface ThreadMessage {
  id: string;
  content: string;
  sender_type: 'supervisor' | 'team' | 'intern';
  sender_name: string;
  sender_role?: string;
  sender_department?: string;
  sender_avatar_style?: string;
  sent_at: string;
  status: string;
  responses?: InternResponse[];
}

interface InternResponse {
  id: string;
  content: string;
  received_at: string;
  processed: boolean;
  processing_status: string;
  auto_response_generated: boolean;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    
    // Expected paths:
    // POST /api/internship/{sessionId}/messages/{messageId}/reply
    // GET /api/internship/{sessionId}/thread
    // PATCH /api/internship/{sessionId}/messages/{messageId}/read

    if (pathParts.length < 4) {
      throw new Error('Invalid path structure');
    }

    const sessionId = pathParts[3];
    
    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Verify user has access to this session
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabaseClient
      .from('internship_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      throw new Error('Session not found or unauthorized');
    }

    let result;

    if (req.method === 'POST' && pathParts[5] === 'reply') {
      // POST /api/internship/{sessionId}/messages/{messageId}/reply
      const messageId = pathParts[4];
      result = await handleReply(supabaseClient, sessionId, messageId, user.id, req);
      
    } else if (req.method === 'GET' && pathParts[4] === 'thread') {
      // GET /api/internship/{sessionId}/thread
      result = await handleGetThread(supabaseClient, sessionId, user.id);
      
    } else if (req.method === 'PATCH' && pathParts[6] === 'read') {
      // PATCH /api/internship/{sessionId}/messages/{messageId}/read
      const messageId = pathParts[4];
      result = await handleMarkAsRead(supabaseClient, messageId, user.id);
      
    } else {
      throw new Error('Invalid endpoint');
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: result.error ? 400 : 200
      }
    )

  } catch (error) {
    console.error('Internship messaging error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    )
  }
})

async function handleReply(
  supabaseClient: any, 
  sessionId: string, 
  messageId: string, 
  userId: string, 
  req: Request
): Promise<any> {
  try {
    const body: ReplyRequest = await req.json();
    
    // Validate content
    if (!body.content || body.content.trim().length === 0) {
      throw new Error('Reply content cannot be empty');
    }

    if (body.content.length > 2000) {
      throw new Error('Reply content too long (max 2000 characters)');
    }

    // Get the original message to determine reply context
    const { data: originalMessage, error: messageError } = await supabaseClient
      .from('internship_messages_v2')
      .select('*')
      .eq('id', messageId)
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .single();

    if (messageError || !originalMessage) {
      throw new Error('Original message not found');
    }

    // Check if user already replied to this message
    const { data: existingReply } = await supabaseClient
      .from('internship_responses')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .limit(1);

    if (existingReply && existingReply.length > 0) {
      throw new Error('You have already replied to this message');
    }

    // Insert the reply
    const { data: response, error: replyError } = await supabaseClient
      .from('internship_responses')
      .insert({
        message_id: messageId,
        session_id: sessionId,
        user_id: userId,
        content: body.content.trim(),
        reply_to_type: originalMessage.sender_type,
        reply_to_name: originalMessage.sender_name,
        processed: false,
        processing_status: 'pending'
      })
      .select()
      .single();

    if (replyError) {
      throw replyError;
    }

    // Trigger processing (this will be handled by a background worker)
    await triggerResponseProcessing(supabaseClient, response.id);

    return {
      success: true,
      response_id: response.id,
      message: 'Reply submitted successfully'
    };

  } catch (error) {
    console.error('Error handling reply:', error);
    return { error: error.message };
  }
}

async function handleGetThread(
  supabaseClient: any, 
  sessionId: string, 
  userId: string
): Promise<any> {
  try {
    // Get all messages for this session
    const { data: messages, error: messagesError } = await supabaseClient
      .from('internship_messages_v2')
      .select(`
        id,
        content,
        subject,
        sender_type,
        sender_name,
        sender_role,
        sender_department,
        sender_avatar_style,
        sent_at,
        status,
        context_data
      `)
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .order('sent_at', { ascending: true });

    if (messagesError) {
      throw messagesError;
    }

    // Get all responses for these messages
    const messageIds = messages.map(m => m.id);
    const { data: responses, error: responsesError } = await supabaseClient
      .from('internship_responses')
      .select(`
        id,
        message_id,
        content,
        received_at,
        processed,
        processing_status,
        auto_response_generated
      `)
      .in('message_id', messageIds)
      .order('received_at', { ascending: true });

    if (responsesError) {
      throw responsesError;
    }

    // Group responses by message_id
    const responsesByMessage = responses.reduce((acc, response) => {
      if (!acc[response.message_id]) {
        acc[response.message_id] = [];
      }
      acc[response.message_id].push(response);
      return acc;
    }, {});

    // Combine messages with their responses
    const thread: ThreadMessage[] = messages.map(message => ({
      ...message,
      responses: responsesByMessage[message.id] || []
    }));

    return {
      success: true,
      thread,
      total_messages: messages.length,
      total_responses: responses.length
    };

  } catch (error) {
    console.error('Error getting thread:', error);
    return { error: error.message };
  }
}

async function handleMarkAsRead(
  supabaseClient: any, 
  messageId: string, 
  userId: string
): Promise<any> {
  try {
    const { error } = await supabaseClient
      .from('internship_messages_v2')
      .update({ status: 'read' })
      .eq('id', messageId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: 'Message marked as read'
    };

  } catch (error) {
    console.error('Error marking message as read:', error);
    return { error: error.message };
  }
}

async function triggerResponseProcessing(supabaseClient: any, responseId: string): Promise<void> {
  try {
    // This could trigger a background worker or call another edge function
    // For now, we'll call the response processor directly
    await supabaseClient.functions.invoke('process-internship-responses', {
      body: { response_id: responseId }
    });
  } catch (error) {
    console.error('Error triggering response processing:', error);
    // Don't throw - the reply was saved successfully
  }
} 