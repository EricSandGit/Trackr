import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://fulhtkolebyrllpeazpt.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1bGh0a29sZWJ5cmxscGVhenB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMDc2NjUsImV4cCI6MjEwMzY4MzY2NX0.-KTF0JEu7tjIMybizPxYKdgPv6YzlEAhoZae7aT9QiU';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project')
);

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

