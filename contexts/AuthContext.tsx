
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/database.types';
import { Alert } from 'react-native';

const SUPABASE_URL = 'https://bldlekwvgeatnqjwiowq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsZGxla3d2Z2VhdG5xandpb3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MDEwOTcsImV4cCI6MjA3NzA3NzA5N30.S8YzBbuBaCgzy7Dhox0LlLLsXDgIvQep839mgkWI43g';

// Global auth state
export let auth_token: string | null = null;
export let current_user: User | null = null;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authToken: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  clearStoredAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load auth token and verify on mount
  useEffect(() => {
    console.log('AuthProvider: Initializing...');
    verifyStoredToken();
  }, []);

  // Clear all stored authentication data
  const clearStoredAuth = async () => {
    try {
      console.log('AuthProvider: Clearing all stored authentication data...');
      
      // Clear AsyncStorage
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('current_user');
      
      // Clear global variables
      auth_token = null;
      current_user = null;
      
      // Clear state
      setAuthToken(null);
      setUser(null);
      
      console.log('AuthProvider: All authentication data cleared');
    } catch (error) {
      console.error('AuthProvider: Error clearing stored auth:', error);
    }
  };

  // Verify stored token on app startup
  const verifyStoredToken = async () => {
    try {
      console.log('AuthProvider: Checking for stored token...');
      
      // Get stored token
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('current_user');
      
      console.log('AuthProvider: Stored token exists:', !!storedToken);
      console.log('AuthProvider: Stored user exists:', !!storedUser);
      
      if (!storedToken) {
        console.log('AuthProvider: No stored token found - user needs to login');
        setLoading(false);
        return;
      }

      console.log('AuthProvider: Found stored token, verifying with Supabase...');
      
      // Verify token with Supabase
      const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('AuthProvider: Token verification response status:', response.status);

      if (response.ok) {
        const authUser = await response.json();
        console.log('AuthProvider: Token is valid for user:', authUser.email);
        
        // Set global auth_token
        auth_token = storedToken;
        setAuthToken(storedToken);
        
        // Load user data from database
        await loadUserData(authUser.id, storedToken);
      } else {
        const errorText = await response.text();
        console.log('AuthProvider: Token is invalid or expired:', errorText);
        
        // Clear invalid token
        await clearStoredAuth();
        setLoading(false);
      }
    } catch (error) {
      console.error('AuthProvider: Error verifying token:', error);
      
      // Clear potentially corrupted data
      await clearStoredAuth();
      setLoading(false);
    }
  };

  // Load user data from public.users table
  const loadUserData = async (authUserId: string, token: string) => {
    try {
      console.log('AuthProvider: Loading user data for auth user:', authUserId);
      
      // Query the users table
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/users?or=(user_id.eq.${authUserId},auth_user_id.eq.${authUserId})`,
        {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('AuthProvider: User data query response status:', response.status);

      if (response.ok) {
        const users = await response.json();
        console.log('AuthProvider: Found users:', users.length);
        
        if (users && users.length > 0) {
          const userData = users[0] as User;
          console.log('AuthProvider: User data loaded - Email:', userData.email, 'Role:', userData.role);
          
          // Set global current_user
          current_user = userData;
          setUser(userData);
          
          // Store user data
          await AsyncStorage.setItem('current_user', JSON.stringify(userData));
        } else {
          console.error('AuthProvider: No user found in database for auth user:', authUserId);
          
          // Clear auth since user doesn't exist in database
          await clearStoredAuth();
        }
      } else {
        const errorText = await response.text();
        console.error('AuthProvider: Error loading user data:', errorText);
        
        // Clear auth on error
        await clearStoredAuth();
      }
    } catch (error) {
      console.error('AuthProvider: Exception loading user data:', error);
      
      // Clear auth on exception
      await clearStoredAuth();
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password using direct HTTP POST
  const signIn = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log('AuthProvider: Signing in user:', email);
      setLoading(true);

      // Make POST request to Supabase Auth API
      const response = await fetch(
        `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      const data = await response.json();
      console.log('AuthProvider: Sign in response status:', response.status);

      if (response.ok && data.access_token) {
        console.log('AuthProvider: Sign in successful');
        
        // Store the access_token in global variable and AsyncStorage
        auth_token = data.access_token;
        setAuthToken(data.access_token);
        await AsyncStorage.setItem('auth_token', data.access_token);
        
        // Load user data from database
        await loadUserData(data.user.id, data.access_token);
        
        return { success: true };
      } else {
        console.error('AuthProvider: Sign in failed:', data.error_description || data.msg);
        return { 
          success: false, 
          message: data.error_description || data.msg || 'Invalid email or password. Please try again.' 
        };
      }
    } catch (error: any) {
      console.error('AuthProvider: Sign in exception:', error);
      return { 
        success: false, 
        message: 'Invalid email or password. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      console.log('AuthProvider: Signing out user');
      setLoading(true);
      
      // Clear all stored authentication data
      await clearStoredAuth();
      
      console.log('AuthProvider: Sign out successful');
    } catch (error: any) {
      console.error('AuthProvider: Sign out exception:', error);
      Alert.alert('Error', 'An error occurred during sign out');
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password (keeping for compatibility)
  const signUp = async (
    email: string, 
    password: string, 
    userData: Partial<User>
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log('AuthProvider: Signing up user:', email, 'Role:', userData.role);
      setLoading(true);

      // Make POST request to Supabase Auth API for signup
      const response = await fetch(
        `${SUPABASE_URL}/auth/v1/signup`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: password,
            data: {
              first_name: userData.first_name || '',
              last_name: userData.last_name || '',
              phone: userData.phone || '',
              role: userData.role || 'parent',
            },
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.user) {
        console.log('AuthProvider: Sign up successful. User created:', data.user.id);
        
        return { 
          success: true, 
          message: 'Account created successfully! Please check your email to verify your account.' 
        };
      } else {
        console.error('AuthProvider: Sign up failed:', data.error_description || data.msg);
        return { 
          success: false, 
          message: data.error_description || data.msg || 'Failed to create account' 
        };
      }
    } catch (error: any) {
      console.error('AuthProvider: Sign up exception:', error);
      return { 
        success: false, 
        message: error.message || 'An error occurred during sign up' 
      };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      authToken,
      signIn, 
      signOut, 
      signUp,
      clearStoredAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to get auth headers for database requests
export function getAuthHeaders(): HeadersInit {
  return {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': auth_token ? `Bearer ${auth_token}` : `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };
}
