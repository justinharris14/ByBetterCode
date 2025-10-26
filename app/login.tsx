
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';

export default function LoginScreen() {
  const router = useRouter();

  const handleRoleSelection = (role: 'admin' | 'parent') => {
    console.log(`Selected role: ${role}`);
    
    if (role === 'admin') {
      router.replace('/(admin)/dashboard');
    } else {
      router.replace('/(parent)/dashboard');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        <Text style={styles.logo}>🏫</Text>
        <Text style={styles.appName}>CrècheConnect</Text>
        <Text style={styles.tagline}>Connecting Care, Building Trust</Text>

        <View style={styles.form}>
          <Text style={styles.selectTitle}>Select Your Role</Text>
          <Text style={styles.selectSubtitle}>
            Choose how you want to access the app
          </Text>

          <TouchableOpacity
            style={[buttonStyles.primary, styles.roleButton]}
            onPress={() => handleRoleSelection('admin')}
          >
            <Text style={styles.roleIcon}>👩‍💼</Text>
            <View style={styles.roleTextContainer}>
              <Text style={styles.roleButtonTitle}>Admin Dashboard</Text>
              <Text style={styles.roleButtonSubtitle}>
                Manage children, attendance, events & more
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.primary, styles.roleButton, styles.parentButton]}
            onPress={() => handleRoleSelection('parent')}
          >
            <Text style={styles.roleIcon}>👨‍👩‍👧</Text>
            <View style={styles.roleTextContainer}>
              <Text style={styles.roleButtonTitle}>Parent Dashboard</Text>
              <Text style={styles.roleButtonSubtitle}>
                View your children, attendance & payments
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ℹ️ Demo Mode: Authentication is temporarily disabled for testing
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
    backgroundColor: colors.background,
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
  selectTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  selectSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
    minHeight: 100,
  },
  parentButton: {
    backgroundColor: colors.secondary,
  },
  roleIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleButtonTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  roleButtonSubtitle: {
    color: colors.white,
    fontSize: 13,
    opacity: 0.9,
  },
  infoBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
