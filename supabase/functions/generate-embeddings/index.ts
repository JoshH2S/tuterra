
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-ada-002',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate embedding');
    }

    const { data } = await response.json();
    return data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentId, text } = await req.json();
    
    if (!contentId || !text) {
      throw new Error('Missing required parameters');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    console.log('Generating embedding for content:', contentId);
    const embedding = await generateEmbedding(text);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store the embedding
    const { error: embeddingError } = await supabase
      .from('textbook_embeddings')
      .insert({
        content_id: contentId,
        embedding,
      });

    if (embeddingError) {
      console.error('Error storing embedding:', embeddingError);
      throw new Error('Failed to store embedding');
    }

    // Update the processed content with its embedding
    const { error: updateError } = await supabase
      .from('processed_textbook_content')
      .update({ embedding })
      .eq('id', contentId);

    if (updateError) {
      console.error('Error updating content embedding:', updateError);
      throw new Error('Failed to update content embedding');
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-embeddings function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
