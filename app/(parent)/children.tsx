
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Child } from '@/types/database.types';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';

export default function ParentChildrenScreen() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadChildren();
  }, [user]);

  const loadChildren = async () => {
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
      Alert.alert('Error', 'Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChildren();
    setRefreshing(false);
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
        {children.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No children registered</Text>
          </View>
        ) : (
          children.map((child) => (
            <View key={child.child_id} style={commonStyles.cardWhite}>
              <Text style={styles.childName}>
                {child.first_name} {child.last_name}
              </Text>
              <Text style={commonStyles.textSecondary}>
                Date of Birth: {new Date(child.dob).toLocaleDateString()}
              </Text>
              {child.allergies && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>⚠️ Allergies:</Text>
                  <Text style={styles.infoText}>{child.allergies}</Text>
                </View>
              )}
              {child.medical_info && (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>🏥 Medical Information:</Text>
                  <Text style={styles.infoText}>{child.medical_info}</Text>
                </View>
              )}
            </View>
          ))
        )}
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
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  childName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  infoSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
