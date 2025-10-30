
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { colors, commonStyles } from '@/styles/commonStyles';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AbsenceNotification, Payment, AnnouncementNotification } from '@/types/database.types';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IconSymbol } from '@/components/IconSymbol';

interface ParentStats {
  childrenCount: number;
  upcomingEvents: number;
  unreadNotifications: number;
  pendingPayments: number;
  overduePayments: number;
  pendingConsents: number;
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

interface AnnouncementNotificationWithDetails extends AnnouncementNotification {
  announcements?: {
    title: string;
    message: string;
    created_at: string;
  };
}

export default function ParentDashboard() {
  const router = useRouter();
  const subscriptionRef = useRef<any>(null);
  const { user, signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<ParentStats>({
    childrenCount: 0,
    upcomingEvents: 0,
    unreadNotifications: 0,
    pendingPayments: 0,
    overduePayments: 0,
    pendingConsents: 0,
  });
  const [absenceNotifications, setAbsenceNotifications] = useState<AbsenceNotification[]>([]);
  const [eventNotifications, setEventNotifications] = useState<EventNotification[]>([]);
  const [announcementNotifications, setAnnouncementNotifications] = useState<
    AnnouncementNotificationWithDetails[]
  >([]);

  const loadStats = useCallback(async () => {
    if (!user) {
      console.log('No user found, skipping stats load');
      return;
    }

    try {
      console.log('Loading parent stats for user:', user.user_id);

      // Get children count
      const { data: children, error: childrenError } = await supabase
        .from('children')
        .select('child_id')
        .eq('parent_id', user.user_id);

      if (childrenError) {
        console.error('Error loading children:', childrenError);
      }

      // Get upcoming events count
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('event_id')
        .gte('event_datetime', new Date().toISOString());

      if (eventsError) {
        console.error('Error loading events:', eventsError);
      }

      // Get unread notifications count
      const { data: absenceNots, error: absenceError } = await supabase
        .from('absence_notifications')
        .select('notification_id')
        .eq('parent_id', user.user_id)
        .eq('is_read', false);

      const { data: eventNots, error: eventError } = await supabase
        .from('event_notifications')
        .select('notification_id')
        .eq('parent_id', user.user_id)
        .eq('is_read', false);

      const { data: announcementNots, error: announcementError } = await supabase
        .from('announcement_notifications')
        .select('notification_id')
        .eq('parent_id', user.user_id)
        .eq('is_read', false);

      if (absenceError) console.error('Error loading absence notifications:', absenceError);
      if (eventError) console.error('Error loading event notifications:', eventError);
      if (announcementError)
        console.error('Error loading announcement notifications:', announcementError);

      const unreadCount =
        (absenceNots?.length || 0) +
        (eventNots?.length || 0) +
        (announcementNots?.length || 0);

      // Get pending payments
      const { data: pendingPayments, error: pendingError } = await supabase
        .from('payments')
        .select('payment_id')
        .eq('parent_id', user.user_id)
        .eq('status', 'pending');

      if (pendingError) {
        console.error('Error loading pending payments:', pendingError);
      }

      // Get overdue payments
      const { data: overduePayments, error: overdueError } = await supabase
        .from('payments')
        .select('payment_id')
        .eq('parent_id', user.user_id)
        .eq('status', 'overdue');

      if (overdueError) {
        console.error('Error loading overdue payments:', overdueError);
      }

      // Get pending consents
      const childIds = children?.map((c) => c.child_id) || [];
      let pendingConsentsCount = 0;

      if (childIds.length > 0) {
        const { data: consents, error: consentsError } = await supabase
          .from('media_consent')
          .select('consent_id')
          .in('child_id', childIds);

        if (consentsError) {
          console.error('Error loading consents:', consentsError);
        } else {
          pendingConsentsCount = childIds.length - (consents?.length || 0);
        }
      }

      setStats({
        childrenCount: children?.length || 0,
        upcomingEvents: events?.length || 0,
        unreadNotifications: unreadCount,
        pendingPayments: pendingPayments?.length || 0,
        overduePayments: overduePayments?.length || 0,
        pendingConsents: pendingConsentsCount,
      });

      console.log('Stats loaded successfully');
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [user]);

  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      console.log('Loading notifications for user:', user.user_id);

      // Load absence notifications
      const { data: absenceData, error: absenceError } = await supabase
        .from('absence_notifications')
        .select('*')
        .eq('parent_id', user.user_id)
        .eq('is_read', false)
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
        .select(
          `
          *,
          events (
            title,
            description,
            event_datetime
          )
        `
        )
        .eq('parent_id', user.user_id)
        .eq('is_read', false)
        .order('sent_at', { ascending: false })
        .limit(5);

      if (eventError) {
        console.error('Error loading event notifications:', eventError);
      } else {
        setEventNotifications(eventData || []);
      }

      // Load announcement notifications
      const { data: announcementData, error: announcementError } = await supabase
        .from('announcement_notifications')
        .select(
          `
          *,
          announcements (
            title,
            message,
            created_at
          )
        `
        )
        .eq('parent_id', user.user_id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (announcementError) {
        console.error('Error loading announcement notifications:', announcementError);
      } else {
        setAnnouncementNotifications(announcementData || []);
      }

      console.log('Notifications loaded successfully');
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, [user]);

  const setupRealtimeSubscription = useCallback(() => {
    if (!user) return;

    console.log('Setting up realtime subscription for user:', user.user_id);

    // Subscribe to changes in notifications
    const channel = supabase
      .channel('parent-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'absence_notifications',
          filter: `parent_id=eq.${user.user_id}`,
        },
        () => {
          console.log('Absence notification changed, reloading...');
          loadNotifications();
          loadStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_notifications',
          filter: `parent_id=eq.${user.user_id}`,
        },
        () => {
          console.log('Event notification changed, reloading...');
          loadNotifications();
          loadStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcement_notifications',
          filter: `parent_id=eq.${user.user_id}`,
        },
        () => {
          console.log('Announcement notification changed, reloading...');
          loadNotifications();
          loadStats();
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      console.log('Cleaning up realtime subscription');
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [user, loadNotifications, loadStats]);

  useEffect(() => {
    if (user) {
      loadStats();
      loadNotifications();
      const cleanup = setupRealtimeSubscription();
      return cleanup;
    }
  }, [user, loadStats, loadNotifications, setupRealtimeSubscription]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadStats(), loadNotifications()]);
    setRefreshing(false);
  }, [loadStats, loadNotifications]);

  const markNotificationAsRead = async (
    notificationId: string,
    type: 'absence' | 'event' | 'announcement'
  ) => {
    try {
      let table = '';
      if (type === 'absence') table = 'absence_notifications';
      else if (type === 'event') table = 'event_notifications';
      else if (type === 'announcement') table = 'announcement_notifications';

      const { error } = await supabase
        .from(table)
        .update({ is_read: true })
        .eq('notification_id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
      } else {
        loadNotifications();
        loadStats();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleSignOut = async () => {
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

  const handleTuitionPayment = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('create-payment-session', {
        body: {
          parent_id: user.user_id,
          amount: 150000,
          payment_type: 'tuition',
          description: 'Monthly Tuition Fee',
        },
      });

      if (error) throw error;

      if (data?.url) {
        await WebBrowser.openBrowserAsync(data.url);
      }
    } catch (error: any) {
      console.error('Error creating payment session:', error);
      Alert.alert('Error', 'Failed to initiate payment: ' + error.message);
    }
  };

  const handleWeeklyMealPayment = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('create-payment-session', {
        body: {
          parent_id: user.user_id,
          amount: 8000,
          payment_type: 'weekly_meal',
          description: 'Weekly Meal Plan',
        },
      });

      if (error) throw error;

      if (data?.url) {
        await WebBrowser.openBrowserAsync(data.url);
      }
    } catch (error: any) {
      console.error('Error creating payment session:', error);
      Alert.alert('Error', 'Failed to initiate payment: ' + error.message);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please sign in to continue</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>
            {user.first_name} {user.last_name}
          </Text>
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.primary + '15' }]}>
          <IconSymbol name="person.2.fill" size={32} color={colors.primary} />
          <Text style={styles.statValue}>{stats.childrenCount}</Text>
          <Text style={styles.statLabel}>Children</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.secondary + '15' }]}>
          <IconSymbol name="calendar" size={32} color={colors.secondary} />
          <Text style={styles.statValue}>{stats.upcomingEvents}</Text>
          <Text style={styles.statLabel}>Events</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#FF9800' + '15' }]}>
          <IconSymbol name="bell.fill" size={32} color="#FF9800" />
          <Text style={styles.statValue}>{stats.unreadNotifications}</Text>
          <Text style={styles.statLabel}>Notifications</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.error + '15' }]}>
          <IconSymbol name="dollarsign.circle.fill" size={32} color={colors.error} />
          <Text style={styles.statValue}>{stats.pendingPayments + stats.overduePayments}</Text>
          <Text style={styles.statLabel}>Payments Due</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(parent)/children')}
          >
            <IconSymbol name="person.2.fill" size={24} color={colors.primary} />
            <Text style={styles.actionText}>My Children</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(parent)/attendance')}
          >
            <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
            <Text style={styles.actionText}>Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(parent)/payments')}
          >
            <IconSymbol name="dollarsign.circle.fill" size={24} color={colors.secondary} />
            <Text style={styles.actionText}>Payments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(parent)/media')}
          >
            <IconSymbol name="photo.fill" size={24} color="#9C27B0" />
            <Text style={styles.actionText}>Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications */}
      {(absenceNotifications.length > 0 ||
        eventNotifications.length > 0 ||
        announcementNotifications.length > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>

          {absenceNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.notification_id}
              style={styles.notificationCard}
              onPress={() =>
                markNotificationAsRead(notification.notification_id, 'absence')
              }
            >
              <View style={styles.notificationIcon}>
                <IconSymbol name="exclamationmark.triangle.fill" size={24} color={colors.error} />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>Absence Alert</Text>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <Text style={styles.notificationDate}>{formatDate(notification.date)}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {eventNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.notification_id}
              style={styles.notificationCard}
              onPress={() => markNotificationAsRead(notification.notification_id, 'event')}
            >
              <View style={styles.notificationIcon}>
                <IconSymbol name="calendar" size={24} color={colors.secondary} />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{notification.events.title}</Text>
                <Text style={styles.notificationMessage}>
                  {notification.events.description}
                </Text>
                <Text style={styles.notificationDate}>
                  {formatDate(notification.events.event_datetime)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {announcementNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.notification_id}
              style={styles.notificationCard}
              onPress={() =>
                markNotificationAsRead(notification.notification_id, 'announcement')
              }
            >
              <View style={styles.notificationIcon}>
                <IconSymbol name="megaphone.fill" size={24} color={colors.primary} />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>
                  {notification.announcements?.title}
                </Text>
                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {notification.announcements?.message}
                </Text>
                <Text style={styles.notificationDate}>
                  {notification.announcements?.created_at &&
                    formatDate(notification.announcements.created_at)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Pending Consents Alert */}
      {stats.pendingConsents > 0 && (
        <TouchableOpacity
          style={styles.consentAlert}
          onPress={() => router.push('/(parent)/consent')}
        >
          <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#FF9800" />
          <View style={styles.consentAlertContent}>
            <Text style={styles.consentAlertTitle}>Media Consent Required</Text>
            <Text style={styles.consentAlertMessage}>
              You have {stats.pendingConsents} pending media consent form(s). Tap to complete.
            </Text>
          </View>
          <IconSymbol name="chevron.right" size={20} color="#FF9800" />
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  signOutButton: {
    padding: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
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
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationIcon: {
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  consentAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800' + '15',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  consentAlertContent: {
    flex: 1,
    marginLeft: 12,
  },
  consentAlertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  consentAlertMessage: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginTop: 20,
  },
});
