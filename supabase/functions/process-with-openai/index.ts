
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath } = await req.json();
    console.log('Processing file:', filePath);
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('textbooks')
      .download(filePath);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Create FormData with the file
    const formData = new FormData();
    formData.append('file', fileData, filePath.split('/').pop());
    formData.append('purpose', 'assistants');

    // Upload file to OpenAI
    const uploadResponse = await fetch('https://api.openai.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const openAIFile = await uploadResponse.json();
    console.log('File uploaded to OpenAI:', openAIFile);

    // Store file reference in database
    const { error: dbError } = await supabase
      .from('openai_file_references')
      .insert({
        original_file_path: filePath,
        openai_file_id: openAIFile.id,
        status: 'completed',
        metadata: {
          bytes: openAIFile.bytes,
          filename: openAIFile.filename,
          purpose: openAIFile.purpose,
          created_at: openAIFile.created_at
        }
      });

    if (dbError) {
      throw new Error(`Failed to store file reference: ${dbError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        fileId: openAIFile.id 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Error processing file:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
