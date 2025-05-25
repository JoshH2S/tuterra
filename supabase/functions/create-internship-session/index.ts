import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { format } from "date-fns";

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
        {"sender_name": "Name", "subject": "Message subject", "body": "Message content", "timestamp": "YYYY-MM-DDTHH:MM:SSZ", "related_task_id": null},
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
        const { data: insertedTasks, error: tasksError } = await supabase.from("internship_tasks").insert(
          tasks.map((t: any, i: number) => ({
            session_id: sessionId,
            title: t.title,
            description: t.description,
            task_order: t.task_order || i + 1,
            due_date: t.due_date || new Date(new Date(start_date).getTime() + (i+1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'not_started'
          }))
        ).select('id, title, due_date');
        
        if (tasksError) {
          console.error("Error inserting tasks:", tasksError);
        } else if (insertedTasks && insertedTasks.length > 0) {
          // Create structured messaging system
          console.log("Creating structured messaging system");
          
          // 1. Create supervisor task assignment messages (for each task)
          const supervisorTaskMessages = insertedTasks.map((task, index) => ({
            session_id: sessionId,
            sender_name: "Jordan Miller",
            sender_avatar_url: null,
            subject: `New Task Assignment: ${task.title}`,
            body: `Hi there,\n\nI've assigned you a new task: "${task.title}". Please review the task details and let me know if you have any questions. The deadline for this task is ${format(new Date(task.due_date), 'MMMM d, yyyy')}.\n\nLooking forward to your work on this!\n\nBest,\nJordan`,
            timestamp: new Date(new Date().getTime() - (Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(), // Random time within the last week
            is_read: false,
            related_task_id: task.id
          }));
          
          // 2. Create team member task-related messages (for 2-3 random tasks)
          const teamMemberNames = ["Maya Chen", "Alicia Rodriguez", "David Park", "Carlos Mendez", "Priya Sharma"];
          const teamMemberMessages = [];
          
          // Select 2-3 random tasks to get team member messages
          const numTeamMessages = Math.floor(Math.random() * 2) + 2; // 2-3 messages
          const taskIndices = new Set<number>();
          
          while (taskIndices.size < numTeamMessages && taskIndices.size < insertedTasks.length) {
            taskIndices.add(Math.floor(Math.random() * insertedTasks.length));
          }
          
          taskIndices.forEach(index => {
            const task = insertedTasks[index];
            const teamMember = teamMemberNames[Math.floor(Math.random() * teamMemberNames.length)];
            
            teamMemberMessages.push({
              session_id: sessionId,
              sender_name: teamMember,
              sender_avatar_url: null,
              subject: `RE: ${task.title} - Some resources that might help`,
              body: `Hi,\n\nI saw you're working on the "${task.title}" task. I thought these resources might be helpful for you:\n\n- I completed a similar task last month and found that starting with a clear outline really helps\n- Our team uses this template for this kind of work: [Link to template]\n- Feel free to reach out if you need any specific guidance!\n\nGood luck with the task!\n\n${teamMember}`,
              timestamp: new Date(new Date(task.due_date).getTime() - (2 * 24 * 60 * 60 * 1000)).toISOString(), // 2 days before due date
              is_read: false,
              related_task_id: task.id
            });
          });
          
          // 3. Create periodic check-in messages from supervisor (1-2 messages)
          const checkInMessages = [];
          const numCheckIns = Math.floor(Math.random() * 2) + 1; // 1-2 messages
          
          for (let i = 0; i < numCheckIns; i++) {
            checkInMessages.push({
              session_id: sessionId,
              sender_name: "Jordan Miller",
              sender_avatar_url: null,
              subject: `Weekly Check-in #${i + 1}`,
              body: `Hello,\n\nI hope your virtual internship is going well! I wanted to check in and see how you're progressing with your tasks.\n\nAre you facing any challenges that I can help with? Please let me know if you need any clarification or support with your current assignments.\n\nAlso, don't forget about our team meeting next week where you'll have a chance to present your progress.\n\nBest regards,\nJordan`,
              timestamp: new Date(new Date().getTime() - ((i + 1) * 5 * 24 * 60 * 60 * 1000)).toISOString(), // Every 5 days in the past
              is_read: false,
              related_task_id: null
            });
          }
          
          // Combine all messages and insert them
          const allMessages = [
            ...supervisorTaskMessages,
            ...teamMemberMessages,
            ...checkInMessages
          ];
          
          const { error: messageInsertError } = await supabase
            .from("internship_messages")
            .insert(allMessages);
            
          if (messageInsertError) {
            console.error("Error inserting structured messages:", messageInsertError);
          } else {
            console.log(`Successfully inserted ${allMessages.length} structured messages`);
          }
        }
      }

      // Insert AI-generated messages only if tasks weren't successfully inserted
      if (!tasks?.length) {
        // Create default welcome messages if none were generated
        const welcomeMessages = [
          {
            session_id: sessionId,
            sender_name: "Jordan Miller",
            sender_avatar_url: null,
            subject: "Welcome to Your Virtual Internship",
            body: `Hello and welcome to your virtual internship as a ${job_title} in the ${industry} industry! I'm Jordan, your supervisor for this program. I'm excited to see what you'll accomplish during your time with us. Please take some time to explore the dashboard and get familiar with the available resources. Don't hesitate to reach out if you have any questions!`,
            timestamp: new Date().toISOString(),
            is_read: false,
            related_task_id: null
          },
          {
            session_id: sessionId,
            sender_name: "Maya Chen",
            sender_avatar_url: null,
            subject: "Getting Started with Our Team",
            body: `Hi there! Welcome to the team. I'm Maya from the Marketing department. We're thrilled to have you join us virtually as a ${job_title}. I wanted to let you know that I'm available to help if you have any questions about our strategies or tools we use. Looking forward to seeing your contributions!`,
            timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            is_read: false,
            related_task_id: null
          },
          {
            session_id: sessionId,
            sender_name: "Alicia Rodriguez",
            sender_avatar_url: null,
            subject: "HR Onboarding Information",
            body: `Welcome to your virtual internship! As your HR contact, I'm here to ensure you have a smooth experience. If you have any questions about policies, schedules, or need any other assistance, please don't hesitate to reach out. We're excited to have you on board!`,
            timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            is_read: false,
            related_task_id: null
          }
        ];

        const { error: welcomeMessagesError } = await supabase
          .from("internship_messages")
          .insert(welcomeMessages);
          
        if (welcomeMessagesError) {
          console.error("Error inserting welcome messages:", welcomeMessagesError);
        } else {
          console.log("Inserted default welcome messages");
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
