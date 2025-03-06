
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { 
      industry, 
      role, 
      jobDescription, 
      questions, 
      userResponses,
      metrics,
      timestamp 
    } = await req.json();

    if (!questions || !userResponses || questions.length !== userResponses.length) {
      return new Response(
        JSON.stringify({ error: 'Valid questions and responses are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a transcript of the interview for the AI to analyze
    let transcriptText = "";
    for (let i = 0; i < questions.length; i++) {
      transcriptText += `Question ${i + 1}: ${questions[i]}\n`;
      transcriptText += `Candidate's Response: ${userResponses[i]}\n\n`;
    }

    // Add metrics to the prompt if available
    const metricsText = metrics ? `
      Pre-analysis metrics:
      - Response completeness: ${(metrics.responseCompleteness * 100).toFixed(2)}%
      - Relevance to job description: ${(metrics.relevanceScore * 100).toFixed(2)}%
    ` : '';

    const prompt = `
      You are an expert job interview coach. Below is a transcript of a job interview for a ${role} position in the ${industry} industry.
      
      ${jobDescription ? `The job description is: ${jobDescription}\n\n` : ''}
      
      ${metricsText}
      
      Interview Transcript:
      ${transcriptText}
      
      Please provide a comprehensive analysis of this interview in the following format:
      
      1. Overall assessment (concise summary of performance)
      2. Quantitative analysis:
         - Overall score (0-100)
         - Category scores for communication, relevance, technical knowledge, confidence (0-100)
      3. Strengths (list 3-5 specific strengths demonstrated by the candidate)
      4. Areas for improvement (list 3-5 specific areas where the candidate could improve)
      5. Detailed feedback (300-500 words with specific examples from their responses)
      6. Keywords analysis (which important keywords the candidate used effectively and which they missed)
      
      Format your feedback in JSON format with the following structure:
      {
        "overallScore": number,
        "categoryScores": { "communication": number, "relevance": number, ... },
        "strengths": ["strength1", "strength2", ...],
        "improvements": ["improvement1", "improvement2", ...],
        "detailedFeedback": "comprehensive analysis...",
        "keywords": {
          "used": ["keyword1", "keyword2", ...],
          "missed": ["keyword3", "keyword4", ...]
        }
      }
      
      If you cannot produce JSON for any reason, provide your response as plain text.
    `;

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
            content: 'You are an experienced job interview coach providing constructive feedback on interview performance. Be specific, helpful, and encouraging. Your response should be in JSON format if possible.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data = await openaiResponse.json();

    if (!openaiResponse.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(data.error?.message || 'Unknown error from OpenAI API');
    }

    const responseContent = data.choices?.[0]?.message?.content?.trim();
    
    if (!responseContent) {
      throw new Error('No feedback generated');
    }
    
    // Try to parse as JSON first
    try {
      // Look for JSON in the response
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonResponse = JSON.parse(jsonMatch[0]);
        return new Response(
          JSON.stringify(jsonResponse),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (jsonError) {
      console.error('Error parsing JSON:', jsonError);
      // Fall back to text format
    }
    
    // If not JSON, return as text feedback
    return new Response(
      JSON.stringify({ 
        feedback: responseContent,
        detailedFeedback: responseContent
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating feedback:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
