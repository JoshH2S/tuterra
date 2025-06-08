// Debug script for testing Edge Functions
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin access
const supabaseUrl = process.env.SUPABASE_URL || 'https://nhlsrtubyvggtkyrhkuu.supabase.co';
// Use service role key for authorization
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY_HERE';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test function for generate-internship-feedback
const testGenerateInternshipFeedback = async () => {
  try {
    // Minimal valid payload
    const payload = {
      submission_id: "5bd0a610-394a-4a92-ada5-679b9c7dceae", // replace with a valid submission ID
      task_id: "a40e758e-00fe-42c2-8ab8-5af7421a69ff", // replace with a valid task ID
      submission_text: "This is a test submission for debugging purposes.",
      task_description: "A test task to debug the Edge Function.",
      job_title: "Software Developer",
      industry: "Technology"
    };

    console.log('Sending request to generate-internship-feedback with payload:', JSON.stringify(payload, null, 2));

    const { data, error } = await supabase.functions.invoke('generate-internship-feedback', {
      body: payload,
      headers: {
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (error) {
      console.error('Error invoking function:', error);
      return;
    }

    console.log('Response data:', data);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
};

// Execute the test
testGenerateInternshipFeedback();

// Run with: SUPABASE_URL=https://nhlsrtubyvggtkyrhkuu.supabase.co SUPABASE_SERVICE_ROLE_KEY=your_service_role_key node debug-edge-function.js 