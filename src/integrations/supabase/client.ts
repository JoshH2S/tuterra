
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nhlsrtubyvggtkyrhkuu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obHNydHVieXZnZ3RreXJoa3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MzM4OTUsImV4cCI6MjA1NDIwOTg5NX0.rD-VfZhrrSRpo1rfuO1JoKYkNELxUUGdulu4-sI-kdU";

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
