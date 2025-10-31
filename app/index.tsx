
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.logo}>🏫</Text>
        <Text style={styles.title}>CrècheConnect</Text>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If user is authenticated, redirect based on role
  if (user) {
    console.log('Index: User authenticated, role:', user.role);
    
    // Check user role from metadata or user object
    const userRole = user.role;
    
    if (userRole === 'admin') {
      console.log('Index: Redirecting to admin dashboard');
      return <Redirect href="/(admin)/dashboard" />;
    } else if (userRole === 'parent') {
      console.log('Index: Redirecting to parent dashboard');
      return <Redirect href="/(parent)/dashboard" />;
    }
  }

  // If not authenticated, redirect to login
  console.log('Index: No user, redirecting to login');
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
