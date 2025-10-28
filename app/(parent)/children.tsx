
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { Child } from '@/types/database.types';

export default function ParentChildrenScreen() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadChildren = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', user.user_id)
        .order('first_name', { ascending: true });

      if (error) throw error;
      setChildren(data || []);
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadChildren();
    }
  }, [user, loadChildren]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChildren();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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
      <View style={styles.header}>
        <Text style={styles.title}>My Children</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {children.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="figure.2.and.child.holdinghands" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No children registered</Text>
          </View>
        ) : (
          children.map((child) => (
            <View key={child.child_id} style={styles.childCard}>
              <View style={styles.childHeader}>
                <View style={styles.childAvatar}>
                  <IconSymbol name="person.fill" size={32} color={colors.primary} />
                </View>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>
                    {child.first_name} {child.last_name}
                  </Text>
                  <Text style={styles.childAge}>
                    {calculateAge(child.dob)} years old
                  </Text>
                </View>
              </View>

              <View style={styles.detailsSection}>
                <View style={styles.detailRow}>
                  <IconSymbol name="calendar" size={18} color={colors.textSecondary} />
                  <Text style={styles.detailLabel}>Date of Birth:</Text>
                  <Text style={styles.detailValue}>{formatDate(child.dob)}</Text>
                </View>

                {child.gender && (
                  <View style={styles.detailRow}>
                    <IconSymbol name="person" size={18} color={colors.textSecondary} />
                    <Text style={styles.detailLabel}>Gender:</Text>
                    <Text style={styles.detailValue}>
                      {child.gender.charAt(0).toUpperCase() + child.gender.slice(1)}
                    </Text>
                  </View>
                )}

                {child.allergies && (
                  <View style={styles.detailRow}>
                    <IconSymbol name="exclamationmark.triangle" size={18} color={colors.accent} />
                    <Text style={styles.detailLabel}>Allergies:</Text>
                    <Text style={styles.detailValue}>{child.allergies}</Text>
                  </View>
                )}

                {child.medical_info && (
                  <View style={styles.detailRow}>
                    <IconSymbol name="cross.case" size={18} color={colors.textSecondary} />
                    <Text style={styles.detailLabel}>Medical Info:</Text>
                    <Text style={styles.detailValue}>{child.medical_info}</Text>
                  </View>
                )}

                {child.dietary_restrictions && (
                  <View style={styles.detailRow}>
                    <IconSymbol name="fork.knife" size={18} color={colors.textSecondary} />
                    <Text style={styles.detailLabel}>Dietary:</Text>
                    <Text style={styles.detailValue}>{child.dietary_restrictions}</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingBottom: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 140,
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
  childCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  childAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  childAge: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailsSection: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    minWidth: 100,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
});
