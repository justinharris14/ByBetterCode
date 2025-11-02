import { supabase } from './supabase';

// ===========================
// TYPES
// ===========================

export interface ParentSignupData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  id_number?: string;
  work_phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
}

export interface SignupResult {
  success: boolean;
  user_id?: string;
  error?: string;
}

// ===========================
// PARENT SIGNUP/REGISTRATION
// ===========================

/**
 * Register a new parent user with authentication and profile
 * @param data Parent signup information
 * @returns Result with user_id or error
 */
export async function registerParent(data: ParentSignupData): Promise<SignupResult> {
  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          role: 'parent',
        },
      },
    });

    if (authError || !authData.user) {
      return {
        success: false,
        error: authError?.message || 'Failed to create user account',
      };
    }

    // 2. Update user profile with additional details
    // The trigger should create the basic profile, but we can update with more details
    if (data.phone || data.address || data.city) {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          phone: data.phone,
          address: data.address,
          city: data.city,
          postal_code: data.postal_code,
          id_number: data.id_number,
          work_phone: data.work_phone,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_phone: data.emergency_contact_phone,
          emergency_contact_relationship: data.emergency_contact_relationship,
        })
        .eq('user_id', authData.user.id);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
        // Don't fail the signup if profile update fails
      }
    }

    return {
      success: true,
      user_id: authData.user.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// ===========================
// AUTHENTICATION HELPERS
// ===========================

/**
 * Sign in a user with email and password
 * @param email User email
 * @param password User password
 * @returns Result with user_id and role or error
 */
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return {
        success: false,
        error: error?.message || 'Failed to sign in',
      };
    }

    // Get user role from profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role, first_name, last_name')
      .eq('user_id', data.user.id)
      .single();

    return {
      success: true,
      user_id: data.user.id,
      role: profile?.role || 'parent',
      first_name: profile?.first_name,
      last_name: profile?.last_name,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    return {
      success: !error,
      error: error?.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        success: false,
        error: error?.message || 'No user found',
      };
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        ...profile,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Reset password for a user
 * @param email User email
 */
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'your-app://reset-password', // Update with your app's deep link
    });

    return {
      success: !error,
      error: error?.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Update user password
 * @param newPassword New password
 */
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    return {
      success: !error,
      error: error?.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// ===========================
// USER PROFILE HELPERS
// ===========================

/**
 * Update user profile information
 * @param userId User ID
 * @param updates Profile updates
 */
export async function updateUserProfile(userId: string, updates: Partial<ParentSignupData>) {
  try {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('user_id', userId);

    return {
      success: !error,
      error: error?.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get user profile by ID
 * @param userId User ID
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      profile: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
