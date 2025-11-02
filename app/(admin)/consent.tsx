
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { Child, MediaConsent, User } from '@/types/database.types';

interface ChildWithConsent extends Child {
  consent?: MediaConsent;
  parent?: User;
}

export default function AdminConsentScreen() {
  const [children, setChildren] = useState<ChildWithConsent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState<MediaConsent | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'granted' | 'denied' | 'pending'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load all children with their parents
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .order('first_name', { ascending: true });

      if (childrenError) throw childrenError;

      // Load all parents
      const { data: parentsData, error: parentsError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'parent');

      if (parentsError) throw parentsError;

      // Load all consents
      const { data: consentsData, error: consentsError } = await supabase
        .from('media_consent')
        .select('*');

      if (consentsError) throw consentsError;

      // Combine data
      const parentsMap = new Map(parentsData?.map((p) => [p.user_id, p]) || []);
      const consentsMap = new Map(consentsData?.map((c) => [c.child_id, c]) || []);

      const combinedData: ChildWithConsent[] = (childrenData || []).map((child) => ({
        ...child,
        consent: consentsMap.get(child.child_id),
        parent: parentsMap.get(child.parent_id),
      }));

      setChildren(combinedData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load consent data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const viewDetails = (consent: MediaConsent) => {
    setSelectedConsent(consent);
    setDetailsModalVisible(true);
  };

  const getConsentStatus = (child: ChildWithConsent) => {
    if (!child.consent) {
      return { status: 'Pending', color: colors.textSecondary, icon: 'clock.fill' };
    }
    if (child.consent.consent_granted) {
      return { status: 'Granted', color: '#4CAF50', icon: 'checkmark.circle.fill' };
    }
    return { status: 'Denied', color: colors.accent, icon: 'xmark.circle.fill' };
  };

  const getFilteredChildren = () => {
    return children.filter((child) => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'pending') return !child.consent;
      if (filterStatus === 'granted') return child.consent?.consent_granted === true;
      if (filterStatus === 'denied') return child.consent?.consent_granted === false;
      return true;
    });
  };

  const getStats = () => {
    const total = children.length;
    const granted = children.filter((c) => c.consent?.consent_granted === true).length;
    const denied = children.filter((c) => c.consent?.consent_granted === false).length;
    const pending = children.filter((c) => !c.consent).length;
    return { total, granted, denied, pending };
  };

  const stats = getStats();
  const filteredChildren = getFilteredChildren();

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
          <Text style={styles.title}>Media Consent Management</Text>
          <Text style={styles.subtitle}>
            Track and manage parent consent for media usage
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Children</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{stats.granted}</Text>
            <Text style={styles.statLabel}>Granted</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
            <Text style={[styles.statNumber, { color: colors.accent }]}>{stats.denied}</Text>
            <Text style={styles.statLabel}>Denied</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={[styles.statNumber, { color: colors.textSecondary }]}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {(['all', 'granted', 'denied', 'pending'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                filterStatus === filter && styles.filterButtonActive,
              ]}
              onPress={() => setFilterStatus(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  filterStatus === filter && styles.filterTextActive,
                ]}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Children List */}
        {filteredChildren.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="doc.text.magnifyingglass" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No children match this filter</Text>
          </View>
        ) : (
          filteredChildren.map((child) => {
            const status = getConsentStatus(child);
            return (
              <View key={child.child_id} style={commonStyles.cardWhite}>
                <View style={styles.childRow}>
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>
                      {child.first_name} {child.last_name}
                    </Text>
                    <Text style={styles.parentName}>
                      Parent: {child.parent?.first_name} {child.parent?.last_name}
                    </Text>
                    <View style={styles.statusRow}>
                      <IconSymbol name={status.icon as any} size={16} color={status.color} />
                      <Text style={[styles.statusText, { color: status.color }]}>
                        {status.status}
                      </Text>
                    </View>
                    {child.consent && (
                      <>
                        <Text style={styles.detailText}>
                          Type: {child.consent.consent_type.charAt(0).toUpperCase() + child.consent.consent_type.slice(1)}
                        </Text>
                        {child.consent.usage_permissions && child.consent.usage_permissions.length > 0 && (
                          <Text style={styles.detailText}>
                            Permissions: {child.consent.usage_permissions.length} selected
                          </Text>
                        )}
                        {child.consent.consent_date && (
                          <Text style={styles.dateText}>
                            Signed: {new Date(child.consent.consent_date).toLocaleDateString()}
                          </Text>
                        )}
                      </>
                    )}
                  </View>
                  {child.consent && (
                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => viewDetails(child.consent!)}
                    >
                      <IconSymbol name="doc.text" size={20} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Details Modal */}
      <Modal visible={detailsModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Consent Details</Text>

              {selectedConsent && (
                <>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <Text style={[
                      styles.detailValue,
                      { color: selectedConsent.consent_granted ? '#4CAF50' : colors.accent }
                    ]}>
                      {selectedConsent.consent_granted ? 'Consent Granted' : 'Consent Denied'}
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Media Type</Text>
                    <Text style={styles.detailValue}>
                      {selectedConsent.consent_type.charAt(0).toUpperCase() + selectedConsent.consent_type.slice(1)}
                    </Text>
                  </View>

                  {selectedConsent.usage_permissions && selectedConsent.usage_permissions.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Usage Permissions</Text>
                      {selectedConsent.usage_permissions.map((permission) => (
                        <View key={permission} style={styles.permissionItem}>
                          <IconSymbol name="checkmark.circle.fill" size={16} color={colors.primary} />
                          <Text style={styles.permissionText}>
                            {permission.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {selectedConsent.special_conditions && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Special Conditions</Text>
                      <Text style={styles.detailValue}>{selectedConsent.special_conditions}</Text>
                    </View>
                  )}

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Digital Signature</Text>
                    <Text style={styles.signatureText}>{selectedConsent.signature_data}</Text>
                  </View>

                  {selectedConsent.consent_date && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Date Signed</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedConsent.consent_date).toLocaleString()}
                      </Text>
                    </View>
                  )}

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Last Updated</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedConsent.updated_at).toLocaleString()}
                    </Text>
                  </View>
                </>
              )}

              <TouchableOpacity
                style={[buttonStyles.primary, { marginTop: 20 }]}
                onPress={() => setDetailsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  filterButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.primary,
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
  childRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  parentName: {
    fontSize: 14,
    color: colors.textSecondary,
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
  detailText: {
    fontSize: 13,
    color: colors.text,
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  viewButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  permissionText: {
    fontSize: 15,
    color: colors.text,
    marginLeft: 8,
  },
  signatureText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    fontStyle: 'italic',
  },
  closeButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
