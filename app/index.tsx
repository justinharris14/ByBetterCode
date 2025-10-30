
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // If user is authenticated, redirect based on role
  if (user) {
    console.log('Index: User authenticated, role:', user.role);
    if (user.role === 'admin') {
      return <Redirect href="/(admin)/dashboard" />;
    } else if (user.role === 'parent') {
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
});
