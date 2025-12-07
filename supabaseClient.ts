
import { createClient } from '@supabase/supabase-js';

// Project ID: sdxuwprhgpngsucmvzne
const supabaseUrl = 'https://sdxuwprhgpngsucmvzne.supabase.co'.trim();

// ------------------------------------------------------------------
// ⚠️ CRITICAL: Replace the value below with your actual Supabase Anon Key
// You can find this in your Supabase Dashboard -> Project Settings -> API
// ------------------------------------------------------------------
const supabaseKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkeHV3cHJoZ3BuZ3N1Y212em5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwODc2NzYsImV4cCI6MjA4MDY2MzY3Nn0.OPSPIhqEBFTGDYzhlGXICX_y3pFfeFiwJfY_7GO4QNY'.trim();

// Helper to check if the key is valid (not empty and not the placeholder)
export const isSupabaseConfigured = supabaseKey && supabaseKey !== 'INSERT_YOUR_SUPABASE_ANON_KEY_HERE';

export const supabase = createClient(supabaseUrl, supabaseKey);
