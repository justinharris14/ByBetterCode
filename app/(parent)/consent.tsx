
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  TextInput,
  Switch,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { Child, MediaConsent, ConsentType, UsagePermission } from '@/types/database.types';

export default function ConsentScreen() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [consents, setConsents] = useState<Record<string, MediaConsent>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedChild, setExpandedChild] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      // Load children
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', user.user_id)
        .order('first_name', { ascending: true });

      if (childrenError) throw childrenError;
      setChildren(childrenData || []);

      // Load existing consents
      const { data: consentsData, error: consentsError } = await supabase
        .from('media_consent')
        .select('*')
        .eq('parent_id', user.user_id);

      if (consentsError) throw consentsError;

      const consentsMap: Record<string, MediaConsent> = {};
      (consentsData || []).forEach((consent) => {
        consentsMap[consent.child_id] = consent;
      });
      setConsents(consentsMap);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load consent forms');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const toggleChild = (childId: string) => {
    setExpandedChild(expandedChild === childId ? null : childId);
  };

  const getConsentStatus = (childId: string) => {
    const consent = consents[childId];
    if (!consent) return { status: 'Not Submitted', color: colors.textSecondary, icon: 'exclamationmark.circle' };
    if (consent.consent_granted) return { status: 'Consent Granted', color: '#4CAF50', icon: 'checkmark.circle.fill' };
    return { status: 'Consent Denied', color: colors.accent, icon: 'xmark.circle.fill' };
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
          <Text style={styles.title}>Media Consent Forms</Text>
          <Text style={styles.subtitle}>
            Manage photo and video permissions for your children
          </Text>
        </View>

        {children.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="person.crop.circle.badge.questionmark" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No children registered</Text>
          </View>
        ) : (
          children.map((child) => {
            const consentStatus = getConsentStatus(child.child_id);
            const isExpanded = expandedChild === child.child_id;
            const consent = consents[child.child_id];

            return (
              <View key={child.child_id} style={commonStyles.cardWhite}>
                <TouchableOpacity
                  style={styles.childHeader}
                  onPress={() => toggleChild(child.child_id)}
                >
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>
                      {child.first_name} {child.last_name}
                    </Text>
                    <View style={styles.statusRow}>
                      <IconSymbol name={consentStatus.icon as any} size={16} color={consentStatus.color} />
                      <Text style={[styles.statusText, { color: consentStatus.color }]}>
                        {consentStatus.status}
                      </Text>
                    </View>
                    {consent?.consent_date && (
                      <Text style={styles.dateText}>
                        Last updated: {new Date(consent.consent_date).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  <IconSymbol
                    name={isExpanded ? 'chevron.up' : 'chevron.down'}
                    size={24}
                    color={colors.primary}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <ConsentForm
                    child={child}
                    existingConsent={consent}
                    onSave={loadData}
                  />
                )}
              </View>
            );
          })
        )}

        <View style={styles.infoBox}>
          <IconSymbol name="info.circle.fill" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            These consent forms allow CrècheConnect to capture and share photos/videos of your child during activities. 
            You can update your preferences at any time.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

interface ConsentFormProps {
  child: Child;
  existingConsent?: MediaConsent;
  onSave: () => void;
}

function ConsentForm({ child, existingConsent, onSave }: ConsentFormProps) {
  const { user } = useAuth();
  const [consentGranted, setConsentGranted] = useState(existingConsent?.consent_granted || false);
  const [consentType, setConsentType] = useState<ConsentType>(existingConsent?.consent_type || 'both');
  const [usagePermissions, setUsagePermissions] = useState<UsagePermission[]>(
    existingConsent?.usage_permissions || []
  );
  const [specialConditions, setSpecialConditions] = useState(existingConsent?.special_conditions || '');
  const [signatureName, setSignatureName] = useState(existingConsent?.signature_data || '');
  const [saving, setSaving] = useState(false);

  const toggleUsagePermission = (permission: UsagePermission) => {
    if (usagePermissions.includes(permission)) {
      setUsagePermissions(usagePermissions.filter((p) => p !== permission));
    } else {
      setUsagePermissions([...usagePermissions, permission]);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (consentGranted && !signatureName.trim()) {
      Alert.alert('Required', 'Please enter your full name as a digital signature');
      return;
    }

    if (consentGranted && usagePermissions.length === 0) {
      Alert.alert('Required', 'Please select at least one usage permission');
      return;
    }

    setSaving(true);
    try {
      const consentData = {
        child_id: child.child_id,
        parent_id: user.user_id,
        consent_granted: consentGranted,
        consent_date: new Date().toISOString(),
        consent_type: consentType,
        usage_permissions: consentGranted ? usagePermissions : [],
        special_conditions: specialConditions.trim() || null,
        signature_data: signatureName.trim(),
      };

      if (existingConsent) {
        const { error } = await supabase
          .from('media_consent')
          .update(consentData)
          .eq('consent_id', existingConsent.consent_id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('media_consent')
          .insert([consentData]);

        if (error) throw error;
      }

      Alert.alert('Success', 'Consent form saved successfully');
      onSave();
    } catch (error) {
      console.error('Error saving consent:', error);
      Alert.alert('Error', 'Failed to save consent form');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.divider} />

      {/* Consent Toggle */}
      <View style={styles.formSection}>
        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            <Text style={styles.formLabel}>Grant Media Consent</Text>
            <Text style={styles.formHint}>
              Allow photos/videos of {child.first_name} to be taken
            </Text>
          </View>
          <Switch
            value={consentGranted}
            onValueChange={setConsentGranted}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      {consentGranted && (
        <>
          {/* Media Type Selection */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Media Type</Text>
            <View style={styles.optionsGrid}>
              {(['photos', 'videos', 'both'] as ConsentType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.optionButton,
                    consentType === type && styles.optionButtonActive,
                  ]}
                  onPress={() => setConsentType(type)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      consentType === type && styles.optionTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Usage Permissions */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Usage Permissions *</Text>
            <Text style={styles.formHint}>Select where media can be used</Text>
            
            {[
              { value: 'internal' as UsagePermission, label: 'Internal Use Only', desc: 'Shared only with parents via app' },
              { value: 'website' as UsagePermission, label: 'School Website', desc: 'Featured on CrècheConnect website' },
              { value: 'social_media' as UsagePermission, label: 'Social Media', desc: 'Posted on school social media' },
              { value: 'promotional' as UsagePermission, label: 'Promotional Materials', desc: 'Used in brochures, flyers, etc.' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.checkboxRow}
                onPress={() => toggleUsagePermission(option.value)}
              >
                <View style={styles.checkbox}>
                  {usagePermissions.includes(option.value) && (
                    <IconSymbol name="checkmark" size={16} color={colors.primary} />
                  )}
                </View>
                <View style={styles.checkboxLabel}>
                  <Text style={styles.checkboxText}>{option.label}</Text>
                  <Text style={styles.checkboxDesc}>{option.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Special Conditions */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Special Conditions (Optional)</Text>
            <Text style={styles.formHint}>
              Any specific restrictions or requirements
            </Text>
            <TextInput
              style={[commonStyles.input, styles.textArea]}
              placeholder="E.g., No close-up photos, only group photos, etc."
              placeholderTextColor={colors.textSecondary}
              value={specialConditions}
              onChangeText={setSpecialConditions}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Digital Signature */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Digital Signature *</Text>
            <Text style={styles.formHint}>Enter your full name to sign</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Full Name"
              placeholderTextColor={colors.textSecondary}
              value={signatureName}
              onChangeText={setSignatureName}
            />
          </View>
        </>
      )}

      {!consentGranted && (
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Digital Signature *</Text>
          <Text style={styles.formHint}>Enter your full name to confirm denial</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Full Name"
            placeholderTextColor={colors.textSecondary}
            value={signatureName}
            onChangeText={setSignatureName}
          />
        </View>
      )}

      {/* Save Button */}
      <TouchableOpacity
        style={[buttonStyles.primary, saving && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? 'Saving...' : existingConsent ? 'Update Consent' : 'Submit Consent'}
        </Text>
      </TouchableOpacity>

      {/* Legal Notice */}
      <View style={styles.legalNotice}>
        <Text style={styles.legalText}>
          By submitting this form, you acknowledge that you have read and understood the media consent policy. 
          You may update or revoke consent at any time.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  childHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  formContainer: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  formHint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  optionButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  optionTextActive: {
    color: colors.primary,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxLabel: {
    flex: 1,
  },
  checkboxText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  checkboxDesc: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  saveButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  legalNotice: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
  },
  legalText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    marginTop: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginLeft: 12,
  },
});
