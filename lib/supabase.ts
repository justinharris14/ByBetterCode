import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// === CONFIG ===
const SUPABASE_URL = 'https://bldlekwvgeatnqjwiowq.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsZGxla3d2Z2VhdG5xandpb3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MDEwOTcsImV4cCI6MjA3NzA3NzA5N30.S8YzBbuBaCgzy7Dhox0LlLLsXDgIvQep839mgkWI43g';

// === CREATE CLIENT ===
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,          // persistent auth session
    autoRefreshToken: true,         // keeps tokens alive
    persistSession: true,           // stay signed in
    detectSessionInUrl: false,      // required for mobile
  },
});

// === OPTIONAL: Manual headers helper ===
export async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await supabase.auth.getSession();
  const token = session?.data?.session?.access_token;
  return {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': token
      ? `Bearer ${token}`
      : `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };
}
