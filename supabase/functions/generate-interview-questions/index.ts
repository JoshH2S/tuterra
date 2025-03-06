
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const { industry, jobRole, jobDescription, sessionId } = await req.json();

    if (!industry || !jobRole || !jobDescription || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Connect to OpenAI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate interview questions with OpenAI
    const prompt = `
      You are an experienced interviewer for a ${industry} company.
      You need to create interview questions for a ${jobRole} position.
      
      Here is the job description:
      ${jobDescription}
      
      Create 7 thoughtful interview questions that will help assess the candidate's suitability for this role.
      Include a mix of behavioral, technical, and situational questions.
      Format each question as a complete sentence that an interviewer would ask directly.
      
      Return only the JSON in this format, with no other text or explanation:
      [
        {
          "question": "Question text here",
          "question_order": 0
        },
        ...
      ]
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that creates interview questions.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return new Response(
        JSON.stringify({ error: 'Failed to generate questions with AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const questionsContent = data.choices[0].message.content;
    let questions;
    
    try {
      // Parse the JSON from the AI response
      questions = JSON.parse(questionsContent);
    } catch (error) {
      console.error('Error parsing questions JSON:', error);
      console.log('Raw content:', questionsContent);
      
      // Fallback: try to extract JSON using regex
      const jsonMatch = questionsContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          questions = JSON.parse(jsonMatch[0]);
        } catch (innerError) {
          console.error('Failed to parse JSON with regex:', innerError);
          return new Response(
            JSON.stringify({ error: 'Failed to parse questions from AI response' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        return new Response(
          JSON.stringify({ error: 'Failed to parse questions from AI response' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Insert questions into the database
    const insertPromises = questions.map(async (q: any) => {
      const { data, error } = await supabase
        .from('interview_questions')
        .insert({
          session_id: sessionId,
          question: q.question,
          question_order: q.question_order
        })
        .select();
        
      if (error) {
        console.error('Error inserting question:', error);
        throw error;
      }
      
      return data[0];
    });
    
    const insertedQuestions = await Promise.all(insertPromises);

    return new Response(
      JSON.stringify({ 
        success: true, 
        questions: insertedQuestions 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-interview-questions function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
