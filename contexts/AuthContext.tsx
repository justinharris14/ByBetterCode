import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { User } from '@/types/database.types';

// ─────────────────────────────────────────────
// 🔑 SUPABASE CONFIG
// ─────────────────────────────────────────────
const SUPABASE_URL = 'https://bldlekwvgeatnqjwiowq.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsZGxla3d2Z2VhdG5xandpb3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MDEwOTcsImV4cCI6MjA3NzA3NzA5N30.S8YzBbuBaCgzy7Dhox0LlLLsXDgIvQep839mgkWI43g';

// ─────────────────────────────────────────────
// 🔐 GLOBAL AUTH STATE (for non-hook access)
// ─────────────────────────────────────────────
export let auth_token: string | null = null;
export let current_user: User | null = null;

// ─────────────────────────────────────────────
// ⚙️ CONTEXT INTERFACE
// ─────────────────────────────────────────────
interface AuthContextType {
  user: User | null;
  loading: boolean;
  authToken: string | null;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; user?: User | null; message?: string }>;
  signUp: (
    email: string,
    password: string,
    userData: Partial<User>
  ) => Promise<{ success: boolean; message?: string }>;
  signOut: () => Promise<void>;
  clearStoredAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─────────────────────────────────────────────
// 🧠 PROVIDER COMPONENT
// ─────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load stored session on mount
  useEffect(() => {
    verifyStoredToken();
  }, []);

  // ─────────────────────────────────────────────
  // 🔄 VERIFY STORED TOKEN
  // ─────────────────────────────────────────────
  const verifyStoredToken = async () => {
    try {
      console.log('AuthProvider: Checking stored token...');
      const storedToken = await AsyncStorage.getItem('auth_token');
      const refreshToken = await AsyncStorage.getItem('refresh_token');

      if (!storedToken) {
        console.log('No stored token found.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${storedToken}`,
        },
      });

      if (res.ok) {
        const authUser = await res.json();
        console.log('Token valid for user:', authUser.email);
        auth_token = storedToken;
        setAuthToken(storedToken);
        await loadUserData(authUser.id, storedToken);
      } else if (res.status === 401 && refreshToken) {
        console.log('Token expired — attempting refresh...');
        await refreshAccessToken(refreshToken);
      } else {
        console.log('Token invalid — clearing...');
        await clearStoredAuth();
      }
    } catch (err) {
      console.error('verifyStoredToken error:', err);
      await clearStoredAuth();
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // 🔁 REFRESH TOKEN
  // ─────────────────────────────────────────────
  const refreshAccessToken = async (refreshToken: string) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await res.json();
      if (res.ok && data.access_token) {
        console.log('Token refreshed successfully.');
        await AsyncStorage.setItem('auth_token', data.access_token);
        await AsyncStorage.setItem('refresh_token', data.refresh_token);
        auth_token = data.access_token;
        setAuthToken(data.access_token);
        await loadUserData(data.user?.id, data.access_token);
      } else {
        console.error('Token refresh failed:', data);
        await clearStoredAuth();
      }
    } catch (error) {
      console.error('refreshAccessToken error:', error);
      await clearStoredAuth();
    }
  };

  // ─────────────────────────────────────────────
  // 📥 LOAD USER DATA
  // ─────────────────────────────────────────────
  const loadUserData = async (authUserId?: string, token?: string) => {
    try {
      if (!authUserId || !token) {
        console.error('Missing authUserId or token.');
        await clearStoredAuth();
        return;
      }

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/users?user_id=eq.${authUserId}`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const users = await res.json();
        if (users.length > 0) {
          const userData = users[0] as User;
          console.log('Loaded user:', userData.email, '| Role:', userData.role);
          current_user = userData;
          setUser(userData);
          await AsyncStorage.setItem('current_user', JSON.stringify(userData));
        } else {
          console.log('No user found in database.');
          await clearStoredAuth();
        }
      } else {
        console.log('Failed to load user data, status:', res.status);
        await clearStoredAuth();
      }
    } catch (err) {
      console.error('loadUserData error:', err);
      await clearStoredAuth();
    }
  };

  // ─────────────────────────────────────────────
  // 🔓 SIGN IN
  // ─────────────────────────────────────────────
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: User | null; message?: string }> => {
    try {
      setLoading(true);
      console.log('Signing in:', email);

      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.access_token) {
        console.log('✅ Login successful.');

        await AsyncStorage.setItem('auth_token', data.access_token);
        await AsyncStorage.setItem('refresh_token', data.refresh_token);

        auth_token = data.access_token;
        setAuthToken(data.access_token);

        await loadUserData(data.user?.id || data.user_id, data.access_token);

        const storedUser = await AsyncStorage.getItem('current_user');
        const parsedUser: User | null = storedUser ? JSON.parse(storedUser) : null;

        return { success: true, user: parsedUser || null };
      } else {
        console.error('❌ Login failed:', data.error_description || data.msg);
        return {
          success: false,
          message: data.error_description || data.msg || 'Invalid credentials',
        };
      }
    } catch (err: any) {
      console.error('signIn error:', err);
      return { success: false, message: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // 🚪 SIGN OUT
  // ─────────────────────────────────────────────
  const signOut = async () => {
    try {
      setLoading(true);
      console.log('Signing out...');
      await clearStoredAuth();
    } catch (err) {
      console.error('signOut error:', err);
      Alert.alert('Error', 'Failed to sign out.');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // 🧾 SIGN UP
  // ─────────────────────────────────────────────
  const signUp = async (
    email: string,
    password: string,
    userData: Partial<User>
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      console.log('Registering user:', email);

      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          data: {
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            phone: userData.phone || '',
            role: userData.role || 'parent',
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        console.log('Signup successful for:', data.user.email);
        return {
          success: true,
          message:
            'Account created successfully! Please check your email to verify your account.',
        };
      } else {
        console.error('Signup failed:', data.error_description || data.msg);
        return { success: false, message: data.error_description || 'Signup failed.' };
      }
    } catch (err: any) {
      console.error('signUp error:', err);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // 🧹 CLEAR AUTH
  // ─────────────────────────────────────────────
  const clearStoredAuth = async () => {
    console.log('Clearing stored authentication...');
    await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'current_user']);
    auth_token = null;
    current_user = null;
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authToken,
        signIn,
        signUp,
        signOut,
        clearStoredAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────
// 🪝 CUSTOM HOOK
// ─────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

// ─────────────────────────────────────────────
// 🧾 AUTH HEADERS HELPER
// ─────────────────────────────────────────────
export async function getAuthHeaders(): Promise<HeadersInit> {
  const token = auth_token || (await AsyncStorage.getItem('auth_token'));
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };
}
