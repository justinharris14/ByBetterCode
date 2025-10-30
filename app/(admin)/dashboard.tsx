
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user, signOut } = useAuth();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      const [childrenData, eventsData, attendanceData] = await Promise.all([
        supabase.from('children').select('child_id', { count: 'exact' }),
        supabase
          .from('events')
          .select('event_id', { count: 'exact' })
          .gte('event_datetime', now),
        supabase.from('attendance').select('*').eq('date', today),
      ]);

      const totalChildren = childrenData.count || 0;
      const totalEvents = eventsData.count || 0;
      const attendanceRecords = attendanceData.data || [];
      const presentCount = attendanceRecords.filter((a) => a.is_present).length;
      const attendanceRate =
        attendanceRecords.length > 0
          ? Math.round((presentCount / attendanceRecords.length) * 100)
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
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        },
      },
    ]);
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
            <Text style={styles.greeting}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>
              Welcome, {user?.first_name} {user?.last_name}
            </Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <IconSymbol name="figure.2.and.child.holdinghands" size={32} color={colors.primary} />
            <Text style={styles.statValue}>{stats.totalChildren}</Text>
            <Text style={styles.statLabel}>Total Children</Text>
          </View>

          <View style={styles.statCard}>
            <IconSymbol name="calendar" size={32} color={colors.secondary} />
            <Text style={styles.statValue}>{stats.totalEvents}</Text>
            <Text style={styles.statLabel}>Upcoming Events</Text>
          </View>

          <View style={styles.statCard}>
            <IconSymbol name="checkmark.circle.fill" size={32} color={colors.success} />
            <Text style={styles.statValue}>{stats.attendanceRate}%</Text>
            <Text style={styles.statLabel}>Attendance Today</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/parents')}
          >
            <IconSymbol name="person.2.fill" size={24} color={colors.primary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Manage Parents</Text>
              <Text style={styles.actionDescription}>Add or edit parent information</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/children')}
          >
            <IconSymbol name="figure.2.and.child.holdinghands" size={24} color={colors.primary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Manage Children</Text>
              <Text style={styles.actionDescription}>Add or edit child profiles</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/staff')}
          >
            <IconSymbol name="person.badge.key.fill" size={24} color={colors.secondary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Manage Staff</Text>
              <Text style={styles.actionDescription}>Add or edit staff members</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/attendance')}
          >
            <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
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
            <IconSymbol name="calendar" size={24} color={colors.secondary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Manage Events</Text>
              <Text style={styles.actionDescription}>Create and schedule events</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/announcements')}
          >
            <IconSymbol name="megaphone.fill" size={24} color={colors.accent} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Post Announcements</Text>
              <Text style={styles.actionDescription}>Share updates with parents</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/consent')}
          >
            <IconSymbol name="doc.text.fill" size={24} color="#FF9800" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Media Consent</Text>
              <Text style={styles.actionDescription}>Manage parent consent forms</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/media')}
          >
            <IconSymbol name="photo.fill" size={24} color={colors.primary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Media Gallery</Text>
              <Text style={styles.actionDescription}>Upload photos and videos</Text>
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
    paddingBottom: 140,
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
