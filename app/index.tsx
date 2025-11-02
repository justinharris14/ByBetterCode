import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';

export default function Index() {
  const { user, loading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 🌀 Fade-in animation for the splash
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // 🧩 Show branded splash while verifying authentication
  if (loading) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Text style={styles.logo}>🏫</Text>
        <Text style={styles.title}>CrècheConnect</Text>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        <Text style={styles.loadingText}>Loading your experience...</Text>
      </Animated.View>
    );
  }

  // ✅ Redirect based on role when authenticated
  if (user) {
    console.log('Index: User authenticated, role:', user.role);
    const userRole = user.role?.toLowerCase();

    switch (userRole) {
      case 'admin':
        console.log('Index: Redirecting to admin dashboard');
        return <Redirect href="/(admin)/dashboard" />;

      case 'parent':
        console.log('Index: Redirecting to parent dashboard');
        return <Redirect href="/(parent)/dashboard" />;

      default:
        console.log('Index: Unknown role detected, redirecting to login');
        return <Redirect href="/login" />;
    }
  }

  // ❌ No user session → Go to login
  console.log('Index: No user session, redirecting to login');
  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 32,
  },
  loader: {
    marginTop: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
});
