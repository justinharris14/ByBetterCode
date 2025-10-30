
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { User } from '@/types/database.types';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load session and user data on mount
  useEffect(() => {
    console.log('AuthProvider: Initializing...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthProvider: Initial session:', session ? 'Found' : 'None');
      setSession(session);
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('AuthProvider: Auth state changed:', _event, session ? 'Session exists' : 'No session');
      setSession(session);
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user data from public.users table
  const loadUserData = async (authUserId: string) => {
    try {
      console.log('Loading user data for auth user:', authUserId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`user_id.eq.${authUserId},auth_user_id.eq.${authUserId}`)
        .single();

      if (error) {
        console.error('Error loading user data:', error);
        setUser(null);
      } else if (data) {
        console.log('User data loaded:', data.email, 'Role:', data.role);
        setUser(data as User);
      }
    } catch (error) {
      console.error('Exception loading user data:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log('Signing in user:', email);
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error.message);
        return { success: false, message: error.message };
      }

      if (data.session) {
        console.log('Sign in successful');
        setSession(data.session);
        await loadUserData(data.session.user.id);
        return { success: true };
      }

      return { success: false, message: 'No session created' };
    } catch (error: any) {
      console.error('Sign in exception:', error);
      return { success: false, message: error.message || 'An error occurred during sign in' };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      console.log('Signing out user');
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        Alert.alert('Error', 'Failed to sign out: ' + error.message);
      } else {
        console.log('Sign out successful');
        setUser(null);
        setSession(null);
      }
    } catch (error: any) {
      console.error('Sign out exception:', error);
      Alert.alert('Error', 'An error occurred during sign out');
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (
    email: string, 
    password: string, 
    userData: Partial<User>
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log('Signing up user:', email, 'Role:', userData.role);
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
          data: {
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            phone: userData.phone || '',
            role: userData.role || 'parent',
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error.message);
        return { success: false, message: error.message };
      }

      if (data.user) {
        console.log('Sign up successful. User created:', data.user.id);
        
        // Check if email confirmation is required
        if (data.user.identities && data.user.identities.length === 0) {
          return { 
            success: true, 
            message: 'Please check your email to confirm your account before signing in.' 
          };
        }
        
        return { 
          success: true, 
          message: 'Account created successfully! Please check your email to verify your account.' 
        };
      }

      return { success: false, message: 'Failed to create account' };
    } catch (error: any) {
      console.error('Sign up exception:', error);
      return { success: false, message: error.message || 'An error occurred during sign up' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      loading, 
      signIn, 
      signOut, 
      signUp,
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
