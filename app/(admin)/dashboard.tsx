
import React, { useState } from 'react';
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

interface DashboardStats {
  totalChildren: number;
  totalEvents: number;
  paymentsDue: number;
  attendanceRate: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  
  // Mock data for demo mode
  const [stats, setStats] = useState<DashboardStats>({
    totalChildren: 12,
    totalEvents: 3,
    paymentsDue: 5,
    attendanceRate: 92,
  });

  const onRefresh = () => {
    setRefreshing(true);
    console.log('Refreshing dashboard (demo mode)');
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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
            <IconSymbol name="exit.to.app" size={24} color={colors.text} />
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
            <IconSymbol name="check.circle" size={32} color={colors.white} />
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
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/attendance')}
          >
            <IconSymbol name="check.circle" size={28} color={colors.primary} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Mark Attendance</Text>
              <Text style={styles.actionSubtitle}>Track daily attendance</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
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
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
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
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(admin)/media')}
          >
            <IconSymbol name="photo.library" size={28} color={colors.primary} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Media Gallery</Text>
              <Text style={styles.actionSubtitle}>Upload photos and videos</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.demoNotice}>
          <Text style={styles.demoNoticeText}>
            ℹ️ Demo Mode: Supabase integration is temporarily disabled
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
  demoNotice: {
    margin: 20,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  demoNoticeText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
