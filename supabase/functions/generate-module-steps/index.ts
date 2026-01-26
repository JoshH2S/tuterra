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
1. TEACH step - Introduction and key concepts (concise, 2-3 paragraphs max)
2. PROMPT step - Interactive question to check understanding
3. TEACH step - Deeper exploration of the topic
4. QUIZ step - 3 multiple choice questions
5. PROMPT step - Scenario-based application question
6. CHECKPOINT step - ${checkpointType === 'quiz' ? '5 assessment questions' : 'Written reflection prompt'}

Generate JSON with this structure:
{
  "steps": [
    {
      "step_index": 0,
      "step_type": "teach",
      "title": "Step title",
      "content": {
        "text": "Teaching content here...",
        "keyPoints": ["Key point 1", "Key point 2"]
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
      "title": "Going Deeper",
      "content": {
        "text": "More detailed content...",
        "keyPoints": ["Key point 1", "Key point 2"]
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

Guidelines:
- Keep teaching content concise and engaging
- Questions should require active thinking
- Checkpoint should assess key module concepts
- Content appropriate for ${course.level} level
- No job guarantees or certification language`;

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
            content: 'You are an expert instructional designer. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
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

    // Parse the generated content
    let stepsData;
    try {
      const cleanedContent = generatedContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      stepsData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse generated steps:', parseError);
      return new Response(
        JSON.stringify({ error: 'Failed to parse generated content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
