
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

interface ParentStats {
  childrenCount: number;
  upcomingEvents: number;
  unreadNotifications: number;
  pendingPayments: number;
}

export default function ParentDashboard() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  
  // Mock data for demo mode
  const [stats, setStats] = useState<ParentStats>({
    childrenCount: 2,
    upcomingEvents: 3,
    unreadNotifications: 5,
    pendingPayments: 1,
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
            <Text style={styles.subGreeting}>Parent Dashboard</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <IconSymbol name="exit.to.app" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <IconSymbol name="people" size={32} color={colors.white} />
            <Text style={styles.statValue}>{stats.childrenCount}</Text>
            <Text style={styles.statLabel}>My Children</Text>
          </View>

          <View style={[styles.statCard, styles.statCardSecondary]}>
            <IconSymbol name="event" size={32} color={colors.white} />
            <Text style={styles.statValue}>{stats.upcomingEvents}</Text>
            <Text style={styles.statLabel}>Upcoming Events</Text>
          </View>

          <View style={[styles.statCard, styles.statCardWarning]}>
            <IconSymbol name="notifications" size={32} color={colors.white} />
            <Text style={styles.statValue}>{stats.unreadNotifications}</Text>
            <Text style={styles.statLabel}>Notifications</Text>
          </View>

          <View style={[styles.statCard, styles.statCardInfo]}>
            <IconSymbol name="payment" size={32} color={colors.white} />
            <Text style={styles.statValue}>{stats.pendingPayments}</Text>
            <Text style={styles.statLabel}>Pending Payments</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(parent)/children')}
          >
            <IconSymbol name="people" size={28} color={colors.primary} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>My Children</Text>
              <Text style={styles.actionSubtitle}>View profiles and information</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(parent)/attendance')}
          >
            <IconSymbol name="check.circle" size={28} color={colors.primary} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Attendance History</Text>
              <Text style={styles.actionSubtitle}>View attendance records</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(parent)/events')}
          >
            <IconSymbol name="event" size={28} color={colors.primary} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Events</Text>
              <Text style={styles.actionSubtitle}>View upcoming events</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(parent)/payments')}
          >
            <IconSymbol name="payment" size={28} color={colors.primary} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Payments</Text>
              <Text style={styles.actionSubtitle}>View and make payments</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(parent)/announcements')}
          >
            <IconSymbol name="notifications" size={28} color={colors.primary} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Announcements</Text>
              <Text style={styles.actionSubtitle}>Read school updates</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(parent)/media')}
          >
            <IconSymbol name="photo.library" size={28} color={colors.primary} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Media Gallery</Text>
              <Text style={styles.actionSubtitle}>View photos and videos</Text>
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
  statCardInfo: {
    backgroundColor: '#2196F3',
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
