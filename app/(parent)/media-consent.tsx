
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { Child, MediaConsent } from '@/types/database.types';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

export default function MediaConsentScreen() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [consents, setConsents] = useState<MediaConsent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [childrenData, consentsData] = await Promise.all([
        supabase
          .from('children')
          .select('*')
          .eq('parent_id', user.user_id),
        supabase
          .from('media_consent')
          .select('*')
          .eq('parent_id', user.user_id),
      ]);

      if (childrenData.error) throw childrenData.error;
      if (consentsData.error) throw consentsData.error;

      setChildren(childrenData.data || []);
      setConsents(consentsData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getConsentForChild = (childId: string) => {
    return consents.find(c => c.child_id === childId);
  };

  const handleConsentToggle = async (childId: string, currentConsent: boolean, notes: string = '') => {
    if (!user) return;

    try {
      const existingConsent = getConsentForChild(childId);
      const newConsentValue = !currentConsent;

      if (existingConsent) {
        const { error } = await supabase
          .from('media_consent')
          .update({
            consent_granted: newConsentValue,
            consent_date: newConsentValue ? new Date().toISOString() : null,
            notes,
            updated_at: new Date().toISOString(),
          })
          .eq('consent_id', existingConsent.consent_id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('media_consent')
          .insert([{
            parent_id: user.user_id,
            child_id: childId,
            consent_granted: newConsentValue,
            consent_date: newConsentValue ? new Date().toISOString() : null,
            notes,
          }]);

        if (error) throw error;
      }

      Alert.alert(
        'Success',
        newConsentValue
          ? 'Media consent granted successfully'
          : 'Media consent revoked successfully'
      );
      loadData();
    } catch (error) {
      console.error('Error updating consent:', error);
      Alert.alert('Error', 'Failed to update consent');
    }
  };

  const showConsentDialog = (child: Child) => {
    const consent = getConsentForChild(child.child_id);
    const currentConsent = consent?.consent_granted || false;

    Alert.alert(
      currentConsent ? 'Revoke Media Consent' : 'Grant Media Consent',
      currentConsent
        ? `Are you sure you want to revoke media consent for ${child.first_name}? The school will no longer be able to share photos/videos of your child.`
        : `Do you grant permission for the school to take and share photos/videos of ${child.first_name} for educational purposes?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: currentConsent ? 'Revoke' : 'Grant',
          style: currentConsent ? 'destructive' : 'default',
          onPress: () => handleConsentToggle(child.child_id, currentConsent),
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <Text style={commonStyles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Media Consent</Text>
          <Text style={styles.subtitle}>
            Manage photo and video sharing permissions for your children
          </Text>
        </View>

        <View style={styles.infoCard}>
          <IconSymbol name="info.circle" size={24} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>About Media Consent</Text>
            <Text style={styles.infoText}>
              By granting consent, you allow the school to take photos and videos of your child
              during activities and share them securely with you through this app. You can revoke
              consent at any time.
            </Text>
          </View>
        </View>

        {children.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No children found</Text>
          </View>
        ) : (
          children.map((child) => {
            const consent = getConsentForChild(child.child_id);
            const hasConsent = consent?.consent_granted || false;

            return (
              <View key={child.child_id} style={commonStyles.cardWhite}>
                <View style={styles.childHeader}>
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>
                      {child.first_name} {child.last_name}
                    </Text>
                    <Text style={commonStyles.textSecondary}>
                      Age: {new Date().getFullYear() - new Date(child.dob).getFullYear()}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, hasConsent ? styles.statusBadgeActive : styles.statusBadgeInactive]}>
                    <Text style={[styles.statusText, hasConsent ? styles.statusTextActive : styles.statusTextInactive]}>
                      {hasConsent ? 'Granted' : 'Not Granted'}
                    </Text>
                  </View>
                </View>

                {consent?.consent_date && (
                  <Text style={styles.consentDate}>
                    Consent granted on: {new Date(consent.consent_date).toLocaleDateString()}
                  </Text>
                )}

                {consent?.notes && (
                  <Text style={styles.notes}>Notes: {consent.notes}</Text>
                )}

                <TouchableOpacity
                  style={[
                    buttonStyles.primary,
                    styles.consentButton,
                    hasConsent && styles.revokeButton,
                  ]}
                  onPress={() => showConsentDialog(child)}
                >
                  <Text style={styles.consentButtonText}>
                    {hasConsent ? 'Revoke Consent' : 'Grant Consent'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>Privacy & Security</Text>
          <Text style={styles.disclaimerText}>
            - All media is stored securely and only accessible to authorized parents and staff{'\n'}
            - Media will only be used for educational purposes{'\n'}
            - You can revoke consent at any time{'\n'}
            - Media of your child will be removed from sharing if consent is revoked
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  childHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: '#E8F5E9',
  },
  statusBadgeInactive: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#2E7D32',
  },
  statusTextInactive: {
    color: '#C62828',
  },
  consentDate: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  notes: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  consentButton: {
    marginTop: 8,
  },
  revokeButton: {
    backgroundColor: '#FF5252',
  },
  consentButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  disclaimerCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
