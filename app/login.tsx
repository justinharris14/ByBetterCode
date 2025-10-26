
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      console.log('Login successful');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (role: 'admin' | 'parent') => {
    if (role === 'admin') {
      setEmail('admin@crecheconnect.com');
      setPassword('admin123');
    } else {
      setEmail('thabo@example.com');
      setPassword('parent123');
    }
  };

  return (
    <KeyboardAvoidingView
      style={commonStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.logo}>🏫</Text>
          <Text style={styles.appName}>CrècheConnect</Text>
          <Text style={styles.tagline}>Connecting Care, Building Trust</Text>

          <View style={styles.form}>
            <TextInput
              style={commonStyles.input}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />

            <TextInput
              style={commonStyles.input}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />

            <TouchableOpacity
              style={[buttonStyles.primary, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>Demo Accounts:</Text>
              <View style={styles.demoButtons}>
                <TouchableOpacity
                  style={styles.demoButton}
                  onPress={() => fillDemoCredentials('admin')}
                  disabled={loading}
                >
                  <Text style={styles.demoButtonText}>👩‍💼 Admin</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.demoButton}
                  onPress={() => fillDemoCredentials('parent')}
                  disabled={loading}
                >
                  <Text style={styles.demoButtonText}>👨‍👩‍👧 Parent</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 40,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  buttonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  demoSection: {
    marginTop: 32,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  demoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  demoButton: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  demoButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
