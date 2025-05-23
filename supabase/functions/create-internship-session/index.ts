
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openAiKey = Deno.env.get("OPENAI_KEY")!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204 
    });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth header" }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401 
      });
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Auth failed", details: userError?.message }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401 
      });
    }

    // Parse request body
    const { job_title, industry, job_description, duration_weeks, start_date } = await req.json();

    console.log(`Creating internship for user ${user.id}: ${job_title} in ${industry}`);

    // Insert into internship_sessions table
    const { data: sessionData, error: insertError } = await supabase
      .from("internship_sessions")
      .insert({
        user_id: user.id,
        job_title,
        industry,
        job_description,
        duration_weeks,
        start_date,
        current_phase: 1,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: insertError.message }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      });
    }

    // Generate internship content with OpenAI
    const prompt = `Generate a ${duration_weeks}-week virtual internship program for a ${job_title} in the ${industry} industry. 
    Job description: ${job_description}
    
    Include:
    - Weekly task titles and detailed descriptions
    - Simulated messages from a supervisor and team
    - Key calendar events (meetings, deadlines, milestones)
    - A list of 3–5 onboarding resources (articles, videos, tutorials)
    
    Return JSON with the following structure:
    {
      "tasks": [
        {"title": "Task title", "description": "Detailed description", "due_date": "YYYY-MM-DD", "task_order": 1},
        ...
      ],
      "messages": [
        {"sender": "Name (Role)", "subject": "Message subject", "content": "Message content", "sent_at": "YYYY-MM-DDTHH:MM:SSZ"},
        ...
      ],
      "events": [
        {"title": "Event title", "type": "meeting|deadline|milestone", "date": "YYYY-MM-DDTHH:MM:SSZ"},
        ...
      ],
      "resources": [
        {"title": "Resource title", "type": "article|video|tutorial", "link": "URL or description"},
        ...
      ]
    }`;

    console.log("Sending request to OpenAI");
    const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const aiJson = await openAiRes.json();
    
    if (!aiJson.choices || aiJson.choices.length === 0) {
      console.error("OpenAI error:", aiJson);
      return new Response(JSON.stringify({ 
        error: "Failed to generate internship content",
        details: aiJson.error?.message || "Unknown OpenAI error" 
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      });
    }

    // Parse the generated content
    try {
      const parsed = JSON.parse(aiJson.choices[0].message.content);
      console.log("Successfully parsed AI response");

      const { tasks, messages, events, resources } = parsed;
      const sessionId = sessionData.id;

      // Insert tasks
      if (tasks?.length) {
        console.log(`Inserting ${tasks.length} tasks`);
        const { error: tasksError } = await supabase.from("internship_tasks").insert(
          tasks.map((t: any, i: number) => ({
            session_id: sessionId,
            title: t.title,
            description: t.description,
            task_order: t.task_order || i + 1,
            due_date: t.due_date || new Date(new Date(start_date).getTime() + (i+1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'not_started'
          }))
        );
        
        if (tasksError) {
          console.error("Error inserting tasks:", tasksError);
        }
      }

      // Insert messages
      if (messages?.length) {
        console.log(`Inserting ${messages.length} messages`);
        const { error: messagesError } = await supabase.from("internship_messages").insert(
          messages.map((m: any) => ({
            session_id: sessionId,
            sender: m.sender,
            subject: m.subject,
            content: m.content,
            sent_at: m.sent_at || new Date().toISOString(),
          }))
        );
        
        if (messagesError) {
          console.error("Error inserting messages:", messagesError);
        }
      }

      // Insert events
      if (events?.length) {
        console.log(`Inserting ${events.length} events`);
        const { error: eventsError } = await supabase.from("internship_events").insert(
          events.map((e: any) => ({
            session_id: sessionId,
            title: e.title,
            type: e.type,
            date: e.date,
          }))
        );
        
        if (eventsError) {
          console.error("Error inserting events:", eventsError);
        }
      }

      // Insert resources
      if (resources?.length) {
        console.log(`Inserting ${resources.length} resources`);
        const { error: resourcesError } = await supabase.from("internship_resources").insert(
          resources.map((r: any) => ({
            session_id: sessionId,
            title: r.title,
            type: r.type,
            link: r.link,
          }))
        );
        
        if (resourcesError) {
          console.error("Error inserting resources:", resourcesError);
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        sessionId,
        message: "Internship session created successfully with AI-generated content"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      return new Response(JSON.stringify({ 
        error: "Failed to parse AI-generated content",
        details: String(parseError)
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      });
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ 
      error: "Unexpected error", 
      details: String(err) 
    }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500 
    });
  }
});
