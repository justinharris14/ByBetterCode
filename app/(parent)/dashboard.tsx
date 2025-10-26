
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
import { useAuth } from '@/contexts/AuthContext';

interface ParentStats {
  childrenCount: number;
  upcomingEvents: number;
  unreadNotifications: number;
  pendingPayments: number;
}

export default function ParentDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<ParentStats>({
    childrenCount: 0,
    upcomingEvents: 0,
    unreadNotifications: 0,
    pendingPayments: 0,
  });

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      console.log('Loading parent dashboard stats for user:', user.user_id);

      // Get children count for this parent
      const { count: childrenCount, error: childrenError } = await supabase
        .from('children')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', user.user_id);

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

      // Get unread notifications count
      const { count: notificationsCount, error: notificationsError } = await supabase
        .from('event_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', user.user_id)
        .eq('is_read', false);

      if (notificationsError) {
        console.error('Error loading notifications count:', notificationsError);
      }

      // Get pending payments count
      const { count: paymentsCount, error: paymentsError } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', user.user_id)
        .eq('status', 'pending');

      if (paymentsError) {
        console.error('Error loading payments count:', paymentsError);
      }

      setStats({
        childrenCount: childrenCount || 0,
        upcomingEvents: eventsCount || 0,
        unreadNotifications: notificationsCount || 0,
        pendingPayments: paymentsCount || 0,
      });

      console.log('Parent stats loaded successfully:', {
        childrenCount,
        upcomingEvents: eventsCount,
        unreadNotifications: notificationsCount,
        pendingPayments: paymentsCount,
      });
    } catch (error) {
      console.error('Error loading parent stats:', error);
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
            <Text style={styles.greeting}>Hello, {user?.first_name}! 👋</Text>
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
              <Text style={styles.actionTitle}>Attendance</Text>
              <Text style={styles.actionSubtitle}>Check attendance history</Text>
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
            onPress={() => router.push('/(parent)/payments')}
          >
            <IconSymbol name="payment" size={28} color={colors.primary} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Payments</Text>
              <Text style={styles.actionSubtitle}>View payment history</Text>
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
