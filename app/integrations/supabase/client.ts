
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://bldlekwvgeatnqjwiowq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsZGxla3d2Z2VhdG5xandpb3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MDEwOTcsImV4cCI6MjA3NzA3NzA5N30.S8YzBbuBaCgzy7Dhox0LlLLsXDgIvQep839mgkWI43g";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: async () => {
      // Get the current auth token from AsyncStorage
      const token = await AsyncStorage.getItem('auth_token');
      
      if (token) {
        return {
          Authorization: `Bearer ${token}`,
        };
      }
      
      return {};
    },
  },
});

// Helper function to ensure auth headers are included in requests
export async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await AsyncStorage.getItem('auth_token');
  
  return {
    'apikey': SUPABASE_PUBLISHABLE_KEY,
    'Authorization': token ? `Bearer ${token}` : `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
    'Content-Type': 'application/json',
  };
}
