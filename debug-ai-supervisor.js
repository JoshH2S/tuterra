// Debug script for testing the ai-supervisor Edge Function
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://nhlsrtubyvggtkyrhkuu.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obHNydHVieXZnZ3RreXJoa3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU0NDIyOTUsImV4cCI6MjA1NDIwOTg5NX0.JTIh1fH_F1y1HV7Esvt45Q7XnG-weBzv88TmgUzDx_I';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test function for ai-supervisor
const testAiSupervisor = async () => {
  try {
    // Minimal valid payload based on the error - note we're seeing content length of 34 bytes in the error
    const payload = {
      session_id: "7671aded-ab17-4b41-93f4-563108f231a2", // replace with a valid session ID
      type: "check_in"  // This is a guess - we need to see what parameters the function expects
    };

    console.log('Sending request to ai-supervisor with payload:', JSON.stringify(payload, null, 2));

    const { data, error } = await supabase.functions.invoke('ai-supervisor', {
      body: payload
    });

    if (error) {
      console.error('Error invoking function:', error);
      console.error('Error details:', error.message);
      return;
    }

    console.log('Response data:', data);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
};

// Execute the test
testAiSupervisor();

// Run with: SUPABASE_URL=https://nhlsrtubyvggtkyrhkuu.supabase.co SUPABASE_ANON_KEY=your_anon_key node debug-ai-supervisor.js 