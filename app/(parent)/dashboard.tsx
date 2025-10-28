
import { supabase } from '@/lib/supabase';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { AbsenceNotification } from '@/types/database.types';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';

interface ParentStats {
  childrenCount: number;
  upcomingEvents: number;
  unreadNotifications: number;
}

interface EventNotification {
  notification_id: string;
  event_id: string;
  is_read: boolean;
  sent_at: string;
  events: {
    title: string;
    description: string;
    event_datetime: string;
  };
}

export default function ParentDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<ParentStats>({
    childrenCount: 0,
    upcomingEvents: 0,
    unreadNotifications: 0,
  });
  const [absenceNotifications, setAbsenceNotifications] = useState<AbsenceNotification[]>([]);
  const [eventNotifications, setEventNotifications] = useState<EventNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (user) {
      loadStats();
      loadNotifications();
      setupRealtimeSubscription();
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [user]);

  const setupRealtimeSubscription = () => {
    if (!user) return;

    console.log('Setting up realtime subscription for parent:', user.user_id);

    // Subscribe to absence notifications
    const absenceChannel = supabase
      .channel('absence_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'absence_notifications',
          filter: `parent_id=eq.${user.user_id}`,
        },
        (payload) => {
          console.log('New absence notification received:', payload);
          loadNotifications();
          loadStats();
        }
      )
      .subscribe();

    // Subscribe to event notifications
    const eventChannel = supabase
      .channel('event_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_notifications',
          filter: `parent_id=eq.${user.user_id}`,
        },
        (payload) => {
          console.log('New event notification received:', payload);
          loadNotifications();
          loadStats();
        }
      )
      .subscribe();

    subscriptionRef.current = { absenceChannel, eventChannel };
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      // Get children count
      const { count: childrenCount } = await supabase
        .from('children')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', user.user_id);

      // Get upcoming events count
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('event_datetime', new Date().toISOString());

      // Get unread absence notifications count
      const { count: absenceNotifCount } = await supabase
        .from('absence_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', user.user_id)
        .eq('is_read', false);

      // Get unread event notifications count
      const { count: eventNotifCount } = await supabase
        .from('event_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', user.user_id)
        .eq('is_read', false);

      setStats({
        childrenCount: childrenCount || 0,
        upcomingEvents: eventsCount || 0,
        unreadNotifications: (absenceNotifCount || 0) + (eventNotifCount || 0),
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadNotifications = async () => {
    if (!user) return;

    try {
      // Load absence notifications
      const { data: absenceData, error: absenceError } = await supabase
        .from('absence_notifications')
        .select(`
          *,
          children:child_id (
            first_name,
            last_name
          )
        `)
        .eq('parent_id', user.user_id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (absenceError) {
        console.error('Error loading absence notifications:', absenceError);
      } else {
        setAbsenceNotifications(absenceData || []);
      }

      // Load event notifications
      const { data: eventData, error: eventError } = await supabase
        .from('event_notifications')
        .select(`
          *,
          events:event_id (
            title,
            description,
            event_datetime
          )
        `)
        .eq('parent_id', user.user_id)
        .order('sent_at', { ascending: false })
        .limit(5);

      if (eventError) {
        console.error('Error loading event notifications:', eventError);
      } else {
        setEventNotifications(eventData || []);
      }
    } catch (error) {
      console.error('Error in loadNotifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string, type: 'absence' | 'event') => {
    try {
      const table = type === 'absence' ? 'absence_notifications' : 'event_notifications';
      const { error } = await supabase
        .from(table)
        .update({ is_read: true })
        .eq('notification_id', notificationId);

      if (error) throw error;

      loadNotifications();
      loadStats();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    await loadNotifications();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>
              {user?.first_name} {user?.last_name}
            </Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <IconSymbol name="exit.to.app" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <IconSymbol name="person.2.fill" size={32} color={colors.primary} />
            <Text style={styles.statValue}>{stats.childrenCount}</Text>
            <Text style={styles.statLabel}>Children</Text>
          </View>

          <View style={styles.statCard}>
            <IconSymbol name="calendar" size={32} color={colors.secondary} />
            <Text style={styles.statValue}>{stats.upcomingEvents}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>

          <View style={styles.statCard}>
            <IconSymbol name="bell.fill" size={32} color={colors.accent} />
            <Text style={styles.statValue}>{stats.unreadNotifications}</Text>
            <Text style={styles.statLabel}>Unread</Text>
          </View>
        </View>

        {/* Event Notifications */}
        {eventNotifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Event Notifications</Text>
            {eventNotifications.map((notification) => (
              <TouchableOpacity
                key={notification.notification_id}
                style={[
                  styles.notificationCard,
                  !notification.is_read && styles.unreadNotification,
                ]}
                onPress={() => {
                  markNotificationAsRead(notification.notification_id, 'event');
                  router.push('/(parent)/events');
                }}
              >
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>
                    {notification.events?.title || 'Event'}
                  </Text>
                  {!notification.is_read && <View style={styles.unreadBadge} />}
                </View>
                <Text style={styles.notificationMessage}>
                  {notification.events?.description || 'No description'}
                </Text>
                <Text style={styles.notificationDate}>
                  📆 {formatDate(notification.events?.event_datetime || notification.sent_at)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Absence Notifications */}
        {absenceNotifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Absence Notifications</Text>
            {absenceNotifications.map((notification) => (
              <TouchableOpacity
                key={notification.notification_id}
                style={[
                  styles.notificationCard,
                  !notification.is_read && styles.unreadNotification,
                ]}
                onPress={() => markNotificationAsRead(notification.notification_id, 'absence')}
              >
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>Absence Alert</Text>
                  {!notification.is_read && <View style={styles.unreadBadge} />}
                </View>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <Text style={styles.notificationDate}>📅 {formatDate(notification.date)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {absenceNotifications.length === 0 && eventNotifications.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>You&apos;re all caught up!</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  signOutButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  notificationCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
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
});
