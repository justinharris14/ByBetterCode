
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { colors, commonStyles } from '@/styles/commonStyles';
import { Child } from '@/types/database.types';
import { IconSymbol } from '@/components/IconSymbol';

export default function ParentChildrenScreen() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadChildren();
    }
  }, [user]);

  const loadChildren = async () => {
    if (!user) return;

    try {
      console.log('Loading children for parent:', user.user_id);
      
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', user.user_id)
        .order('first_name', { ascending: true });

      if (error) {
        console.error('Error loading children:', error);
        return;
      }

      console.log('Children loaded:', data);
      setChildren(data || []);
    } catch (error) {
      console.error('Error in loadChildren:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChildren();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Children</Text>
          <Text style={styles.subtitle}>
            {children.length} {children.length === 1 ? 'child' : 'children'} enrolled
          </Text>
        </View>

        {children.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👶</Text>
            <Text style={styles.emptyText}>No children found</Text>
            <Text style={styles.emptySubtext}>
              Contact the administrator to add your children
            </Text>
          </View>
        ) : (
          <View style={styles.childrenList}>
            {children.map((child) => (
              <View key={child.child_id} style={styles.childCard}>
                <View style={styles.childHeader}>
                  <View style={styles.childAvatar}>
                    <Text style={styles.childAvatarText}>
                      {child.first_name.charAt(0)}{child.last_name.charAt(0)}
                    </Text>
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

                <View style={styles.childDetails}>
                  <View style={styles.detailRow}>
                    <IconSymbol name="cake" size={20} color={colors.textSecondary} />
                    <Text style={styles.detailLabel}>Date of Birth:</Text>
                    <Text style={styles.detailValue}>{formatDate(child.dob)}</Text>
                  </View>

                  {child.allergies && (
                    <View style={styles.detailRow}>
                      <IconSymbol name="warning" size={20} color="#FF9800" />
                      <Text style={styles.detailLabel}>Allergies:</Text>
                      <Text style={[styles.detailValue, styles.warningText]}>
                        {child.allergies}
                      </Text>
                    </View>
                  )}

                  {child.medical_info && (
                    <View style={styles.detailRow}>
                      <IconSymbol name="medical.services" size={20} color={colors.primary} />
                      <Text style={styles.detailLabel}>Medical Info:</Text>
                      <Text style={styles.detailValue}>{child.medical_info}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  childrenList: {
    padding: 20,
    gap: 16,
  },
  childCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  childAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
  },
  childInfo: {
    marginLeft: 16,
    flex: 1,
  },
  childName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  childAge: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  childDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  detailValue: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  warningText: {
    color: '#FF9800',
    fontWeight: '600',
  },
});
