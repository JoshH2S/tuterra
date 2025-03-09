
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, userAnswer, correctAnswer, isCorrect, topic } = await req.json();

    if (!question || !userAnswer || !correctAnswer) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Generating explanation for:", { question, userAnswer, correctAnswer, isCorrect, topic });

    // Create a prompt based on the parameters
    const prompt = `
      As an educational AI assistant, provide a brief, encouraging explanation for a quiz answer.
      
      Context:
      - Question: ${question}
      - Student's Answer: ${userAnswer}
      - Correct Answer: ${correctAnswer}
      - Topic: ${topic || "General Knowledge"}
      - Result: ${isCorrect ? 'Correct' : 'Incorrect'}

      Provide a 2-3 sentence explanation that:
      1. Acknowledges the student's answer
      2. Explains why it's correct/incorrect
      3. Reinforces the key concept from ${topic || "the subject"}
      4. Maintains an encouraging tone

      Keep the explanation concise and educational.
    `;

    // Call OpenAI API
    const openAIResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
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
        max_tokens: 150,
      }),
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.json();
      console.error("OpenAI API error:", error);
      throw new Error(JSON.stringify(error));
    }

    const data = await openAIResponse.json();
    const explanation = data.choices[0].message.content.trim();
    
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
