
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
import { useRouter } from 'expo-router';

interface DashboardStats {
  totalChildren: number;
  totalEvents: number;
  attendanceRate: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalChildren: 0,
    totalEvents: 0,
    attendanceRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [childrenData, eventsData, attendanceData] = await Promise.all([
        supabase.from('children').select('child_id', { count: 'exact' }),
        supabase.from('events').select('event_id', { count: 'exact' }),
        supabase.from('attendance').select('is_present').eq('date', today),
      ]);

      const totalChildren = childrenData.count || 0;
      const totalEvents = eventsData.count || 0;
      const attendanceRecords = attendanceData.data || [];
      const presentCount = attendanceRecords.filter(a => a.is_present).length;
      const attendanceRate = totalChildren > 0 
        ? Math.round((presentCount / totalChildren) * 100) 
        : 0;

      setStats({
        totalChildren,
        totalEvents,
        attendanceRate,
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
            <Text style={styles.subtitle}>Admin Dashboard</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <IconSymbol name="arrow.right.square" size={24} color={colors.accent} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <IconSymbol name="people" size={32} color={colors.primary} />
            <Text style={styles.statValue}>{stats.totalChildren}</Text>
            <Text style={styles.statLabel}>Total Children</Text>
          </View>

          <View style={styles.statCard}>
            <IconSymbol name="event" size={32} color={colors.secondary} />
            <Text style={styles.statValue}>{stats.totalEvents}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>

          <View style={styles.statCard}>
            <IconSymbol name="check.circle" size={32} color={colors.success} />
            <Text style={styles.statValue}>{stats.attendanceRate}%</Text>
            <Text style={styles.statLabel}>Attendance Rate</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/children')}
          >
            <IconSymbol name="people" size={24} color={colors.primary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Manage Children</Text>
              <Text style={styles.actionDescription}>Add, edit, or view children</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/attendance')}
          >
            <IconSymbol name="check.circle" size={24} color={colors.success} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Mark Attendance</Text>
              <Text style={styles.actionDescription}>Record daily attendance</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/events')}
          >
            <IconSymbol name="event" size={24} color={colors.secondary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Manage Events</Text>
              <Text style={styles.actionDescription}>Create and manage events</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/announcements')}
          >
            <IconSymbol name="megaphone" size={24} color={colors.accent} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Announcements</Text>
              <Text style={styles.actionDescription}>Post updates for parents</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/media')}
          >
            <IconSymbol name="photo" size={24} color={colors.primary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Media Gallery</Text>
              <Text style={styles.actionDescription}>Upload and manage photos</Text>
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
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
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
