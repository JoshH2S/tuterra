
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

// Function to clean markdown formatting
function cleanMarkdownFormatting(text: string): string {
  if (!text) return "";
  
  let cleanText = text;
  
  // Remove code block formatting
  cleanText = cleanText.replace(/```[\s\S]*?```/g, (match) => {
    return match.replace(/```[\w]*\n?|\n?```/g, "").trim();
  });
  
  // Remove blockquote markers
  cleanText = cleanText.replace(/^>\s+/gm, "");
  cleanText = cleanText.replace(/^>\s*/gm, "");
  
  // Handle lists - convert Markdown lists to proper bullet points or numbers
  cleanText = cleanText.replace(/^\s*[-*+]\s+/gm, "• ");
  cleanText = cleanText.replace(/^\s*(\d+)\.?\s+/gm, "$1. ");
  
  // Remove bold/italic markers but preserve text
  cleanText = cleanText.replace(/\*\*(.*?)\*\*/g, "$1"); // Bold
  cleanText = cleanText.replace(/__(.*?)__/g, "$1"); // Bold alternative
  cleanText = cleanText.replace(/\*(.*?)\*/g, "$1"); // Italic
  cleanText = cleanText.replace(/_(.*?)_/g, "$1"); // Italic alternative
  
  // Remove headers but keep text with proper spacing
  cleanText = cleanText.replace(/^#{1,6}\s+(.*)$/gm, "$1");
  
  // Ensure proper spacing after periods
  cleanText = cleanText.replace(/\.([A-Z])/g, ". $1");
  
  // Fix multiple consecutive spaces
  cleanText = cleanText.replace(/[ \t]+/g, " ");
  
  // Fix multiple consecutive line breaks
  cleanText = cleanText.replace(/\n{3,}/g, "\n\n");
  
  return cleanText.trim();
}

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
        model: 'gpt-3.5-turbo',  // Updated from 'gpt-4o-mini' to 'gpt-3.5-turbo'
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
    let response = data.choices?.[0]?.message?.content?.trim() || '';
    
    // Clean markdown formatting from the response
    response = cleanMarkdownFormatting(response);
    
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
