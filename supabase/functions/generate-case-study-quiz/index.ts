
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const deepSeekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
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
    const { topics, courseId, difficulty, teacherName, school, tier } = await req.json();

    if (!topics || topics.length === 0) {
      throw new Error('At least one topic is required');
    }

    console.log("Received request with:", {
      topicsCount: topics.length,
      courseId,
      difficulty,
      hasTeacherName: !!teacherName,
      hasSchool: !!school,
      tier
    });

    // Check if topics are STEM-related
    const stemKeywords = [
      "math", "mathematics", "algebra", "calculus", "geometry", "trigonometry",
      "physics", "chemistry", "biology", "computer science", "cs", "programming",
      "engineering", "statistics", "probability", "economics", "data science",
      "machine learning", "artificial intelligence", "quantum", "algorithm"
    ];
    
    // Determine if any topics are STEM-related
    const topicDescriptions = topics.map((t: { description: string }) => t.description);
    const containsSTEM = topicDescriptions.some(topic => 
      stemKeywords.some(keyword => topic.toLowerCase().includes(keyword))
    );
    
    console.log(`Topics contain STEM subjects: ${containsSTEM}`);
    console.log(`DeepSeek API key available: ${!!deepSeekApiKey}`);
    
    // Determine which model to use
    const useDeepSeek = containsSTEM && !!deepSeekApiKey;
    console.log(`Using model: ${useDeepSeek ? 'DeepSeek' : 'OpenAI'}`);
    
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

    const teacherContext = { name: teacherName, school: school };

    // Generate the appropriate prompt based on STEM detection
    const prompt = useDeepSeek 
      ? generateSTEMCaseStudyPrompt(topics, newsContext, difficulty, teacherContext)
      : generateCaseStudyPrompt(topics, newsContext, difficulty, teacherContext);

    console.log(`Sending prompt to ${useDeepSeek ? 'DeepSeek' : 'OpenAI'} with real news context...`);

    let content;
    
    if (useDeepSeek) {
      // Call DeepSeek API for STEM topics
      const response = await fetch('https://api.deepseek.com/v1/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${deepSeekApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-coder',
          prompt: prompt,
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('DeepSeek API error:', error);
        // Fall back to OpenAI if DeepSeek fails
        console.log('Falling back to OpenAI due to DeepSeek API error');
        content = await getOpenAIContent(prompt);
      } else {
        const data = await response.json();
        content = data.choices[0].text;
      }
    } else {
      // Use OpenAI for non-STEM topics
      content = await getOpenAIContent(prompt);
    }
    
    // Clean up the JSON string if needed
    if (content.includes('```')) {
      content = content.replace(/```json\n|\n```|```/g, '');
    }

    try {
      const quizQuestions = JSON.parse(content);
      console.log(`Successfully parsed ${quizQuestions.length} questions based on real news stories`);

      // Add information about which model generated each question
      const questionsWithModel = quizQuestions.map((q: any) => ({
        ...q,
        generatedBy: useDeepSeek ? 'deepseek' : 'openai'
      }));

      // Calculate total points
      const totalPoints = questionsWithModel.reduce((sum: number, q: any) => sum + (q.points || 1), 0);
      
      // Estimate duration (avg 1 min per question)
      const estimatedDuration = questionsWithModel.length * 1;

      return new Response(
        JSON.stringify({ 
          quizQuestions: questionsWithModel,
          metadata: {
            courseId,
            difficulty,
            topics: topicDescriptions,
            totalPoints,
            estimatedDuration,
            newsSourcesUsed: newsArticles.map((a: any) => ({ 
              title: a.title, 
              source: a.source.name,
              url: a.url
            })),
            modelUsed: useDeepSeek ? 'deepseek' : 'openai',
            stemTopicsDetected: containsSTEM
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

// Helper function to get content from OpenAI
async function getOpenAIContent(prompt: string) {
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
  return data.choices[0].message.content;
}

// Helper function to generate the standard case study prompt
function generateCaseStudyPrompt(
  topics: Array<{ description: string, numQuestions: number }>,
  newsContext: any[],
  difficulty: string,
  teacherContext?: { name?: string; school?: string }
) {
  return `
    As an expert educational content creator, generate a case study quiz using these REAL current news stories. 
    Follow these specific guidelines:

    CASE STUDY STRUCTURE:
    1. Each case study should:
       - Use one recent news story as foundation
       - Include source attribution and publication date
       - Present a complex real-world scenario
       - Connect explicitly to ${topics.map(t => t.description).join(", ")}
       - Match ${difficulty} education level

    QUESTION REQUIREMENTS:
    For each case study, create questions that:
    1. Test HIGHER-ORDER THINKING:
       - Analysis of implications
       - Evaluation of solutions
       - Application of concepts
       - Synthesis of information

    2. Follow this specific format:
       - Clear scenario from the news story
       - Explicit connection to course concepts
       - Four distinct, plausible options
       - One clearly correct answer
       - Detailed explanation of the correct answer

    3. Ensure questions:
       - Use clear, concise language
       - Avoid ambiguity
       - Test understanding, not memorization
       - Include real-world implications

    TECHNICAL REQUIREMENTS:
    Return a JSON array where each question has:
    {
      "question": "detailed scenario + specific question",
      "options": {
        "A": "option text",
        "B": "option text",
        "C": "option text",
        "D": "option text"
      },
      "correctAnswer": "A|B|C|D",
      "topic": "specific topic",
      "points": number (1-5),
      "explanation": "detailed explanation",
      "caseStudy": {
        "source": "news source",
        "date": "publication date",
        "context": "brief context",
        "url": "source url"
      },
      "analysisType": "critical_thinking|application|evaluation|synthesis"
    }

    Generate exactly ${topics.reduce((sum, t) => sum + t.numQuestions, 0)} questions.
    ${teacherContext?.name ? `Created by ${teacherContext.name}` : ''}
    ${teacherContext?.school ? `for ${teacherContext.school}` : ''}
  `;
}

// Helper function to generate a STEM-focused case study prompt
function generateSTEMCaseStudyPrompt(
  topics: Array<{ description: string, numQuestions: number }>,
  newsContext: any[],
  difficulty: string,
  teacherContext?: { name?: string; school?: string }
) {
  return `
    As an expert STEM educational content creator, generate a case study quiz using these REAL current news stories.
    Follow these specific guidelines:

    CASE STUDY STRUCTURE:
    1. Each case study should:
       - Use one recent news story as foundation
       - Include source attribution and publication date
       - Present a complex real-world STEM scenario
       - Connect explicitly to ${topics.map(t => t.description).join(", ")}
       - Match ${difficulty} education level
       - Include mathematical or scientific concepts where relevant

    QUESTION REQUIREMENTS:
    For each case study, create questions that:
    1. Test HIGHER-ORDER THINKING in STEM contexts:
       - Quantitative analysis and problem-solving
       - Application of scientific or mathematical principles
       - Evaluation of technical solutions
       - Critical analysis of data and methodology

    2. Follow this specific format:
       - Clear scenario from the news story
       - Explicit connection to STEM concepts
       - Four distinct, technically accurate options
       - One clearly correct answer
       - Detailed step-by-step explanation of the solution

    3. STEM-specific enhancements:
       - Use LaTeX notation for equations ($...$ for inline, $$...$$ for display)
       - Include formulas and equations where appropriate
       - Provide step-by-step solutions with all calculations shown
       - Include visualization descriptions for complex concepts
       - Format code properly for programming questions

    TECHNICAL REQUIREMENTS:
    Return a JSON array where each question has:
    {
      "question": "detailed STEM scenario + specific question with LaTeX equations where needed",
      "options": {
        "A": "option text with LaTeX if needed",
        "B": "option text with LaTeX if needed",
        "C": "option text with LaTeX if needed",
        "D": "option text with LaTeX if needed"
      },
      "correctAnswer": "A|B|C|D",
      "topic": "specific topic",
      "points": number (1-5),
      "explanation": "detailed step-by-step explanation with LaTeX equations",
      "caseStudy": {
        "source": "news source",
        "date": "publication date",
        "context": "brief context",
        "url": "source url"
      },
      "analysisType": "critical_thinking|application|evaluation|synthesis",
      "formula": "key formula in LaTeX notation if applicable",
      "visualizationPrompt": "description of visualization if applicable"
    }

    Generate exactly ${topics.reduce((sum, t) => sum + t.numQuestions, 0)} questions.
    ${teacherContext?.name ? `Created by ${teacherContext.name}` : ''}
    ${teacherContext?.school ? `for ${teacherContext.school}` : ''}
  `;
}
