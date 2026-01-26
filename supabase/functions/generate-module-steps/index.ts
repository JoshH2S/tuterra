import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateStepsRequest {
  course_id: string;
  module_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    if (claimsError || !claimsData?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { course_id, module_id }: GenerateStepsRequest = await req.json();

    if (!course_id || !module_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: course_id, module_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if steps already exist for this module
    const { data: existingSteps } = await supabase
      .from('module_steps')
      .select('*')
      .eq('module_id', module_id)
      .order('step_index', { ascending: true });

    if (existingSteps && existingSteps.length > 0) {
      console.log('Steps already exist for module:', module_id);
      return new Response(
        JSON.stringify({ success: true, steps: existingSteps, cached: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch course and module details
    const { data: course, error: courseError } = await supabase
      .from('generated_courses')
      .select('*')
      .eq('id', course_id)
      .single();

    if (courseError || !course) {
      return new Response(
        JSON.stringify({ error: 'Course not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: module, error: moduleError } = await supabase
      .from('course_modules')
      .select('*')
      .eq('id', module_id)
      .single();

    if (moduleError || !module) {
      return new Response(
        JSON.stringify({ error: 'Module not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating steps for module:', module.title);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the prompt for step generation
    const checkpointType = module.checkpoints_schema?.type || 'quiz';
    
    const prompt = `You are an expert instructional designer. Create learning steps for a course module.

Course Topic: ${course.topic}
Course Level: ${course.level}
Course Context: ${course.context_summary || course.description}

Module: ${module.title}
Module Summary: ${module.summary}
Estimated Duration: ${module.estimated_minutes} minutes

Create 6 learning steps following this sequence:
1. TEACH step - Comprehensive introduction with 3-4 slides (each slide focuses on one concept)
2. PROMPT step - Interactive question to check understanding
3. TEACH step - Deeper exploration with 3-4 slides (advanced concepts, applications, examples)
4. QUIZ step - 3 multiple choice questions
5. PROMPT step - Scenario-based application question
6. CHECKPOINT step - ${checkpointType === 'quiz' ? '5 assessment questions' : 'Written reflection prompt'}

Generate JSON with this structure:
{
  "steps": [
    {
      "step_index": 0,
      "step_type": "teach",
      "title": "Introduction to [Topic]",
      "content": {
        "slides": [
          {
            "title": "Welcome & Overview",
            "content": "Engaging introduction that sets context and explains why this topic matters. Include a hook and real-world relevance. 80-120 words.",
            "keyPoints": [
              "Key concept 1 with clear explanation",
              "Important detail 2 with context",
              "Practical insight 3"
            ],
            "visualHint": "Suggest a diagram, chart, or visual that would help (e.g., 'A flowchart showing the process', 'Timeline of events')"
          },
          {
            "title": "Core Concept",
            "content": "Deep dive into the main concept with clear definitions and examples. 80-120 words.",
            "keyPoints": [
              "Fundamental principle 1",
              "Related concept 2",
              "Important distinction 3"
            ]
          },
          {
            "title": "Practical Examples",
            "content": "Real-world examples and practical applications with specific scenarios. 80-120 words.",
            "keyPoints": [
              "Example 1 with explanation",
              "Example 2 with context",
              "Common use case 3"
            ]
          },
          {
            "title": "Tips & Common Pitfalls",
            "content": "Expert insights, best practices, and common mistakes to avoid. 80-120 words.",
            "keyPoints": [
              "Best practice 1",
              "Common mistake to avoid 2",
              "Pro tip 3"
            ]
          }
        ]
      }
    },
    {
      "step_index": 1,
      "step_type": "prompt",
      "title": "Check Your Understanding",
      "content": {
        "question": "Interactive question...",
        "expectedResponse": "What a good answer would include...",
        "hints": ["Hint 1", "Hint 2"]
      }
    },
    {
      "step_index": 2,
      "step_type": "teach",
      "title": "Advanced Concepts",
      "content": {
        "slides": [
          {
            "title": "Building on Basics",
            "content": "Connect to previous learning and introduce advanced aspects. 80-120 words.",
            "keyPoints": [
              "Connection to previous concepts",
              "Advanced aspect 1",
              "Advanced aspect 2"
            ]
          },
          {
            "title": "Deep Dive",
            "content": "Explore nuances, edge cases, and sophisticated applications with technical depth. 80-120 words.",
            "keyPoints": [
              "Nuanced detail 1",
              "Edge case or exception 2",
              "Technical insight 3"
            ]
          },
          {
            "title": "Real-World Applications",
            "content": "Advanced real-world scenarios and professional applications. 80-120 words.",
            "keyPoints": [
              "Professional application 1",
              "Complex scenario 2",
              "Industry practice 3"
            ]
          },
          {
            "title": "Mastery & Next Steps",
            "content": "Summary of advanced concepts and pathways for continued growth. 80-120 words.",
            "keyPoints": [
              "Key mastery indicator 1",
              "Integration point 2",
              "Path for further learning 3"
            ]
          }
        ]
      }
    },
    {
      "step_index": 3,
      "step_type": "quiz",
      "title": "Knowledge Check",
      "content": {
        "questions": [
          {
            "id": "q1",
            "question": "Question text?",
            "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" },
            "correctAnswer": "A",
            "explanation": "Why A is correct...",
            "points": 1
          }
        ]
      }
    },
    {
      "step_index": 4,
      "step_type": "prompt",
      "title": "Apply Your Knowledge",
      "content": {
        "question": "Scenario-based question...",
        "expectedResponse": "What a good answer includes...",
        "hints": ["Think about...", "Consider..."]
      }
    },
    {
      "step_index": 5,
      "step_type": "checkpoint",
      "title": "Module Assessment",
      "content": {
        ${checkpointType === 'quiz' ? `
        "instructions": "Complete this assessment to finish the module.",
        "submissionType": "choice",
        "questions": [
          {
            "id": "cp1",
            "question": "Assessment question?",
            "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" },
            "correctAnswer": "B",
            "explanation": "Explanation...",
            "points": 2
          }
        ]` : `
        "instructions": "Reflect on what you've learned in this module.",
        "submissionType": "text",
        "reflectionPrompts": [
          "What was the most important concept you learned?",
          "How might you apply this knowledge?",
          "What questions do you still have?"
        ]`}
      },
      "rubric": [
        {
          "criterion": "Understanding",
          "weight": 40,
          "levels": {
            "excellent": "Demonstrates deep understanding",
            "good": "Shows solid comprehension",
            "satisfactory": "Basic understanding shown",
            "needsImprovement": "Needs more review"
          }
        },
        {
          "criterion": "Application",
          "weight": 30,
          "levels": {
            "excellent": "Excellent practical application",
            "good": "Good application of concepts",
            "satisfactory": "Some application shown",
            "needsImprovement": "Limited application"
          }
        },
        {
          "criterion": "Completeness",
          "weight": 30,
          "levels": {
            "excellent": "Thorough and complete",
            "good": "Mostly complete",
            "satisfactory": "Partially complete",
            "needsImprovement": "Incomplete"
          }
        }
      ]
    }
  ]
}

Guidelines for TEACH steps:
- Structure content as 4 SLIDES per teach step, each with a clear focus
- Each slide should have 80-120 words of content (concise but informative)
- Each slide should have 3 focused key points
- Build a logical progression: Overview → Core Concept → Examples → Tips
- For language courses: include pronunciation tips and cultural notes
- For technical courses: include code examples and practical applications
- Make content engaging and visual - think "presentation mode"
- Use descriptive slide titles that preview the content
- First teach step: Introduces foundations clearly
- Second teach step: Advances to applications and mastery

Guidelines for interactive elements:
- PROMPT questions should check understanding of taught material
- QUIZ questions should have clear correct answers with explanations
- CHECKPOINT should comprehensively assess key module concepts
- All content appropriate for ${course.level} level
- No job guarantees or certification language

IMPORTANT: The TEACH steps are the foundation of learning. They MUST be substantial enough that students can answer subsequent questions without external resources.`;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert instructional designer. Generate structured learning content following the provided schema.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3500,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "module_steps",
            strict: true,
            schema: {
              type: "object",
              properties: {
                steps: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      step_index: { type: "integer" },
                      step_type: { 
                        type: "string",
                        enum: ["teach", "prompt", "quiz", "checkpoint", "reflection"]
                      },
                      title: { type: "string" },
                      content: {
                        type: "object",
                        properties: {
                          slides: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                title: { type: "string" },
                                content: { type: "string" },
                                keyPoints: {
                                  type: "array",
                                  items: { type: "string" }
                                },
                                visualHint: { type: "string" }
                              },
                              required: ["title", "content", "keyPoints"],
                              additionalProperties: false
                            }
                          },
                          question: { type: "string" },
                          expectedResponse: { type: "string" },
                          hints: {
                            type: "array",
                            items: { type: "string" }
                          },
                          questions: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                id: { type: "string" },
                                question: { type: "string" },
                                options: {
                                  type: "object",
                                  properties: {
                                    A: { type: "string" },
                                    B: { type: "string" },
                                    C: { type: "string" },
                                    D: { type: "string" }
                                  },
                                  required: ["A", "B", "C", "D"],
                                  additionalProperties: false
                                },
                                correctAnswer: {
                                  type: "string",
                                  enum: ["A", "B", "C", "D"]
                                },
                                explanation: { type: "string" },
                                points: { type: "integer" }
                              },
                              required: ["id", "question", "options", "correctAnswer"],
                              additionalProperties: false
                            }
                          },
                          instructions: { type: "string" },
                          submissionType: {
                            type: "string",
                            enum: ["text", "choice", "file"]
                          },
                          reflectionPrompts: {
                            type: "array",
                            items: { type: "string" }
                          }
                        },
                        additionalProperties: false
                      },
                      rubric: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            criterion: { type: "string" },
                            weight: { type: "integer" },
                            levels: {
                              type: "object",
                              properties: {
                                excellent: { type: "string" },
                                good: { type: "string" },
                                satisfactory: { type: "string" },
                                needsImprovement: { type: "string" }
                              },
                              required: ["excellent", "good", "satisfactory", "needsImprovement"],
                              additionalProperties: false
                            }
                          },
                          required: ["criterion", "weight", "levels"],
                          additionalProperties: false
                        }
                      }
                    },
                    required: ["step_index", "step_type", "title", "content"],
                    additionalProperties: false
                  }
                }
              },
              required: ["steps"],
              additionalProperties: false
            }
          }
        }
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate steps' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIData = await openAIResponse.json();
    const generatedContent = openAIData.choices[0]?.message?.content;

    if (!generatedContent) {
      return new Response(
        JSON.stringify({ error: 'No content generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the generated content (no fence stripping needed with structured output)
    let stepsData;
    try {
      stepsData = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse generated steps:', parseError);
      return new Response(
        JSON.stringify({ error: 'Failed to parse generated content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate the structure
    if (!stepsData?.steps || !Array.isArray(stepsData.steps) || stepsData.steps.length !== 6) {
      console.error('Invalid steps structure:', stepsData);
      return new Response(
        JSON.stringify({ error: 'Generated content does not match expected structure' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize/validate generated steps to match UI + evaluator expectations:
    // - Ensure quiz step has exactly 3 questions (slice extras)
    // - Ensure checkpoint quiz uses configured questionCount (default 5)
    // - Ensure all question IDs are present + unique within the step
    try {
      const checkpointQuestionCount =
        (module.checkpoints_schema?.questionCount && Number(module.checkpoints_schema.questionCount)) || 5;

      if (stepsData?.steps && Array.isArray(stepsData.steps)) {
        stepsData.steps = stepsData.steps.map((s: any) => {
          if (!s?.content) return s;

          const isQuiz = s.step_type === 'quiz';
          const isCheckpointQuiz =
            s.step_type === 'checkpoint' && (module.checkpoints_schema?.type || 'quiz') === 'quiz';

          if ((isQuiz || isCheckpointQuiz) && Array.isArray(s.content.questions)) {
            // Enforce question count
            const expectedCount = isQuiz ? 3 : checkpointQuestionCount;
            if (s.content.questions.length > expectedCount) {
              s.content.questions = s.content.questions.slice(0, expectedCount);
            }

            // Ensure unique IDs
            const used = new Set<string>();
            s.content.questions = s.content.questions.map((q: any, idx: number) => {
              const baseId = typeof q?.id === 'string' && q.id.trim().length > 0
                ? q.id.trim()
                : `q${s.step_index}_${idx + 1}`;

              let id = baseId;
              let n = 2;
              while (used.has(id)) {
                id = `${baseId}_${n}`;
                n++;
              }
              used.add(id);

              return { ...q, id };
            });
          }

          return s;
        });
      }
    } catch (normalizeErr) {
      console.error('Failed to normalize generated steps:', normalizeErr);
      // Non-fatal; continue with best-effort content
    }

    // Insert steps into database
    const stepsToInsert = stepsData.steps.map((step: any) => ({
      module_id,
      step_index: step.step_index,
      step_type: step.step_type,
      title: step.title,
      content: step.content,
      rubric: step.rubric || null,
      is_completed: false
    }));

    const { data: insertedSteps, error: stepsError } = await supabase
      .from('module_steps')
      .insert(stepsToInsert)
      .select()
      .order('step_index', { ascending: true });

    if (stepsError) {
      console.error('Error inserting steps:', stepsError);
      
      // If duplicate key error, fetch existing steps instead
      if (stepsError.code === '23505' || stepsError.message.includes('duplicate key')) {
        console.log('Steps already exist (duplicate key), fetching existing steps...');
        const { data: existingSteps, error: fetchError } = await supabase
          .from('module_steps')
          .select('*')
          .eq('module_id', module_id)
          .order('step_index', { ascending: true });
        
        if (fetchError || !existingSteps || existingSteps.length === 0) {
          return new Response(
            JSON.stringify({ error: 'Failed to retrieve existing steps', details: fetchError?.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log('Returning existing steps:', existingSteps.length);
        return new Response(
          JSON.stringify({ success: true, steps: existingSteps, cached: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to save steps', details: stepsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Created steps:', insertedSteps.length);

    return new Response(
      JSON.stringify({ success: true, steps: insertedSteps, cached: false }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
