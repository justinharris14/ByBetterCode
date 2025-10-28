
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
  totalParents: number;
  totalStaff: number;
  totalEvents: number;
  paymentsDue: number;
  attendanceRate: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalChildren: 0,
    totalParents: 0,
    totalStaff: 0,
    totalEvents: 0,
    paymentsDue: 0,
    attendanceRate: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      console.log('Loading admin dashboard stats');

      const [childrenCount, parentsCount, staffCount, eventsCount, paymentsCount, attendanceData] = await Promise.all([
        supabase.from('children').select('*', { count: 'exact', head: true }),
        supabase.from('parents').select('*', { count: 'exact', head: true }),
        supabase.from('staff').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }).gte('event_datetime', new Date().toISOString()),
        supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('attendance').select('is_present').eq('date', new Date().toISOString().split('T')[0]),
      ]);

      const presentCount = attendanceData.data?.filter(a => a.is_present).length || 0;
      const totalAttendance = attendanceData.data?.length || 0;
      const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

      setStats({
        totalChildren: childrenCount.count || 0,
        totalParents: parentsCount.count || 0,
        totalStaff: staffCount.count || 0,
        totalEvents: eventsCount.count || 0,
        paymentsDue: paymentsCount.count || 0,
        attendanceRate,
      });

      console.log('Admin stats loaded successfully');
    } catch (error) {
      console.error('Error loading admin stats:', error);
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
            <Text style={styles.greeting}>Admin Dashboard 👨‍💼</Text>
            <Text style={styles.subGreeting}>Manage your crèche</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <IconSymbol name="exit.to.app" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <IconSymbol name="people" size={32} color={colors.white} />
            <Text style={styles.statValue}>{stats.totalChildren}</Text>
            <Text style={styles.statLabel}>Children</Text>
          </View>

          <View style={[styles.statCard, styles.statCardSecondary]}>
            <IconSymbol name="person.2" size={32} color={colors.white} />
            <Text style={styles.statValue}>{stats.totalParents}</Text>
            <Text style={styles.statLabel}>Parents</Text>
          </View>

          <View style={[styles.statCard, styles.statCardInfo]}>
            <IconSymbol name="person.badge.shield.checkmark" size={32} color={colors.white} />
            <Text style={styles.statValue}>{stats.totalStaff}</Text>
            <Text style={styles.statLabel}>Staff</Text>
          </View>

          <View style={[styles.statCard, styles.statCardWarning]}>
            <IconSymbol name="event" size={32} color={colors.white} />
            <Text style={styles.statValue}>{stats.totalEvents}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>

          <View style={[styles.statCard, styles.statCardDanger]}>
            <IconSymbol name="payment" size={32} color={colors.white} />
            <Text style={styles.statValue}>{stats.paymentsDue}</Text>
            <Text style={styles.statLabel}>Payments Due</Text>
          </View>

          <View style={[styles.statCard, styles.statCardSuccess]}>
            <IconSymbol name="chart.bar" size={32} color={colors.white} />
            <Text style={styles.statValue}>{stats.attendanceRate}%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Management</Text>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/children')}
          >
            <IconSymbol name="people" size={28} color={colors.primary} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Children</Text>
              <Text style={styles.actionSubtitle}>Manage child profiles</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/parents')}
          >
            <IconSymbol name="person.2" size={28} color={colors.primary} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Parents</Text>
              <Text style={styles.actionSubtitle}>Manage parent information</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/staff')}
          >
            <IconSymbol name="person.badge.shield.checkmark" size={28} color={colors.primary} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Staff</Text>
              <Text style={styles.actionSubtitle}>Manage staff & assignments</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/attendance')}
          >
            <IconSymbol name="check.circle" size={28} color={colors.primary} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Attendance</Text>
              <Text style={styles.actionSubtitle}>Mark daily attendance</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/events')}
          >
            <IconSymbol name="event" size={28} color={colors.primary} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Events</Text>
              <Text style={styles.actionSubtitle}>Create and manage events</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/announcements')}
          >
            <IconSymbol name="megaphone" size={28} color={colors.primary} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Announcements</Text>
              <Text style={styles.actionSubtitle}>Post school updates</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/payments')}
          >
            <IconSymbol name="payment" size={28} color={colors.primary} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Payments</Text>
              <Text style={styles.actionSubtitle}>Manage payments & receipts</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/media')}
          >
            <IconSymbol name="photo.library" size={28} color={colors.primary} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Media Gallery</Text>
              <Text style={styles.actionSubtitle}>Upload photos & videos</Text>
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
    minWidth: '30%',
    padding: 16,
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
  statCardInfo: {
    backgroundColor: '#2196F3',
  },
  statCardDanger: {
    backgroundColor: '#FF5252',
  },
  statCardSuccess: {
    backgroundColor: '#4CAF50',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
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
});
