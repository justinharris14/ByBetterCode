import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, loading, clearStoredAuth } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Handles login logic with navigation
  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }

    const result = await signIn(email.trim().toLowerCase(), password);

    if (result.success) {
      console.log('✅ Sign in successful');
      
      // 🧠 Fix: result.user can be undefined or null, so handle both safely
      const user = result.user ?? null;

      if (user && user.role) {
        console.log(`Redirecting to ${user.role} dashboard...`);

        if (user.role === 'admin') {
          router.replace('/(admin)/dashboard'); // ✅ Admin dashboard
        } else if (user.role === 'parent') {
          router.replace('/(parent)/dashboard'); // ✅ Parent dashboard
        } else {
          Alert.alert('Unknown Role', 'Unable to determine user role.');
          router.replace('/login');
        }
      } else {
        console.log('⚠️ No role found on user object');
        router.replace('/login');
      }

    } else {
      Alert.alert(
        'Sign In Failed', 
        result.message || 'Invalid email or password. Please try again.'
      );
    }
  };

  const handleClearStoredAuth = () => {
    Alert.alert(
      'Clear Stored Authentication',
      'This will clear all stored login data and force you to login again. Use this if the app is stuck on a screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearStoredAuth();
            Alert.alert('Success', 'Stored authentication cleared. Please login again.');
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🏫</Text>
            <Text style={styles.title}>CrècheConnect</Text>
            <Text style={styles.subtitle}>Childcare Management System</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Welcome Back</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <IconSymbol
                    name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => router.push('/forgot-password')}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clearAuthButton}
              onPress={handleClearStoredAuth}
              disabled={loading}
            >
              <Text style={styles.clearAuthText}>🔧 Clear Stored Login Data</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>✅ Secure authentication with Supabase</Text>
            <Text style={styles.footerNote}>Contact your administrator for account access</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 60, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textSecondary },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 24, textAlign: 'center' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordInput: { flex: 1, padding: 12, fontSize: 16, color: colors.text },
  eyeButton: { padding: 12 },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { fontSize: 16, fontWeight: '700', color: colors.white },
  forgotPasswordButton: { alignItems: 'flex-end', marginTop: 8, marginBottom: 8 },
  forgotPasswordText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  clearAuthButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  clearAuthText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  footer: { marginTop: 24, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#4CAF50', textAlign: 'center', fontWeight: '600', marginBottom: 8 },
  footerNote: { fontSize: 12, color: colors.textSecondary, textAlign: 'center' },
});
