
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { AbsenceNotification, Payment, AnnouncementNotification } from '@/types/database.types';
import { colors, commonStyles } from '@/styles/commonStyles';

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
  const { user } = useAuth();
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
  const [announcementNotifications, setAnnouncementNotifications] = useState<AnnouncementNotificationWithDetails[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const absenceChannelRef = useRef<any>(null);
  const eventChannelRef = useRef<any>(null);
  const announcementChannelRef = useRef<any>(null);

  const loadStats = useCallback(async () => {
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

      // Get unread announcement notifications count
      const { count: announcementNotifCount } = await supabase
        .from('announcement_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', user.user_id)
        .eq('is_read', false);

      // Get pending payments count
      const { count: pendingCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', user.user_id)
        .eq('status', 'pending');

      // Get overdue payments count
      const { count: overdueCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', user.user_id)
        .eq('status', 'overdue');

      // Get consent forms count
      const { count: consentsCount } = await supabase
        .from('media_consent')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', user.user_id);

      const pendingConsents = (childrenCount || 0) - (consentsCount || 0);

      setStats({
        childrenCount: childrenCount || 0,
        upcomingEvents: eventsCount || 0,
        unreadNotifications: (absenceNotifCount || 0) + (eventNotifCount || 0) + (announcementNotifCount || 0),
        pendingPayments: pendingCount || 0,
        overduePayments: overdueCount || 0,
        pendingConsents: pendingConsents > 0 ? pendingConsents : 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [user]);

  const loadNotifications = useCallback(async () => {
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

      // Load announcement notifications
      const { data: announcementData, error: announcementError } = await supabase
        .from('announcement_notifications')
        .select(`
          *,
          announcements:announcement_id (
            title,
            message,
            created_at
          )
        `)
        .eq('parent_id', user.user_id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (announcementError) {
        console.error('Error loading announcement notifications:', announcementError);
      } else {
        setAnnouncementNotifications(announcementData || []);
      }
    } catch (error) {
      console.error('Error in loadNotifications:', error);
    }
  }, [user]);

  const setupRealtimeSubscription = useCallback(() => {
    if (!user) return;

    console.log('Setting up realtime subscription for parent:', user.user_id);

    // Check if already subscribed to prevent multiple subscriptions
    if (absenceChannelRef.current?.state === 'subscribed') {
      console.log('Already subscribed to absence notifications');
      return;
    }

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
      .subscribe((status) => {
        console.log('Absence channel status:', status);
      });

    absenceChannelRef.current = absenceChannel;

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
      .subscribe((status) => {
        console.log('Event channel status:', status);
      });

    eventChannelRef.current = eventChannel;

    // Subscribe to announcement notifications
    const announcementChannel = supabase
      .channel('announcement_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'announcement_notifications',
          filter: `parent_id=eq.${user.user_id}`,
        },
        (payload) => {
          console.log('New announcement notification received:', payload);
          loadNotifications();
          loadStats();
        }
      )
      .subscribe((status) => {
        console.log('Announcement channel status:', status);
      });

    announcementChannelRef.current = announcementChannel;
  }, [user, loadNotifications, loadStats]);

  useEffect(() => {
    if (user) {
      loadStats();
      loadNotifications();
      setupRealtimeSubscription();
    }

    return () => {
      // Proper cleanup using supabase.removeChannel
      if (absenceChannelRef.current) {
        console.log('Cleaning up absence channel');
        supabase.removeChannel(absenceChannelRef.current);
        absenceChannelRef.current = null;
      }
      if (eventChannelRef.current) {
        console.log('Cleaning up event channel');
        supabase.removeChannel(eventChannelRef.current);
        eventChannelRef.current = null;
      }
      if (announcementChannelRef.current) {
        console.log('Cleaning up announcement channel');
        supabase.removeChannel(announcementChannelRef.current);
        announcementChannelRef.current = null;
      }
    };
  }, [user, loadStats, loadNotifications, setupRealtimeSubscription]);

  const markNotificationAsRead = async (notificationId: string, type: 'absence' | 'event' | 'announcement') => {
    try {
      let table = '';
      if (type === 'absence') {
        table = 'absence_notifications';
      } else if (type === 'event') {
        table = 'event_notifications';
      } else if (type === 'announcement') {
        table = 'announcement_notifications';
      }

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

  const handleTuitionPayment = async () => {
    const tuitionUrl = 'https://buy.stripe.com/test_8x24gsf6R10p3NB7HG7g400';

    try {
      console.log('Opening Tuition Fee payment page...');
      const result = await WebBrowser.openBrowserAsync(tuitionUrl);
      console.log('Browser result:', result);
    } catch (error) {
      console.error('Error opening payment page:', error);
      Alert.alert(
        'Error',
        'Unable to open payment page. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleWeeklyMealPayment = async () => {
    const weeklyMealUrl = 'https://buy.stripe.com/test_bJe00ccYJdNb2Jx5zy7g401';

    try {
      console.log('Opening Weekly Meal payment page...');
      const result = await WebBrowser.openBrowserAsync(weeklyMealUrl);
      console.log('Browser result:', result);
    } catch (error) {
      console.error('Error opening payment page:', error);
      Alert.alert(
        'Error',
        'Unable to open payment page. Please try again later.',
        [{ text: 'OK' }]
      );
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

        {/* Consent Alert */}
        {stats.pendingConsents > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.consentAlert}
              onPress={() => router.push('/(parent)/media')}
              activeOpacity={0.7}
            >
              <View style={styles.consentAlertContent}>
                <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#FF9800" />
                <View style={styles.consentAlertText}>
                  <Text style={styles.consentAlertTitle}>Media Consent Required</Text>
                  <Text style={styles.consentAlertSubtitle}>
                    {stats.pendingConsents} {stats.pendingConsents === 1 ? 'child needs' : 'children need'} consent form{stats.pendingConsents === 1 ? '' : 's'}
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color="#FF9800" />
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/(parent)/media')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.accent }]}>
                <IconSymbol name="photo.on.rectangle" size={28} color={colors.white} />
              </View>
              <Text style={styles.quickActionTitle}>Gallery</Text>
              <Text style={styles.quickActionSubtitle}>Photos & Videos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/(parent)/attendance')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.success }]}>
                <IconSymbol name="checkmark.circle.fill" size={28} color={colors.white} />
              </View>
              <Text style={styles.quickActionTitle}>Attendance</Text>
              <Text style={styles.quickActionSubtitle}>View History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payments Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💳 Payments</Text>
            <TouchableOpacity onPress={() => router.push('/(parent)/payments')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {stats.overduePayments > 0 && (
            <View style={styles.alertCard}>
              <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#F44336" />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Overdue Payments</Text>
                <Text style={styles.alertMessage}>
                  You have {stats.overduePayments} overdue payment{stats.overduePayments !== 1 ? 's' : ''}. Please pay as soon as possible.
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.paymentCard}
            onPress={handleTuitionPayment}
            activeOpacity={0.7}
          >
            <View style={styles.paymentIconContainer}>
              <IconSymbol name="graduationcap.fill" size={32} color={colors.white} />
            </View>
            <View style={styles.paymentContent}>
              <Text style={styles.paymentTitle}>Tuition Fee</Text>
              <Text style={styles.paymentDescription}>
                Pay monthly tuition fees
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentCard, styles.weeklyMealPaymentCard]}
            onPress={handleWeeklyMealPayment}
            activeOpacity={0.7}
          >
            <View style={[styles.paymentIconContainer, styles.weeklyMealIconContainer]}>
              <IconSymbol name="fork.knife" size={32} color={colors.white} />
            </View>
            <View style={styles.paymentContent}>
              <Text style={styles.paymentTitle}>Weekly Meals</Text>
              <Text style={styles.paymentDescription}>
                Pay for weekly meal plan
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Announcement Notifications */}
        {announcementNotifications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📢 Announcements</Text>
              <TouchableOpacity onPress={() => router.push('/(parent)/announcements')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {announcementNotifications.map((notification) => (
              <TouchableOpacity
                key={notification.notification_id}
                style={[
                  styles.notificationCard,
                  !notification.is_read && styles.unreadNotification,
                ]}
                onPress={() => {
                  markNotificationAsRead(notification.notification_id, 'announcement');
                  router.push('/(parent)/announcements');
                }}
              >
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>
                    {notification.announcements?.title || 'Announcement'}
                  </Text>
                  {!notification.is_read && <View style={styles.unreadBadge} />}
                </View>
                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {notification.announcements?.message || 'No message'}
                </Text>
                <Text style={styles.notificationDate}>
                  📅 {formatDate(notification.announcements?.created_at || notification.created_at)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

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

        {absenceNotifications.length === 0 && eventNotifications.length === 0 && announcementNotifications.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>You&apos;re all caught up!</Text>
          </View>
        )}

        {/* Add bottom padding to prevent content from being hidden by tab bar */}
        <View style={{ height: 100 }} />
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
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
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
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  paymentCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  weeklyMealPaymentCard: {
    marginBottom: 0,
  },
  paymentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  weeklyMealIconContainer: {
    backgroundColor: colors.secondary,
  },
  paymentContent: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  paymentDescription: {
    fontSize: 14,
    color: colors.textSecondary,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: '#D32F2F',
    lineHeight: 20,
  },
  consentAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  consentAlertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  consentAlertText: {
    marginLeft: 12,
    flex: 1,
  },
  consentAlertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E65100',
    marginBottom: 2,
  },
  consentAlertSubtitle: {
    fontSize: 14,
    color: '#F57C00',
  },
});
