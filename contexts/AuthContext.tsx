
import React, { createContext, useContext, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { User } from '@/types/database.types';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  setMockUser: (role: 'admin' | 'parent') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock user setter for demo mode - fetches real user from database
  const setMockUser = async (role: 'admin' | 'parent') => {
    console.log('Setting mock user with role:', role);
    
    try {
      // Fetch a real user from the database based on role
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', role)
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        // Fallback to hardcoded mock user
        const mockUser: User = {
          user_id: role === 'admin' ? '11111111-1111-1111-1111-111111111111' : '22222222-2222-2222-2222-222222222222',
          first_name: role === 'admin' ? 'Lindiwe' : 'Thabo',
          last_name: role === 'admin' ? 'Mkhize' : 'Dlamini',
          email: role === 'admin' ? 'admin@crecheconnect.com' : 'thabo@example.com',
          phone: '0123456789',
          role: role,
          created_at: new Date().toISOString(),
          is_active: true,
        };
        setUser(mockUser);
      } else if (data) {
        console.log('User loaded from database:', data);
        setUser(data as User);
      }
    } catch (error) {
      console.error('Error in setMockUser:', error);
      // Fallback to hardcoded mock user
      const mockUser: User = {
        user_id: role === 'admin' ? '11111111-1111-1111-1111-111111111111' : '22222222-2222-2222-2222-222222222222',
        first_name: role === 'admin' ? 'Lindiwe' : 'Thabo',
        last_name: role === 'admin' ? 'Mkhize' : 'Dlamini',
        email: role === 'admin' ? 'admin@crecheconnect.com' : 'thabo@example.com',
        phone: '0123456789',
        role: role,
        created_at: new Date().toISOString(),
        is_active: true,
      };
      setUser(mockUser);
    }
  };

  // Placeholder functions (not used in demo mode)
  const signIn = async (email: string, password: string) => {
    console.log('Sign in called (demo mode - not implemented)');
    throw new Error('Authentication is disabled in demo mode');
  };

  const signOut = async () => {
    console.log('Sign out called');
    setUser(null);
    setSession(null);
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    console.log('Sign up called (demo mode - not implemented)');
    throw new Error('Authentication is disabled in demo mode');
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      loading, 
      signIn, 
      signOut, 
      signUp,
      setMockUser 
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
