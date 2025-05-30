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

// Helper function for calculating task visibility dates
function calculateVisibleAfterDate(taskOrder: number, startDate: Date): Date {
  try {
    // Validate the startDate is a valid date
    if (!startDate || isNaN(startDate.getTime())) {
      console.warn("Invalid start date provided to calculateVisibleAfterDate, using current date");
      startDate = new Date(); // Fallback to current date
    }
    
    let visibleAfterDate = new Date(startDate);
    
    if (taskOrder > 2) {
      // Calculate weeks to delay (every 2 tasks = 1 week)
      const weeksDelay = Math.floor((taskOrder - 1) / 2);
      visibleAfterDate = new Date(startDate.getTime() + (weeksDelay * 7 * 24 * 60 * 60 * 1000));
    }
    
    return visibleAfterDate;
  } catch (error) {
    console.error("Error in calculateVisibleAfterDate:", error);
    return new Date(); // Fallback to current date
  }
}

// Add safe date parsing helper function after the imports
function safeParseDate(dateStr: string): Date {
  try {
    const parsed = new Date(dateStr);
    // Check if the date is valid
    if (isNaN(parsed.getTime())) {
      console.warn(`Invalid date string: ${dateStr}, using current date`);
      return new Date();
    }
    return parsed;
  } catch (e) {
    console.error(`Error parsing date: ${dateStr}`, e);
    return new Date(); // Fallback to current date
  }
}

