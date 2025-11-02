
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';

interface DemoAccount {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'admin' | 'parent';
}

const demoAccounts: DemoAccount[] = [
  {
    email: 'admin@crecheconnect.com',
    password: 'admin123',
    first_name: 'Lindiwe',
    last_name: 'Mkhize',
    phone: '+27123456789',
    role: 'admin',
  },
  {
    email: 'thabo@example.com',
    password: 'parent123',
    first_name: 'Thabo',
    last_name: 'Dlamini',
    phone: '+27123456780',
    role: 'parent',
  },
  {
    email: 'naledi@example.com',
    password: 'parent123',
    first_name: 'Naledi',
    last_name: 'Khumalo',
    phone: '+27123456781',
    role: 'parent',
  },
];

export default function SetupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);

  const addProgress = (message: string) => {
    console.log(message);
    setProgress((prev) => [...prev, message]);
  };

  const createDemoAccounts = async () => {
    setLoading(true);
    setProgress([]);
    
    try {
      addProgress('Starting demo account creation...');
      addProgress('');

      let successCount = 0;
      let alreadyExistsCount = 0;
      let errorCount = 0;

      for (const account of demoAccounts) {
        try {
          addProgress(`Creating ${account.role}: ${account.email}...`);

          // Attempt to create auth user
          const { data, error } = await supabase.auth.signUp({
            email: account.email,
            password: account.password,
            options: {
              data: {
                first_name: account.first_name,
                last_name: account.last_name,
                phone: account.phone,
                role: account.role,
              },
              emailRedirectTo: 'https://crecheconnect.app/email-confirmed'
            },
          });

          if (error) {
            if (error.message.includes('already registered') || 
                error.message.includes('already been registered')) {
              addProgress(`  ✓ ${account.email} already exists`);
              alreadyExistsCount++;
            } else {
              addProgress(`  ✗ Error: ${error.message}`);
              errorCount++;
            }
          } else if (data?.user) {
            addProgress(`  ✓ Successfully created ${account.email}`);
            successCount++;
          } else {
            addProgress(`  ⚠ Unknown response for ${account.email}`);
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err: any) {
          addProgress(`  ✗ Error with ${account.email}: ${err.message}`);
          errorCount++;
        }
      }

      addProgress('');
      addProgress('═══════════════════════════════');
      addProgress('Setup Summary:');
      addProgress(`  ✓ Created: ${successCount}`);
      addProgress(`  ⚠ Already existed: ${alreadyExistsCount}`);
      addProgress(`  ✗ Errors: ${errorCount}`);
      addProgress('═══════════════════════════════');
      addProgress('');

      if (successCount > 0 || alreadyExistsCount > 0) {
        addProgress('You can now login with:');
        addProgress('  Admin: admin@crecheconnect.com / admin123');
        addProgress('  Parent: thabo@example.com / parent123');
        addProgress('');
        
        if (successCount > 0) {
          addProgress('⚠ IMPORTANT: Check your email to verify accounts');
          addProgress('Or disable email verification in Supabase settings');
        }

        Alert.alert(
          'Setup Complete',
          `${successCount + alreadyExistsCount} account(s) ready. ${successCount > 0 ? 'Check your email to verify new accounts, or disable email verification in Supabase settings.' : 'You can now login.'}`,
          [
            {
              text: 'Go to Login',
              onPress: () => router.replace('/login'),
            },
          ]
        );
      } else {
        addProgress('⚠ No accounts were created successfully.');
        addProgress('Please try manual setup via Supabase Dashboard.');
        
        Alert.alert(
          'Setup Issues',
          'No accounts were created. Please use manual setup via Supabase Dashboard. See SETUP_INSTRUCTIONS.md for details.',
          [
            {
              text: 'Go to Login',
              onPress: () => router.replace('/login'),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Setup error:', error);
      addProgress('');
      addProgress(`✗ Fatal error: ${error.message}`);
      Alert.alert('Setup Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={commonStyles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🏫 CrècheConnect Setup</Text>
      <Text style={styles.subtitle}>
        Create demo accounts to get started with the app
      </Text>

      <View style={styles.accountsCard}>
        <Text style={styles.cardTitle}>Demo Accounts to Create:</Text>
        {demoAccounts.map((account, index) => (
          <View key={index} style={styles.accountItem}>
            <Text style={styles.accountRole}>
              {account.role === 'admin' ? '👩‍💼' : '👨‍👩‍👧'} {account.role.toUpperCase()}
            </Text>
            <Text style={styles.accountEmail}>{account.email}</Text>
            <Text style={styles.accountPassword}>Password: {account.password}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[buttonStyles.primary, loading && styles.buttonDisabled]}
        onPress={createDemoAccounts}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>Create Demo Accounts</Text>
        )}
      </TouchableOpacity>

      {progress.length > 0 && (
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Progress:</Text>
          <ScrollView style={styles.progressScroll} nestedScrollEnabled>
            {progress.map((message, index) => (
              <Text key={index} style={styles.progressMessage}>
                {message}
              </Text>
            ))}
          </ScrollView>
        </View>
      )}

      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => router.replace('/login')}
        disabled={loading}
      >
        <Text style={styles.skipButtonText}>Skip to Login</Text>
      </TouchableOpacity>

      <View style={styles.helpCard}>
        <Text style={styles.helpTitle}>💡 Need Help?</Text>
        <Text style={styles.helpText}>
          If automatic setup fails, you can manually create users in the Supabase Dashboard.
          See SETUP_INSTRUCTIONS.md for detailed steps.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  accountsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  accountItem: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  accountRole: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  accountEmail: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  accountPassword: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  progressCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    maxHeight: 300,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  progressScroll: {
    maxHeight: 250,
  },
  progressMessage: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  skipButton: {
    marginTop: 24,
    padding: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  helpCard: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
