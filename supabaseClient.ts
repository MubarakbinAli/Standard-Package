
import { createClient } from '@supabase/supabase-js';

// Project ID: sdxuwprhgpngsucmvzne
const supabaseUrl = 'https://sdxuwprhgpngsucmvzne.supabase.co';

// Actual Supabase Anon Key
const supabaseKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkeHV3cHJoZ3BuZ3N1Y212em5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwODc2NzYsImV4cCI6MjA4MDY2MzY3Nn0.OPSPIhqEBFTGDYzhlGXICX_y3pFfeFiwJfY_7GO4QNY';

// Helper to check if the key is configured
export const isSupabaseConfigured = !!supabaseKey;

export const supabase = createClient(supabaseUrl, supabaseKey);