// Helper function to call OpenAI with retry logic
async function callOpenAIWithRetry(prompt: string, maxRetries = 3): Promise<any> {
  let attempt = 0;
  let lastError;
  
  while (attempt < maxRetries) {
    try {
      console.log(`OpenAI API attempt ${attempt + 1}`);
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ 
            role: "user", 
            content: prompt + "\n\nIMPORTANT: Return ONLY valid JSON without any explanations, markdown formatting, or code blocks. The response should be a raw JSON object." 
          }],
          temperature: 0.7,
          response_format: { type: "json_object" }, // Force JSON response format
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenAI API error ${response.status}: ${errorText}`);
        throw new Error(`OpenAI API returned status ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        console.error("Invalid OpenAI response structure:", JSON.stringify(data));
        throw new Error("Invalid OpenAI response structure");
      }
      
      // Log a sample of the response to help debug
      const contentPreview = data.choices[0].message.content.substring(0, 200);
      console.log(`OpenAI API response preview: ${contentPreview}...`);
      
      return data;
    } catch (error) {
      lastError = error;
      attempt++;
      console.error(`OpenAI API attempt ${attempt} failed:`, error);
      
      // Exponential backoff
      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
  }
  
  throw lastError;
}

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

    // Validate required fields
    const errors: string[] = [];
    if (!job_title) errors.push("job_title is required");
    if (!industry) errors.push("industry is required");
    if (!job_description) errors.push("job_description is required");
    
    // Validate duration_weeks (must be a number between 1 and 12)
    if (!duration_weeks) {
      errors.push("duration_weeks is required");
    } else if (typeof duration_weeks !== 'number' || duration_weeks < 1 || duration_weeks > 12) {
      errors.push("duration_weeks must be a number between 1 and 12");
    }
    
    // Validate start_date (must be a valid date)
    if (!start_date) {
      errors.push("start_date is required");
    } else {
      try {
        const startDateObj = new Date(start_date);
        if (isNaN(startDateObj.getTime())) {
          errors.push("start_date must be a valid date");
        }
      } catch (e) {
        errors.push("start_date must be a valid date");
      }
    }
    
    if (errors.length > 0) {
      return new Response(JSON.stringify({ 
        error: "Invalid input",
        details: errors.join(", ")
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      });
    }

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

    // Generate company profile using the dedicated function
    try {
      console.log("Generating company profile for session", sessionData.id);
      
      // Call the company profile generation function
      const companyProfileResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-company-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
        },
        body: JSON.stringify({
          session_id: sessionData.id,
          job_title,
          industry
        })
      });
      
      if (!companyProfileResponse.ok) {
        console.error("Company profile generation failed:", await companyProfileResponse.text());
        // Continue execution - we don't want to fail the entire process if company profile generation fails
      } else {
        const companyProfileResult = await companyProfileResponse.json();
        console.log("Company profile generated successfully:", companyProfileResult.message);
      }
    } catch (companyProfileError) {
      console.error("Error generating company profile:", companyProfileError);
      // Continue execution - this is non-critical
    }

    // Generate internship content with OpenAI
    const prompt = `Generate a ${duration_weeks}-week virtual internship program for a ${job_title} in the ${industry} industry. 
    Job description: ${job_description}
    
    Include:
    - Weekly task titles and detailed descriptions
    - Simulated messages from a supervisor and team
    - Key calendar events (meetings, deadlines, milestones)
    
    Also create a comprehensive set of resources for the intern, including:
    
    1. Company Information:
       - Company name and background story
       - Mission, vision, and values
       - Organizational structure with key departments
       - Company culture and work environment
       - Recent achievements and milestones
    
    2. Onboarding Documents:
       - Welcome letter from CEO or team lead
       - Internship expectations and guidelines
       - Confidentiality agreement
       - Workplace policies (dress code, communication etiquette)
       - Getting started checklist
    
    3. Tools Glossary:
       - Industry-specific tools and technologies relevant to the ${job_title} role
       - Brief description and use case for each tool
       - Links to learning resources for these tools
    
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
        {"title": "Resource title", "type": "company_info|onboarding|tools|article|video|tutorial", "description": "Brief description of resource", "content": "Detailed content in markdown format", "link": "Optional external URL"}
      ],
      "company_details": {
        "name": "Company name",
        "industry": "${industry}",
        "description": "Company description",
        "mission": "Mission statement",
        "vision": "Vision statement",
        "values": ["Value 1", "Value 2", "Value 3"],
        "founded_year": "Year",
        "size": "Number of employees range"
      }
    }`;

    console.log("Sending request to OpenAI");
    
    // Use the new retry function
    let aiJson;
    try {
      aiJson = await callOpenAIWithRetry(prompt);
    } catch (openAiError) {
      console.error("OpenAI API failed after retries:", openAiError);
      return new Response(JSON.stringify({ 
        error: "Failed to generate internship content",
        details: String(openAiError)
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      });
    }

    // Parse the generated content with enhanced error handling
    try {
      let parsed;
      try {
        console.log("Attempting to parse OpenAI response as JSON");
        
        // Extract content and clean markdown formatting if present
        const content = aiJson.choices[0].message.content.trim();
        
        // Check if response is wrapped in markdown code blocks
        if (content.startsWith("```json") || content.startsWith("```")) {
          console.log("Detected markdown code block in response, cleaning");
          const cleanedContent = content
            .replace(/```json\n/g, '')
            .replace(/```\n/g, '')
            .replace(/```/g, '')
            .trim();
          parsed = JSON.parse(cleanedContent);
        } else {
          // Try parsing as is
          parsed = JSON.parse(content);
        }
      } catch (parseError) {
        console.error("Initial parsing failed:", parseError.message);
        console.log("Raw content preview:", aiJson.choices[0].message.content.substring(0, 200));
        
        // Try different extraction approaches
        const rawContent = aiJson.choices[0].message.content;
        
        // Approach 1: Try to extract JSON from markdown block
        try {
          const markdownMatch = rawContent.match(/```(?:json)?\n([\s\S]*?)```/);
          if (markdownMatch && markdownMatch[1]) {
            console.log("Found JSON in markdown code block");
            parsed = JSON.parse(markdownMatch[1].trim());
          }
        } catch (e) {
          console.error("Markdown extraction failed:", e.message);
        }
        
        // Approach 2: Look for JSON-like structure
        if (!parsed) {
          try {
            const jsonPattern = /\{[\s\S]*\}/;
            const match = rawContent.match(jsonPattern);
            
            if (match) {
              parsed = JSON.parse(match[0]);
              console.log("Recovered JSON using regex");
            }
          } catch (e) {
            console.error("Regex JSON extraction failed:", e.message);
          }
        }
        
        // Approach 3: Remove all non-JSON content
        if (!parsed) {
          try {
            // Aggressive cleaning - remove all markdown and extra text
            const cleanedContent = rawContent
              .replace(/```json/g, '')
              .replace(/```/g, '')
              .replace(/[\s\S]*?(\{[\s\S]*\})[\s\S]*/g, '$1')
              .trim();
            
            parsed = JSON.parse(cleanedContent);
            console.log("Recovered JSON after aggressive cleaning");
          } catch (e) {
            console.error("Aggressive cleaning failed:", e.message);
          }
        }
        
        // If all parsing attempts fail, create minimal structure
        if (!parsed) {
          console.log("All parsing attempts failed, creating minimal JSON structure");
          parsed = {
            tasks: [],
            messages: [],
            events: [],
            resources: [],
            company_details: {
              name: `${industry} Corporation`,
              industry: industry,
              description: `A leading company in the ${industry} industry.`,
              mission: "To deliver excellence in our field.",
              vision: "To become the industry leader in innovation and service.",
              values: ["Integrity", "Innovation", "Excellence"],
              founded_year: "2010",
              size: "100-500 employees"
            }
          };
        }
      }
      
      // Validate expected structure
      if (!parsed) {
        throw new Error("Empty parsed content");
      }
      
      // Normalize and validate data structure
      const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
      const messages = Array.isArray(parsed.messages) ? parsed.messages : [];
      const events = Array.isArray(parsed.events) ? parsed.events : [];
      const resources = Array.isArray(parsed.resources) ? parsed.resources : [];
      
      console.log(`Successfully parsed AI response with: ${tasks.length} tasks, ${messages.length} messages, ${events.length} events, ${resources.length} resources`);

      const sessionId = sessionData.id;
      const startDateObj = safeParseDate(start_date);

      // Validate and redistribute tasks if needed
      const validatedTasks = validateAndDistributeTasks(tasks, duration_weeks, start_date);

      // Insert tasks with improved error handling
      if (validatedTasks.length) {
        console.log(`Inserting ${validatedTasks.length} tasks`);
        
        // Sanitize task data
        const sanitizedTasks = validatedTasks.map((t: any, i: number) => {
          // Ensure all required fields have values
          const title = t.title || `Task ${i + 1}`;
          const description = t.description || "No description provided";
          
          // Validate and format dates
          let dueDate;
          try {
            dueDate = t.due_date ? new Date(t.due_date).toISOString() : null;
          } catch (e) {
            console.warn(`Invalid due date for task ${title}, using calculated date`);
            dueDate = null;
          }
          
          // If date is invalid, calculate a reasonable due date
          if (!dueDate) {
            const weekOffset = Math.floor(i / 2); // 2 tasks per week
            const calculatedDate = new Date(startDateObj);
            calculatedDate.setDate(calculatedDate.getDate() + (weekOffset * 7) + 5); // Add weeks + 5 days
            dueDate = calculatedDate.toISOString();
          }
          
          const taskOrder = t.task_order || i + 1;
          
          return {
            session_id: sessionId,
            title: title.substring(0, 255), // Ensure title fits in DB field
            description, 
            task_order: taskOrder,
            due_date: dueDate,
            status: 'not_started',
            visible_after: calculateVisibleAfterDate(taskOrder, startDateObj).toISOString()
          };
        });
        
        try {
          const { data: insertedTasks, error: tasksError } = await supabase
            .from("internship_tasks")
            .insert(sanitizedTasks)
            .select('id, title, due_date');
        
        if (tasksError) {
          console.error("Error inserting tasks:", tasksError);
            // Continue execution but log detailed error
            const errorDetails = {
              code: tasksError.code,
              message: tasksError.message,
              hint: tasksError.hint,
              details: tasksError.details
            };
            console.error("Detailed error:", JSON.stringify(errorDetails));
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
            const teamMemberMessages: any[] = [];
          
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
            const checkInMessages: any[] = [];
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
        } catch (taskInsertError) {
          console.error("Unexpected error during task insertion:", taskInsertError);
        }
      }

      // Insert AI-generated messages only if tasks weren't successfully inserted
      if (!tasks.length) {
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

      // Insert events with improved error handling
      if (events.length) {
        console.log(`Inserting ${events.length} events`);
        
        const sanitizedEvents = events.map((e: any) => {
          // Validate date format
          let eventDate;
          try {
            eventDate = e.date ? new Date(e.date).toISOString() : null;
          } catch (e) {
            // Generate fallback date in the middle of the internship
            const midpointMs = startDateObj.getTime() + (duration_weeks * 7 * 24 * 60 * 60 * 1000) / 2;
            eventDate = new Date(midpointMs).toISOString();
          }
          
          return {
            session_id: sessionId,
            title: e.title || "Untitled Event",
            type: ['meeting', 'deadline', 'milestone'].includes(e.type) ? e.type : 'meeting',
            date: eventDate
          };
        });
        
        const { error: eventsError } = await supabase
          .from("internship_events")
          .insert(sanitizedEvents);
        
        if (eventsError) {
          console.error("Error inserting events:", eventsError);
        }
      }

      // Insert resources with improved error handling
      if (resources.length) {
        console.log(`Inserting ${resources.length} resources`);
        
        const sanitizedResources = resources.map((r: any) => ({
            session_id: sessionId,
          title: r.title || "Untitled Resource",
          type: r.type || "article",
          description: r.description || "",
          content: r.content || "",
          link: r.link || ""
        }));
        
        const { error: resourcesError } = await supabase
          .from("internship_resources")
          .insert(sanitizedResources);
        
        if (resourcesError) {
          console.error("Error inserting resources:", resourcesError);
        }
      }

      // Insert company details if available with improved error handling
      if (parsed.company_details) {
        try {
          const companyDetails = parsed.company_details;
          
          const { error: companyError } = await supabase
            .from("internship_company_details")
            .insert({
              session_id: sessionId,
              name: companyDetails.name || `${industry} Corporation`,
              industry: companyDetails.industry || industry,
              description: companyDetails.description || `A leading company in the ${industry} industry.`,
              mission: companyDetails.mission || "To deliver excellence in our field.",
              vision: companyDetails.vision || "To become the industry leader in innovation and service.",
              values: Array.isArray(companyDetails.values) ? companyDetails.values : ["Integrity", "Innovation", "Excellence"],
              founded_year: companyDetails.founded_year || "2010",
              size: companyDetails.size || "100-500 employees"
            });
          
          if (companyError) {
            console.error("Error inserting company details:", companyError);
          }
        } catch (companyDetailsError) {
          console.error("Error processing company details:", companyDetailsError);
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
      
      // Create a minimal internship experience even if parsing failed
      try {
        const sessionId = sessionData.id;
        const startDateObj = safeParseDate(start_date);
        
        // Create generic tasks spanning the internship duration
        const genericTasks: any[] = [];
        const taskTemplates = [
          "Research and Analysis",
          "Project Planning",
          "Implementation Phase",
          "Testing and Validation",
          "Documentation",
          "Presentation Preparation",
          "Stakeholder Meeting",
          "Final Report"
        ];
        
        // Create 1-2 tasks per week
        const tasksPerWeek = Math.random() > 0.5 ? 2 : 1;
        const totalTasks = Math.min(taskTemplates.length, duration_weeks * tasksPerWeek);
        
        for (let i = 0; i < totalTasks; i++) {
          // Calculate due date (distribute evenly across the internship)
          const weekOffset = Math.floor(i / tasksPerWeek);
          const dueDate = new Date(startDateObj);
          dueDate.setDate(dueDate.getDate() + (weekOffset * 7) + 5); // End of each week
          
          genericTasks.push({
            session_id: sessionId,
            title: `${taskTemplates[i]} for ${job_title}`,
            description: `Complete the ${taskTemplates[i].toLowerCase()} task related to your role as a ${job_title} in the ${industry} industry.`,
            task_order: i + 1,
            due_date: dueDate.toISOString(),
            status: 'not_started',
            visible_after: calculateVisibleAfterDate(i + 1, startDateObj).toISOString()
          });
        }
        
        // Insert the generic tasks
        const { data: fallbackTasks, error: fallbackTasksError } = await supabase
          .from("internship_tasks")
          .insert(genericTasks)
          .select('id, title');
          
        if (fallbackTasksError) {
          console.error("Error inserting fallback tasks:", fallbackTasksError);
        } else {
          console.log(`Successfully inserted ${genericTasks.length} fallback tasks`);
          
          // Create basic welcome messages
          const welcomeMessages = [
            {
              session_id: sessionId,
              sender_name: "Jordan Miller",
              sender_avatar_url: null,
              subject: "Welcome to Your Virtual Internship",
              body: `Hello and welcome to your virtual internship as a ${job_title} in the ${industry} industry! I'm Jordan, your supervisor for this program. I'm excited to see what you'll accomplish during your time with us.`,
              timestamp: new Date().toISOString(),
              is_read: false,
              related_task_id: null
            }
          ];
          
          await supabase.from("internship_messages").insert(welcomeMessages);
        }
        
        return new Response(JSON.stringify({ 
          success: true, 
          sessionId,
          message: "Internship session created with fallback content due to parsing issues",
          warning: "Used fallback content generation due to AI parsing error"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } catch (fallbackError) {
        console.error("Error creating fallback content:", fallbackError);
      return new Response(JSON.stringify({ 
          error: "Failed to parse AI-generated content and fallback creation failed",
        details: String(parseError)
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      });
      }
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

// Helper function to validate and redistribute tasks evenly across weeks
function validateAndDistributeTasks(tasks: any[], durationWeeks: number, startDate: string): any[] {
  console.log("Validating task distribution...");
  
  if (!tasks.length) {
    console.log("No tasks to validate");
    return [];
  }
  
  // Calculate the ideal number of tasks (1-2 per week)
  const minTasks = durationWeeks;
  const maxTasks = durationWeeks * 2;
  
  // Ensure we have enough tasks (at least 1 per week)
  if (tasks.length < minTasks) {
    console.log(`Not enough tasks: ${tasks.length}. Generating additional tasks to meet minimum of ${minTasks}`);
    
    // Create additional generic tasks if necessary
    const genericTaskTemplates = [
      "Research on industry trends",
      "Create a project proposal",
      "Analyze competitor strategies",
      "Prepare a presentation",
      "Develop implementation plan",
      "Conduct user testing",
      "Write a summary report"
    ];
    
    const originalTaskCount = tasks.length;
    for (let i = 0; i < minTasks - originalTaskCount; i++) {
      const templateIndex = i % genericTaskTemplates.length;
      tasks.push({
        title: `${genericTaskTemplates[templateIndex]} - Part ${Math.floor(i / genericTaskTemplates.length) + 1}`,
        description: `Additional task to ensure balanced workload distribution throughout the internship.`,
        task_order: originalTaskCount + i + 1
      });
    }
  }
  
  // Limit the number of tasks if there are too many
  if (tasks.length > maxTasks) {
    console.log(`Too many tasks: ${tasks.length}. Limiting to ${maxTasks}`);
    tasks = tasks.slice(0, maxTasks);
  }
  
  // Calculate the start date and internship duration in milliseconds
  const startDateObj = safeParseDate(startDate);
  const internshipDurationMs = durationWeeks * 7 * 24 * 60 * 60 * 1000;
  const endDateObj = new Date(startDateObj.getTime() + internshipDurationMs);
  
  // Create buckets for weeks (1-indexed)
  const weekBuckets: { [key: number]: any[] } = {};
  for (let i = 1; i <= durationWeeks; i++) {
    weekBuckets[i] = [];
  }
  
  // Distribute tasks that already have due dates to their appropriate weeks
  const tasksWithDueDate = tasks.filter((t: any) => t.due_date);
  const tasksWithoutDueDate = tasks.filter((t: any) => !t.due_date);
  
  tasksWithDueDate.forEach((task: any) => {
    try {
      const taskDate = safeParseDate(task.due_date);
      
      // Skip tasks with invalid dates or outside the internship period
      if (taskDate < startDateObj || taskDate > endDateObj) {
        tasksWithoutDueDate.push({...task, due_date: undefined});
        return;
      }
      
      // Calculate which week this task belongs to
      const daysSinceStart = Math.floor((taskDate.getTime() - startDateObj.getTime()) / (24 * 60 * 60 * 1000));
      const weekNumber = Math.min(durationWeeks, Math.max(1, Math.ceil(daysSinceStart / 7)));
      
      weekBuckets[weekNumber].push(task);
    } catch (dateError) {
      console.warn("Invalid date format in task, treating as no due date:", dateError);
      tasksWithoutDueDate.push({...task, due_date: undefined});
    }
  });
  
  // Distribute remaining tasks evenly across weeks, prioritizing weeks with fewer tasks
  while (tasksWithoutDueDate.length > 0) {
    // Find the week with the fewest tasks
    let minTasksWeek = 1;
    for (let week = 1; week <= durationWeeks; week++) {
      if (weekBuckets[week].length < weekBuckets[minTasksWeek].length) {
        minTasksWeek = week;
      }
    }
    
    // If the week already has 2 tasks, find the next best week
    if (weekBuckets[minTasksWeek].length >= 2) {
      let nextBestWeek = 0;
      for (let week = 1; week <= durationWeeks; week++) {
        if (weekBuckets[week].length < 2) {
          nextBestWeek = week;
          break;
        }
      }
      
      // If all weeks have 2 tasks, use the original minTasksWeek
      minTasksWeek = nextBestWeek || minTasksWeek;
    }
    
    // Calculate a due date for this week (middle of the week)
    const weekStartMs = startDateObj.getTime() + (minTasksWeek - 1) * 7 * 24 * 60 * 60 * 1000;
    const dueDateMs = weekStartMs + (3.5 * 24 * 60 * 60 * 1000); // Middle of the week (Wednesday)
    const dueDate = new Date(dueDateMs);
    
    // Assign the task to this week with the calculated due date
    const task = tasksWithoutDueDate.shift();
    task.due_date = dueDate.toISOString();
    weekBuckets[minTasksWeek].push(task);
  }
  
  // Flatten the buckets back into a single array and ensure task_order is set
  const redistributedTasks = Object.values(weekBuckets)
    .flat()
    .map((task, index) => ({
      ...task,
      task_order: task.task_order || index + 1
    }));
  
  console.log(`Task validation complete. Final count: ${redistributedTasks.length} tasks`);
  
  return redistributedTasks;
}
