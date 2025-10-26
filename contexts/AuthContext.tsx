
import React, { createContext, useContext, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { User } from '@/types/database.types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  setMockUser: (role: 'admin' | 'parent') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock user setter for demo mode
  const setMockUser = (role: 'admin' | 'parent') => {
    console.log('Setting mock user with role:', role);
    
    const mockUser: User = {
      user_id: role === 'admin' ? 'mock-admin-id' : 'mock-parent-id',
      first_name: role === 'admin' ? 'Admin' : 'Parent',
      last_name: role === 'admin' ? 'User' : 'User',
      email: role === 'admin' ? 'admin@demo.com' : 'parent@demo.com',
      phone: '0123456789',
      role: role,
      created_at: new Date().toISOString(),
      is_active: true,
    };
    
    setUser(mockUser);
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
