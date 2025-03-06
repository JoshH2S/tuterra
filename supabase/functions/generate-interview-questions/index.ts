
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
      numberOfQuestions = 5,
      timeLimit = 30,
      categories,
      sessionId 
    } = await req.json();

    if (!industry || !role) {
      return new Response(
        JSON.stringify({ error: 'Industry and role are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating questions for session ${sessionId}: ${role} in ${industry}`);

    const categoryPrompt = categories ? 
      `Focus on these question categories with their weights: ${categories.map(c => `${c.name} (${c.weight}%)`).join(', ')}` : 
      'Include a good mix of technical, behavioral, problem-solving, and cultural fit questions';

    const prompt = `
      Generate ${numberOfQuestions} realistic job interview questions for a ${role} position in the ${industry} industry.
      
      ${jobDescription ? `Here is the job description: ${jobDescription}` : ''}
      
      ${categoryPrompt}
      
      For each question, provide:
      1. The question text
      2. A category (Technical, Behavioral, Problem Solving, Situational, Experience, Cultural Fit)
      3. A difficulty level (easy, medium, hard)
      4. Estimated time to answer in seconds (60-300)
      5. 3-5 relevant keywords that might appear in a good answer
      
      Create questions that progress in difficulty (start with easier questions, move to more complex ones).
      
      Format your response as a valid JSON array of objects, each containing:
      { 
        "text": "question text", 
        "category": "category name", 
        "difficulty": "difficulty level",
        "estimatedTimeSeconds": number, 
        "keywords": ["keyword1", "keyword2", ...]
      }
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
            content: 'You are an expert AI interviewer that generates realistic job interview questions. Your output should be a valid JSON array of question objects with text, category, difficulty, estimatedTimeSeconds, and keywords properties.' 
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

    const responseContent = data.choices?.[0]?.message?.content?.trim() || '';
    
    // Parse the JSON from the response
    try {
      const parsedResponse = JSON.parse(responseContent);
      
      // Ensure it's an array of question objects
      if (!Array.isArray(parsedResponse)) {
        throw new Error('Response is not an array');
      }
      
      // Validate each question object
      const questions = parsedResponse.map((q: any) => ({
        text: q.text,
        category: q.category,
        difficulty: q.difficulty?.toLowerCase(),
        estimatedTimeSeconds: parseInt(q.estimatedTimeSeconds) || 120,
        keywords: Array.isArray(q.keywords) ? q.keywords : []
      }));
      
      console.log(`Successfully generated ${questions.length} questions for session ${sessionId}`);
      
      return new Response(
        JSON.stringify({ questions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Error parsing JSON from OpenAI response:', parseError);
      console.log('Raw response:', responseContent);
      
      // Fallback: try to extract questions manually
      try {
        // Look for something that resembles JSON (between square brackets)
        const jsonMatch = responseContent.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const questions = JSON.parse(jsonMatch[0]);
          return new Response(
            JSON.stringify({ questions }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (fallbackError) {
        console.error('Fallback parsing failed:', fallbackError);
      }
      
      // Last resort: return an error
      throw new Error('Could not parse questions from response');
    }
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
