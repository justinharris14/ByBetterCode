
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

interface ParentStats {
  childrenCount: number;
  upcomingEvents: number;
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ParentStats>({
    childrenCount: 0,
    upcomingEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      const now = new Date().toISOString();

      const [childrenData, eventsData] = await Promise.all([
        supabase
          .from('children')
          .select('child_id', { count: 'exact' })
          .eq('parent_id', user.user_id),
        supabase
          .from('events')
          .select('event_id', { count: 'exact' })
          .gte('event_datetime', now),
      ]);

      setStats({
        childrenCount: childrenData.count || 0,
        upcomingEvents: eventsData.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const handleSignOut = () => {
    router.replace('/login');
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
          <View>
            <Text style={styles.greeting}>Welcome Back!</Text>
            <Text style={styles.subtitle}>
              {user?.first_name} {user?.last_name}
            </Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <IconSymbol name="arrow.right.square" size={24} color={colors.accent} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <IconSymbol name="people" size={32} color={colors.primary} />
            <Text style={styles.statValue}>{stats.childrenCount}</Text>
            <Text style={styles.statLabel}>My Children</Text>
          </View>

          <View style={styles.statCard}>
            <IconSymbol name="event" size={32} color={colors.secondary} />
            <Text style={styles.statValue}>{stats.upcomingEvents}</Text>
            <Text style={styles.statLabel}>Upcoming Events</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(parent)/children')}
          >
            <IconSymbol name="people" size={24} color={colors.primary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>My Children</Text>
              <Text style={styles.actionDescription}>View children profiles</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(parent)/attendance')}
          >
            <IconSymbol name="check.circle" size={24} color={colors.success} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Attendance</Text>
              <Text style={styles.actionDescription}>View attendance history</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(parent)/events')}
          >
            <IconSymbol name="event" size={24} color={colors.secondary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Events</Text>
              <Text style={styles.actionDescription}>View upcoming events</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(parent)/announcements')}
          >
            <IconSymbol name="megaphone" size={24} color={colors.accent} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Announcements</Text>
              <Text style={styles.actionDescription}>Read school updates</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(parent)/media')}
          >
            <IconSymbol name="photo" size={24} color={colors.primary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Media Gallery</Text>
              <Text style={styles.actionDescription}>View photos and videos</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  signOutButton: {
    padding: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  quickActions: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionContent: {
    flex: 1,
    marginLeft: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  actionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
