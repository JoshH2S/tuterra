import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MarkStepCompleteRequest {
  step_id: string;
  course_id: string;
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
    const userId = claimsData.user.id;

    const { step_id, course_id }: MarkStepCompleteRequest = await req.json();

    if (!step_id || !course_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: step_id, course_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch step details to get module info
    const { data: step, error: stepError } = await supabase
      .from('module_steps')
      .select('*, course_modules!inner(*)')
      .eq('id', step_id)
      .single();

    if (stepError || !step) {
      return new Response(
        JSON.stringify({ error: 'Step not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const module = step.course_modules;

    // Mark step as completed
    const { error: updateError } = await supabase
      .from('module_steps')
      .update({ 
        is_completed: true, 
        completed_at: new Date().toISOString() 
      })
      .eq('id', step_id);

    if (updateError) {
      console.error('Error marking step complete:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to mark step complete' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update progress tracking
    const { data: allSteps } = await supabase
      .from('module_steps')
      .select('id, is_completed, step_type')
      .eq('module_id', module.id);

    const completedSteps = allSteps?.filter(s => s.is_completed).length || 0;
    const totalSteps = allSteps?.length || 0;
    const completedCheckpoints = allSteps?.filter(s => s.is_completed && s.step_type === 'checkpoint').length || 0;

    // Update course progress
    await supabase
      .from('course_progress')
      .update({
        current_step_id: step_id,
        total_steps_completed: completedSteps,
        total_checkpoints_passed: completedCheckpoints,
        last_activity_at: new Date().toISOString()
      })
      .eq('course_id', course_id)
      .eq('user_id', userId);

    // Check if module is complete
    if (completedSteps === totalSteps) {
      await supabase
        .from('course_modules')
        .update({ 
          is_completed: true, 
          completed_at: new Date().toISOString() 
        })
        .eq('id', module.id);
    }

    // Find next step
    const { data: nextStep } = await supabase
      .from('module_steps')
      .select('id')
      .eq('module_id', module.id)
      .gt('step_index', step.step_index)
      .order('step_index', { ascending: true })
      .limit(1)
      .maybeSingle();

    return new Response(
      JSON.stringify({
        success: true,
        next_step_id: nextStep?.id || null,
        completed_steps: completedSteps,
        total_steps: totalSteps
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





