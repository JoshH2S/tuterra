
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

interface NewsApiResponse {
  articles: {
    title: string;
    url: string;
    source: { name: string };
    publishedAt: string;
  }[];
}

// Define trusted sources
const TRUSTED_DOMAINS = [
  'bbc.com',
  'bbc.co.uk',
  'reuters.com',
  'nytimes.com',
  'wsj.com',
  'ft.com',
  'economist.com',
  'wired.com',
  'technologyreview.com',
  'bloomberg.com',
  'washingtonpost.com',
  'politico.com',
  'forbes.com',
  'edsurge.com',
  'insidehighered.com',
  'hbr.org'
];

// Convert domains to News API source format
const TRUSTED_SOURCES = TRUSTED_DOMAINS.map(domain => {
  const parts = domain.split('.');
  return parts[0] === 'www' ? parts[1] : parts[0];
}).join(',');

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } }
      }
    )

    // Get user from auth header
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))

    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    // Get request data
    const { searchTerms } = await req.json()
    if (!searchTerms) {
      throw new Error('No search terms provided')
    }

    // Get NEWS_API_KEY from environment
    const newsApiKey = Deno.env.get('NEWS_API_KEY')
    if (!newsApiKey) {
      throw new Error('News API key not configured')
    }

    // Construct URL with domains filter
    const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchTerms)}&domains=${TRUSTED_DOMAINS.join(',')}&sortBy=publishedAt&language=en&pageSize=10&apiKey=${newsApiKey}`
    console.log('Fetching news from:', newsApiUrl.replace(newsApiKey, '[REDACTED]'));
    
    const response = await fetch(newsApiUrl)
    if (!response.ok) {
      const errorData = await response.json()
      console.error('News API error:', errorData);
      throw new Error(errorData.message || 'Failed to fetch news')
    }

    const newsData: NewsApiResponse = await response.json()
    console.log(`Found ${newsData.articles?.length || 0} articles from trusted sources`);

    // Transform and filter the response
    const articles = (newsData.articles || [])
      .filter(article => {
        // Extract domain from URL
        const url = new URL(article.url);
        return TRUSTED_DOMAINS.some(domain => url.hostname.includes(domain));
      })
      .map(article => ({
        title: article.title,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt
      }));

    // Return the transformed articles
    return new Response(
      JSON.stringify({ articles }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
