import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateCourseRequest {
  topic: string;
  goal?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  pace_weeks: number;
  format_preferences?: {
    historyHeavy?: boolean;
    scenarioHeavy?: boolean;
    quizHeavy?: boolean;
    writingHeavy?: boolean;
  };
}

serve(async (req) => {
  // Handle CORS preflight
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Validate user
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    if (claimsError || !claimsData?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const userId = claimsData.user.id;

    // Parse request
    const { topic, goal, level, pace_weeks, format_preferences }: CreateCourseRequest = await req.json();

    if (!topic || !level || !pace_weeks) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: topic, level, pace_weeks' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating course for:', { topic, goal, level, pace_weeks, format_preferences });

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build format guidance
    const formatGuidance = [];
    if (format_preferences?.historyHeavy) formatGuidance.push('Include rich historical context and background information');
    if (format_preferences?.scenarioHeavy) formatGuidance.push('Use practical scenarios and case studies');
    if (format_preferences?.quizHeavy) formatGuidance.push('Emphasize frequent quizzes and knowledge checks');
    if (format_preferences?.writingHeavy) formatGuidance.push('Include more written reflection and essay prompts');

    // Generate course outline with OpenAI
    const prompt = `You are an expert curriculum designer. Create a comprehensive course outline for the following:

Topic: ${topic}
${goal ? `Learning Goal: ${goal}` : ''}
Level: ${level}
Duration: ${pace_weeks} weeks (${pace_weeks} modules)
${formatGuidance.length > 0 ? `Format Preferences: ${formatGuidance.join('; ')}` : ''}

Generate a JSON response with the following structure:
{
  "title": "Engaging course title",
  "description": "2-3 sentence course description",
  "learning_objectives": [
    { "id": "obj1", "text": "By the end of this course, learners will be able to..." },
    { "id": "obj2", "text": "..." }
    // 5-8 learning objectives
  ],
  "context_summary": "Brief summary of the course topic for AI evaluation context (2-3 sentences)",
  "modules": [
    {
      "module_index": 0,
      "title": "Module 1: Introduction to...",
      "summary": "Brief module description",
      "estimated_minutes": 30,
      "checkpoints_schema": {
        "type": "quiz",
        "questionCount": 5,
        "passingScore": 70
      }
    }
    // One module per week
  ]
}

Guidelines:
- Create exactly ${pace_weeks} modules (one per week)
- Each module should build on the previous
- Learning objectives should be measurable and specific
- Mix checkpoint types: "quiz" (multiple choice), "written" (short response), or "mixed"
- Estimated time should be 25-45 minutes per module
- Keep content appropriate for ${level} level learners
- Do NOT include job guarantees or certification language`;

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
            content: 'You are an expert curriculum designer. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate course content' }),
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
    let courseData;
    try {
      // Clean up potential markdown code blocks
      const cleanedContent = generatedContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      courseData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse generated content:', parseError, generatedContent);
      return new Response(
        JSON.stringify({ error: 'Failed to parse generated content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generated course data:', courseData);

    // Create the course record
    const { data: course, error: courseError } = await supabase
      .from('generated_courses')
      .insert({
        user_id: userId,
        topic,
        goal,
        title: courseData.title,
        description: courseData.description,
        level,
        pace_weeks,
        format_preferences: format_preferences || {},
        learning_objectives: courseData.learning_objectives || [],
        context_summary: courseData.context_summary,
        status: 'active'
      })
      .select()
      .single();

    if (courseError) {
      console.error('Error creating course:', courseError);
      return new Response(
        JSON.stringify({ error: 'Failed to save course', details: courseError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Created course:', course.id);

    // Create module records
    const modulesToInsert = courseData.modules.map((module: any) => ({
      course_id: course.id,
      module_index: module.module_index,
      title: module.title,
      summary: module.summary,
      estimated_minutes: module.estimated_minutes || 30,
      checkpoints_schema: module.checkpoints_schema || { type: 'quiz', questionCount: 5, passingScore: 70 }
    }));

    const { data: modules, error: modulesError } = await supabase
      .from('course_modules')
      .insert(modulesToInsert)
      .select()
      .order('module_index', { ascending: true });

    if (modulesError) {
      console.error('Error creating modules:', modulesError);
      // Cleanup the course if modules failed
      await supabase.from('generated_courses').delete().eq('id', course.id);
      return new Response(
        JSON.stringify({ error: 'Failed to save modules', details: modulesError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Created modules:', modules.length);

    // Create initial progress record
    const { error: progressError } = await supabase
      .from('course_progress')
      .insert({
        course_id: course.id,
        user_id: userId,
        current_module_id: modules[0]?.id,
        module_completion: {},
        total_steps_completed: 0,
        total_checkpoints_passed: 0
      });

    if (progressError) {
      console.error('Error creating progress:', progressError);
      // Non-fatal, progress will be created on first interaction
    }

    return new Response(
      JSON.stringify({
        success: true,
        course: {
          ...course,
          learning_objectives: courseData.learning_objectives
        },
        modules
      }),
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
