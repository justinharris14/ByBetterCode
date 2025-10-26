
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors, commonStyles } from '@/styles/commonStyles';

export default function Index() {
  const { user, loading, session } = useAuth();

  useEffect(() => {
    console.log('Index - Loading:', loading, 'User:', user?.email, 'Role:', user?.role);
  }, [loading, user]);

  if (loading) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <Text style={styles.logo}>🏫</Text>
        <Text style={styles.appName}>CrècheConnect</Text>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      </View>
    );
  }

  if (!session || !user) {
    return <Redirect href="/login" />;
  }

  if (user.role === 'admin') {
    return <Redirect href="/(admin)/dashboard" />;
  }

  if (user.role === 'parent') {
    return <Redirect href="/(parent)/dashboard" />;
  }

  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
  },
  loader: {
    marginTop: 20,
  },
});
