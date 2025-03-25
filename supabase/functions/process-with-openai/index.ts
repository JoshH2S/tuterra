
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, temperature = 0.7, max_tokens = 800 } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'No prompt provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Sending request to OpenAI API with prompt:", prompt.substring(0, 100) + "...");

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful educational assistant that provides clear, concise explanations about quiz answers. Focus on explaining why answers are correct or incorrect in a supportive, encouraging tone. Use simple language and provide relevant examples or facts when appropriate. Keep explanations to 3-4 sentences for mobile readability.'
          },
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens,
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(errorData.error?.message || 'Unknown error from OpenAI API');
    }

    const data = await openaiResponse.json();
    const response = data.choices?.[0]?.message?.content?.trim() || '';
    
    console.log("OpenAI API response:", response.substring(0, 100) + "...");

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing prompt:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        fallbackResponse: "I couldn't generate a detailed explanation. This answer is based on the course materials covered in this section."
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
