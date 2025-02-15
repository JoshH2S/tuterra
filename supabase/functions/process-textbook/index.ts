
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Updated CORS headers to be more permissive for development
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Request-Headers': '*'
};

function chunkText(text: string, maxChunkSize = 1000): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxChunkSize) {
      currentChunk += sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  try {
    console.log('Starting text extraction from PDF...');
    console.log('Buffer size:', buffer.byteLength);
    
    const decoder = new TextDecoder('utf-8');
    let text = decoder.decode(buffer);
    
    console.log('Raw text length:', text.length);
    
    // Basic cleaning of the extracted text
    text = text.replace(/\x00/g, '') // Remove null bytes
              .replace(/[\r\n]+/g, '\n') // Normalize line endings
              .replace(/\s+/g, ' ') // Normalize whitespace
              .trim();
    
    console.log('Cleaned text length:', text.length);
    console.log('First 100 characters:', text.substring(0, 100));
    
    if (text.length === 0) {
      throw new Error('Extracted text is empty');
    }
    
    return text;
  } catch (error) {
    console.error('Error in extractTextFromPDF:', error);
    throw new Error(`Failed to process PDF content: ${error.message}`);
  }
}

async function generateSummary(content: string, type: string): Promise<string> {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  // Limit content length for the OpenAI API
  const maxContentLength = 4000;
  const truncatedContent = content.length > maxContentLength 
    ? content.substring(0, maxContentLength) + "..."
    : content;

  const prompt = `Summarize the following ${type} content concisely while preserving key information:

${truncatedContent}

Focus on:
1. Main concepts and ideas
2. Key definitions
3. Important formulas or examples
4. Learning objectives

Keep the summary clear and structured.`;

  try {
    console.log('Sending request to OpenAI...');
    console.log('Content length:', content.length);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert educator specializing in creating concise, informative summaries of educational content.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response:', data);
      throw new Error('Invalid response from OpenAI API');
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}

async function generateEmbedding(text: string): Promise<number[]> {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key is not configured');
  }

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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to generate embedding: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const { data } = await response.json();
    return data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

async function processChunks(supabase: any, contentId: string, chunks: string[]) {
  console.log(`Processing ${chunks.length} chunks for content ${contentId}`);
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      console.log(`Processing chunk ${i + 1}/${chunks.length}`);
      const embedding = await generateEmbedding(chunk);
      
      const { error } = await supabase
        .from('content_chunks')
        .insert({
          content_id: contentId,
          chunk_text: chunk,
          chunk_index: i,
          embedding,
          metadata: { position: i, total_chunks: chunks.length }
        });

      if (error) {
        console.error(`Error storing chunk ${i}:`, error);
      } else {
        console.log(`Successfully stored chunk ${i + 1}`);
      }
    } catch (error) {
      console.error(`Error processing chunk ${i}:`, error);
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    if (!openAIApiKey) {
      console.error('OpenAI API key is missing');
      throw new Error('OpenAI API key is not configured');
    }

    console.log('Starting request processing...');
    
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request payload:', requestBody);
    } catch (error) {
      console.error('Error parsing request body:', error);
      throw new Error('Invalid request body');
    }
    
    const { filePath, contentType, title, parentId } = requestBody;
    
    if (!filePath || !contentType || !title) {
      const missingParams = [];
      if (!filePath) missingParams.push('filePath');
      if (!contentType) missingParams.push('contentType');
      if (!title) missingParams.push('title');
      throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase configuration is missing');
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Downloading file from storage:', filePath);
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('textbooks')
      .download(filePath);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    if (!fileData) {
      throw new Error('No file data received from storage');
    }

    console.log('Converting file to ArrayBuffer...');
    const arrayBuffer = await fileData.arrayBuffer();
    console.log('File size:', arrayBuffer.byteLength, 'bytes');

    console.log('Extracting text from PDF...');
    const extractedText = await extractTextFromPDF(arrayBuffer);
    console.log('Extracted text length:', extractedText.length);

    if (!extractedText || extractedText.length === 0) {
      throw new Error('No text could be extracted from the file');
    }

    console.log('Generating summary...');
    const summary = await generateSummary(extractedText, contentType);
    console.log('Summary generated, length:', summary.length);

    console.log('Storing processed content...');
    const { data: contentData, error: contentError } = await supabase
      .from('processed_textbook_content')
      .insert({
        original_file_path: filePath,
        content_type: contentType,
        title,
        content: extractedText,
        summary,
        parent_id: parentId || null,
      })
      .select()
      .single();

    if (contentError) {
      console.error('Content storage error:', contentError);
      throw new Error(`Failed to store processed content: ${contentError.message}`);
    }

    console.log('Content stored successfully, ID:', contentData.id);

    // Generate chunks and process them
    console.log('Chunking content...');
    const chunks = chunkText(extractedText);
    console.log(`Generated ${chunks.length} chunks`);
    
    await processChunks(supabase, contentData.id, chunks);
    console.log('All chunks processed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        data: contentData,
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in process-textbook function:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error.stack,
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
