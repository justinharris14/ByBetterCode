
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  totalChildren: number;
  totalEvents: number;
  paymentsDue: number;
  attendanceRate: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalChildren: 0,
    totalEvents: 0,
    paymentsDue: 0,
    attendanceRate: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      console.log('Loading dashboard stats...');

      // Get total children count
      const { count: childrenCount, error: childrenError } = await supabase
        .from('children')
        .select('*', { count: 'exact', head: true });

      if (childrenError) {
        console.error('Error loading children count:', childrenError);
      }

      // Get upcoming events count
      const { count: eventsCount, error: eventsError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('event_datetime', new Date().toISOString());

      if (eventsError) {
        console.error('Error loading events count:', eventsError);
      }

      // Get pending payments count
      const { count: paymentsCount, error: paymentsError } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (paymentsError) {
        console.error('Error loading payments count:', paymentsError);
      }

      // Calculate attendance rate for today
      const today = new Date().toISOString().split('T')[0];
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('is_present')
        .eq('date', today);

      if (attendanceError) {
        console.error('Error loading attendance:', attendanceError);
      }

      let attendanceRate = 0;
      if (attendanceData && attendanceData.length > 0) {
        const presentCount = attendanceData.filter(a => a.is_present).length;
        attendanceRate = Math.round((presentCount / attendanceData.length) * 100);
      }

      setStats({
        totalChildren: childrenCount || 0,
        totalEvents: eventsCount || 0,
        paymentsDue: paymentsCount || 0,
        attendanceRate: attendanceRate,
      });

      console.log('Stats loaded successfully:', {
        totalChildren: childrenCount,
        totalEvents: eventsCount,
        paymentsDue: paymentsCount,
        attendanceRate,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const handleSignOut = () => {
    console.log('Signing out');
    router.replace('/login');
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
          <View>
            <Text style={styles.greeting}>Welcome Back! 👋</Text>
            <Text style={styles.subGreeting}>Admin Dashboard</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <IconSymbol name="exit-to-app" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <IconSymbol name="people" size={32} color={colors.white} />
            <Text style={styles.statValue}>{stats.totalChildren}</Text>
            <Text style={styles.statLabel}>Total Children</Text>
          </View>

          <View style={[styles.statCard, styles.statCardSecondary]}>
            <IconSymbol name="event" size={32} color={colors.white} />
            <Text style={styles.statValue}>{stats.totalEvents}</Text>
            <Text style={styles.statLabel}>Upcoming Events</Text>
          </View>

          <View style={[styles.statCard, styles.statCardWarning]}>
            <IconSymbol name="payment" size={32} color={colors.white} />
            <Text style={styles.statValue}>{stats.paymentsDue}</Text>
            <Text style={styles.statLabel}>Payments Due</Text>
          </View>

          <View style={[styles.statCard, styles.statCardSuccess]}>
            <IconSymbol name="check-circle" size={32} color={colors.white} />
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
            <IconSymbol name="people" size={28} color={colors.primary} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Manage Children</Text>
              <Text style={styles.actionSubtitle}>Add, edit or view children</Text>
            </View>
            <IconSymbol name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/attendance')}
          >
            <IconSymbol name="check-circle" size={28} color={colors.primary} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Mark Attendance</Text>
              <Text style={styles.actionSubtitle}>Track daily attendance</Text>
            </View>
            <IconSymbol name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/events')}
          >
            <IconSymbol name="event" size={28} color={colors.primary} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Manage Events</Text>
              <Text style={styles.actionSubtitle}>Create and schedule events</Text>
            </View>
            <IconSymbol name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/announcements')}
          >
            <IconSymbol name="notifications" size={28} color={colors.primary} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Announcements</Text>
              <Text style={styles.actionSubtitle}>Post updates for parents</Text>
            </View>
            <IconSymbol name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/media')}
          >
            <IconSymbol name="photo-library" size={28} color={colors.primary} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Media Gallery</Text>
              <Text style={styles.actionSubtitle}>Upload photos and videos</Text>
            </View>
            <IconSymbol name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.successNotice}>
          <Text style={styles.successNoticeText}>
            ✅ Supabase Connected: Real-time data enabled
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subGreeting: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  signOutButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCardPrimary: {
    backgroundColor: colors.primary,
  },
  statCardSecondary: {
    backgroundColor: colors.secondary,
  },
  statCardWarning: {
    backgroundColor: '#FF9800',
  },
  statCardSuccess: {
    backgroundColor: '#4CAF50',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
    marginTop: 12,
  },
  statLabel: {
    fontSize: 13,
    color: colors.white,
    marginTop: 4,
    textAlign: 'center',
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  actionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  successNotice: {
    margin: 20,
    padding: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  successNoticeText: {
    fontSize: 13,
    color: '#2E7D32',
    textAlign: 'center',
    fontWeight: '600',
  },
});
