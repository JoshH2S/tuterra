import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Set up CORS headers for the response
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle OPTIONS requests (CORS preflight)
function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    })
  }
  return null
}

serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    // Extract authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Extract the token from the Authorization header
    const token = authHeader.replace('Bearer ', '')
    
    // Create a Supabase client with the user's token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    )

    // Verify if the user is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Process the request based on the method
    if (req.method === 'POST') {
      // Extract form data
      const formData = await req.formData()
      const file = formData.get('file') as File
      const sessionId = formData.get('sessionId') as string

      if (!file || !sessionId) {
        return new Response(JSON.stringify({ error: 'Missing file or session ID' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }

      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        return new Response(JSON.stringify({ error: 'Only image files are allowed' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }

      // Check if file size is within limits (2MB)
      if (file.size > 2 * 1024 * 1024) {
        return new Response(JSON.stringify({ error: 'File size exceeds 2MB limit' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }

      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()
      
      // Generate a unique filename
      const fileName = `banner-${sessionId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`

      // Upload to Supabase Storage
      const { data, error } = await supabaseClient.storage
        .from('internship-assets')
        .upload(`banners/${fileName}`, arrayBuffer, {
          contentType: file.type,
          cacheControl: '3600',
        })

      if (error) {
        console.error('Storage upload error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        })
      }

      // Get public URL
      const { data: urlData } = supabaseClient.storage
        .from('internship-assets')
        .getPublicUrl(`banners/${fileName}`)

      // Return the URL
      return new Response(JSON.stringify({ url: urlData.publicUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      })
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}) 