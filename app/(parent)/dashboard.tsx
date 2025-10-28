
import React, { useState, useEffect, useRef } from 'react';
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
import { AbsenceNotification, Payment } from '@/types/database.types';
import { colors, commonStyles } from '@/styles/commonStyles';

interface ParentStats {
  childrenCount: number;
  upcomingEvents: number;
  unreadNotifications: number;
  pendingPayments: number;
  overduePayments: number;
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
    pendingPayments: 0,
    overduePayments: 0,
  });
  const [absenceNotifications, setAbsenceNotifications] = useState<AbsenceNotification[]>([]);
  const [eventNotifications, setEventNotifications] = useState<EventNotification[]>([]);
  const [paymentReminders, setPaymentReminders] = useState<Payment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const absenceChannelRef = useRef<any>(null);
  const eventChannelRef = useRef<any>(null);

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
    };
  }, [user]);

  const setupRealtimeSubscription = () => {
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

      // Get payment reminders (pending/overdue payments)
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('parent_id', user.user_id)
        .in('status', ['pending', 'overdue'])
        .order('due_date', { ascending: true })
        .limit(3);

      setPaymentReminders(paymentsData || []);

      setStats({
        childrenCount: childrenCount || 0,
        upcomingEvents: eventsCount || 0,
        unreadNotifications: (absenceNotifCount || 0) + (eventNotifCount || 0),
        pendingPayments: pendingCount || 0,
        overduePayments: overdueCount || 0,
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

  const handlePayment = async (paymentType: 'meal' | 'tuition') => {
    const paymentUrls = {
      meal: 'https://buy.stripe.com/test_bJe00ccYJdNb2Jx5zy7g401',
      tuition: 'https://buy.stripe.com/test_8x24gsf6R10p3NB7HG7g400',
    };

    const paymentNames = {
      meal: 'Weekly Meal Plan',
      tuition: 'Tuition Fee',
    };

    try {
      console.log(`Opening ${paymentNames[paymentType]} payment page...`);
      const result = await WebBrowser.openBrowserAsync(paymentUrls[paymentType]);
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

  const formatCurrency = (amount: number) => {
    return `R${amount.toFixed(2)}`;
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

        {/* Payment Reminders */}
        {(stats.overduePayments > 0 || stats.pendingPayments > 0) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>💰 Payment Reminders</Text>
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

            {paymentReminders.map((payment) => {
              const daysUntilDue = payment.due_date ? getDaysUntilDue(payment.due_date) : null;
              const isOverdue = daysUntilDue !== null && daysUntilDue < 0;

              return (
                <TouchableOpacity
                  key={payment.payment_id}
                  style={[styles.paymentReminderCard, isOverdue && styles.overdueReminderCard]}
                  onPress={() => router.push('/(parent)/payments')}
                >
                  <View style={styles.paymentReminderHeader}>
                    <View style={styles.paymentReminderTitle}>
                      <IconSymbol
                        name={isOverdue ? 'exclamationmark.circle.fill' : 'clock.fill'}
                        size={20}
                        color={isOverdue ? '#F44336' : '#FF9800'}
                      />
                      <Text style={styles.paymentReminderType}>{payment.payment_type}</Text>
                    </View>
                    <Text style={styles.paymentReminderAmount}>
                      {formatCurrency(Number(payment.amount))}
                    </Text>
                  </View>
                  {daysUntilDue !== null && (
                    <Text style={[styles.paymentReminderDue, isOverdue && styles.overdueText]}>
                      {isOverdue
                        ? `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`
                        : daysUntilDue === 0
                        ? 'Due today!'
                        : `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Payments Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Payments</Text>
          <View style={styles.paymentContainer}>
            <TouchableOpacity
              style={styles.paymentCard}
              onPress={() => handlePayment('meal')}
              activeOpacity={0.7}
            >
              <View style={styles.paymentIconContainer}>
                <IconSymbol name="fork.knife" size={32} color={colors.white} />
              </View>
              <View style={styles.paymentContent}>
                <Text style={styles.paymentTitle}>Weekly Meal Plan</Text>
                <Text style={styles.paymentDescription}>
                  Pay for your child&apos;s weekly meals
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.paymentCard}
              onPress={() => handlePayment('tuition')}
              activeOpacity={0.7}
            >
              <View style={[styles.paymentIconContainer, styles.tuitionIcon]}>
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
  paymentContainer: {
    gap: 12,
  },
  paymentCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  paymentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tuitionIcon: {
    backgroundColor: colors.primary,
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
  paymentReminderCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  overdueReminderCard: {
    borderLeftColor: '#F44336',
  },
  paymentReminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentReminderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  paymentReminderType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  paymentReminderAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  paymentReminderDue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
  },
  overdueText: {
    color: '#F44336',
  },
});
