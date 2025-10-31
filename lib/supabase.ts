
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { auth_token } from '@/contexts/AuthContext';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://bldlekwvgeatnqjwiowq.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsZGxla3d2Z2VhdG5xandpb3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MDEwOTcsImV4cCI6MjA3NzA3NzA5N30.S8YzBbuBaCgzy7Dhox0LlLLsXDgIvQep839mgkWI43g';

// Create Supabase client with custom auth header injection
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
    'apikey': supabaseAnonKey,
    'Authorization': token ? `Bearer ${token}` : `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
  };
}
