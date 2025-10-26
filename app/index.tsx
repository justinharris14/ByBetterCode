
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // If user is logged in, redirect based on role
  if (user) {
    if (user.role === 'admin') {
      return <Redirect href="/(admin)/dashboard" />;
    } else if (user.role === 'parent') {
      return <Redirect href="/(parent)/dashboard" />;
    }
  }

  // Default: go to login
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
