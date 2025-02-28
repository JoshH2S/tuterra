
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const newsAPIKey = Deno.env.get('NEWS_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topics, courseId, difficulty, teacherName, school } = await req.json();

    if (!topics || topics.length === 0) {
      throw new Error('At least one topic is required');
    }

    console.log("Received request with:", {
      topicsCount: topics.length,
      courseId,
      difficulty,
      hasTeacherName: !!teacherName,
      hasSchool: !!school
    });

    // Extract topics for the news search
    const topicDescriptions = topics.map((t: { description: string }) => t.description);
    const searchQuery = topicDescriptions.join(" OR ");
    
    console.log("Fetching relevant news stories for:", searchQuery);
    
    // Fetch relevant news stories using News API
    const newsResponse = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&sortBy=relevancy&pageSize=5&language=en`,
      {
        headers: {
          'X-Api-Key': newsAPIKey || ''
        }
      }
    );
    
    if (!newsResponse.ok) {
      console.error("News API error:", await newsResponse.text());
      throw new Error('Failed to fetch news stories');
    }
    
    const newsData = await newsResponse.json();
    const newsArticles = newsData.articles || [];
    
    console.log(`Retrieved ${newsArticles.length} news articles for case studies`);
    
    // Format news articles for context
    const newsContext = newsArticles.map((article: any) => ({
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      source: article.source.name,
      publishedAt: article.publishedAt
    }));

    const topicsString = topics.map((t: { description: string }) => t.description).join(", ");

    const prompt = `
      Create a case study-based quiz about ${topicsString} using the following REAL news stories as context for your case studies:
      
      ${JSON.stringify(newsContext, null, 2)}
      
      For each case study:
      1. Use one of the real news stories provided above as the foundation
      2. Include the source and approximate date of the news story in the case description
      3. Create a detailed scenario based on the news story that tests understanding
      4. Focus on analysis and critical thinking about REAL situations
      5. Include questions about potential implications, ethical considerations, and solutions
      6. Incorporate key terminology and concepts from ${topicsString}
      7. Match the ${difficulty} education level

      Format your response as a JSON array with questions that have these properties:
      - question: detailed scenario from a real news story followed by the specific question
      - options: object with A, B, C, D keys containing possible answers
      - correctAnswer: one of "A", "B", "C", or "D"
      - topic: the specific topic this question relates to
      - points: number between 1-5 based on difficulty
      - explanation: brief explanation of why the correct answer is right

      Generate ${topics.reduce((sum: number, t: { numQuestions: number }) => sum + t.numQuestions, 0)} multiple-choice questions total.
      ${teacherName ? `Created by ${teacherName}` : ''}
      ${school ? `for ${school}` : ''}
    `;

    console.log("Sending prompt to OpenAI with real news context...");

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are an expert at creating case study based quizzes that focus on analysis and critical thinking using REAL news stories as context. Always cite the source and date of the news article in your case studies.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate quiz questions');
    }

    const data = await response.json();
    console.log("Received response from OpenAI");
    
    let content = data.choices[0].message.content;
    
    // Clean up the JSON string if needed
    if (content.includes('```')) {
      content = content.replace(/```json\n|\n```|```/g, '');
    }

    try {
      const quizQuestions = JSON.parse(content);
      console.log(`Successfully parsed ${quizQuestions.length} questions based on real news stories`);

      return new Response(
        JSON.stringify({ 
          quizQuestions,
          metadata: {
            courseId,
            difficulty,
            topics: topicsString,
            newsSourcesUsed: newsArticles.map((a: any) => ({ 
              title: a.title, 
              source: a.source.name,
              url: a.url
            }))
          }
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Received content:", content);
      throw new Error("Failed to parse response from AI service");
    }
  } catch (error) {
    console.error('Error in generate-case-study-quiz:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.stack
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
