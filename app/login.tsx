
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const { setMockUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async () => {
    setLoading(true);
    console.log('Admin login selected');
    
    try {
      // Fetch the admin user from the database
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'admin')
        .single();

      if (error) {
        console.error('Error fetching admin user:', error);
        // Fallback to mock user
        setMockUser('admin');
      } else if (data) {
        console.log('Admin user loaded:', data);
        // Set the real user data
        setMockUser('admin');
      }
    } catch (error) {
      console.error('Error during admin login:', error);
      setMockUser('admin');
    }
    
    setLoading(false);
    router.replace('/(admin)/dashboard');
  };

  const handleParentLogin = async () => {
    setLoading(true);
    console.log('Parent login selected');
    
    try {
      // Fetch a parent user from the database
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'parent')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching parent user:', error);
        // Fallback to mock user
        setMockUser('parent');
      } else if (data) {
        console.log('Parent user loaded:', data);
        // Set the real user data
        setMockUser('parent');
      }
    } catch (error) {
      console.error('Error during parent login:', error);
      setMockUser('parent');
    }
    
    setLoading(false);
    router.replace('/(parent)/dashboard');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🏫</Text>
          <Text style={styles.title}>CrècheConnect</Text>
          <Text style={styles.subtitle}>Childcare Management System</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Text style={styles.selectText}>Select Your Role</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.adminButton]}
            onPress={handleAdminLogin}
            disabled={loading}
          >
            <Text style={styles.buttonIcon}>👨‍💼</Text>
            <Text style={styles.buttonText}>Admin Dashboard</Text>
            <Text style={styles.buttonSubtext}>Manage center operations</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.parentButton]}
            onPress={handleParentLogin}
            disabled={loading}
          >
            <Text style={styles.buttonIcon}>👨‍👩‍👧‍👦</Text>
            <Text style={styles.buttonText}>Parent Dashboard</Text>
            <Text style={styles.buttonSubtext}>View your children&apos;s info</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Demo Mode - No authentication required
          </Text>
          <Text style={styles.footerSubtext}>
            ✅ Connected to Supabase
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  buttonContainer: {
    gap: 16,
  },
  selectText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  button: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  adminButton: {
    backgroundColor: colors.primary,
  },
  parentButton: {
    backgroundColor: colors.secondary,
  },
  buttonIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
});
