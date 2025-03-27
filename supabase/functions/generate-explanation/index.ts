
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, userAnswer, correctAnswer, isCorrect, topic, tier = 'free' } = await req.json();

    if (!question || !userAnswer || !correctAnswer) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Generating explanation for:", { question, userAnswer, correctAnswer, isCorrect, topic, tier });

    // Determine model and tokens based on tier
    const model = tier === 'premium' ? 'gpt-3.5-turbo' : tier === 'pro' ? 'gpt-3.5-turbo' : 'gpt-3.5-turbo';  // Updated models for all tiers
    const maxTokens = tier === 'premium' ? 200 : tier === 'pro' ? 150 : 100;

    // Create a prompt based on the parameters and tier
    const promptBase = `
      As an educational AI assistant, provide a ${tier === 'free' ? 'brief' : 'detailed'} explanation for a quiz answer.
      
      Context:
      - Question: ${question}
      - Student's Answer: ${userAnswer}
      - Correct Answer: ${correctAnswer}
      - Topic: ${topic || "General Knowledge"}
      - Result: ${isCorrect ? 'Correct' : 'Incorrect'}
    `;

    const tierSpecificPrompt = tier === 'premium' 
      ? `
        Provide a comprehensive explanation that:
        1. Acknowledges the student's answer with specific feedback
        2. Explains in depth why it's correct/incorrect with examples
        3. Provides additional context and connects to broader concepts
        4. Suggests further learning resources or related topics
        5. Uses an encouraging and supportive tone
        
        Make this explanation educational, insightful, and personalized.
      `
      : tier === 'pro'
      ? `
        Provide a detailed explanation that:
        1. Acknowledges the student's answer
        2. Explains thoroughly why it's correct/incorrect
        3. Reinforces key concepts and provides additional context
        4. Maintains an encouraging tone

        Keep the explanation educational and supportive.
      `
      : `
        Provide a 2-3 sentence explanation that:
        1. Acknowledges the student's answer
        2. Explains why it's correct/incorrect
        3. Reinforces the key concept
        4. Maintains an encouraging tone

        Keep the explanation concise and educational.
      `;

    const prompt = promptBase + tierSpecificPrompt;

    // Call OpenAI API
    const openAIResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are an expert educational AI assistant that provides clear, concise, and encouraging explanations for quiz answers."
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: maxTokens,
      }),
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.json();
      console.error("OpenAI API error:", error);
      throw new Error(JSON.stringify(error));
    }

    const data = await openAIResponse.json();
    let explanation = data.choices[0].message.content.trim();
    
    // Clean markdown formatting from the explanation
    explanation = cleanMarkdownFormatting(explanation);
    
    console.log("Generated explanation:", explanation);

    return new Response(
      JSON.stringify({ explanation }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating explanation:", error);
    
    // Provide a fallback explanation
    let fallbackExplanation;
    try {
      const { isCorrect, topic } = await req.json();
      fallbackExplanation = isCorrect
        ? `That's correct! You've demonstrated a good understanding of ${topic || "this concept"}.`
        : `That's not quite right. The correct answer demonstrates an important concept in ${topic || "this area"}.`;
    } catch {
      fallbackExplanation = "Sorry, we couldn't generate an explanation at this time.";
    }
    
    return new Response(
      JSON.stringify({ 
        explanation: fallbackExplanation,
        error: "Failed to generate explanation from OpenAI."
      }),
      {
        status: 200,  // Return 200 with fallback rather than error
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
