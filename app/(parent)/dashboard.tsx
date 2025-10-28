
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
import { supabase } from '@/lib/supabase';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { AbsenceNotification } from '@/types/database.types';

interface ParentStats {
  childrenCount: number;
  upcomingEvents: number;
  unreadNotifications: number;
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ParentStats>({
    childrenCount: 0,
    upcomingEvents: 0,
    unreadNotifications: 0,
  });
  const [notifications, setNotifications] = useState<AbsenceNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (user) {
      loadStats();
      loadNotifications();
      setupRealtimeSubscription();
    }

    return () => {
      if (channelRef.current) {
        console.log('Cleaning up realtime subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user]);

  const setupRealtimeSubscription = async () => {
    if (!user) return;

    // Check if already subscribed
    if (channelRef.current?.state === 'subscribed') {
      console.log('Already subscribed to notifications channel');
      return;
    }

    console.log('Setting up realtime subscription for parent:', user.user_id);

    const channel = supabase.channel(`parent:${user.user_id}:notifications`, {
      config: { broadcast: { self: false } }
    });

    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'absence_notification' }, (payload) => {
        console.log('Received absence notification:', payload);
        const notification = payload.payload as AbsenceNotification;
        
        // Add to notifications list
        setNotifications(prev => [notification, ...prev]);
        
        // Update unread count
        setStats(prev => ({
          ...prev,
          unreadNotifications: prev.unreadNotifications + 1
        }));

        // Show alert
        Alert.alert(
          'Absence Notification',
          notification.message,
          [{ text: 'OK' }]
        );
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to notifications');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel subscription error');
        }
      });
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      const now = new Date().toISOString();

      const [childrenData, eventsData, notificationsData] = await Promise.all([
        supabase
          .from('children')
          .select('child_id', { count: 'exact' })
          .eq('parent_id', user.user_id),
        supabase
          .from('events')
          .select('event_id', { count: 'exact' })
          .gte('event_datetime', now),
        supabase
          .from('absence_notifications')
          .select('notification_id', { count: 'exact' })
          .eq('parent_id', user.user_id)
          .eq('is_read', false),
      ]);

      setStats({
        childrenCount: childrenData.count || 0,
        upcomingEvents: eventsData.count || 0,
        unreadNotifications: notificationsData.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('absence_notifications')
        .select('*')
        .eq('parent_id', user.user_id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('absence_notifications')
        .update({ is_read: true })
        .eq('notification_id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.notification_id === notificationId ? { ...n, is_read: true } : n
        )
      );

      // Update unread count
      setStats(prev => ({
        ...prev,
        unreadNotifications: Math.max(0, prev.unreadNotifications - 1)
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadStats(), loadNotifications()]);
    setRefreshing(false);
  };

  const handleSignOut = () => {
    router.replace('/login');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
            <Text style={styles.greeting}>Welcome Back!</Text>
            <Text style={styles.subtitle}>
              {user?.first_name} {user?.last_name}
            </Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <IconSymbol name="arrow.right.square" size={24} color={colors.accent} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <IconSymbol name="people" size={32} color={colors.primary} />
            <Text style={styles.statValue}>{stats.childrenCount}</Text>
            <Text style={styles.statLabel}>My Children</Text>
          </View>

          <View style={styles.statCard}>
            <IconSymbol name="event" size={32} color={colors.secondary} />
            <Text style={styles.statValue}>{stats.upcomingEvents}</Text>
            <Text style={styles.statLabel}>Upcoming Events</Text>
          </View>

          <View style={styles.statCard}>
            <IconSymbol name="bell.badge" size={32} color={colors.accent} />
            <Text style={styles.statValue}>{stats.unreadNotifications}</Text>
            <Text style={styles.statLabel}>Notifications</Text>
          </View>
        </View>

        {notifications.length > 0 && (
          <View style={styles.notificationsSection}>
            <Text style={styles.sectionTitle}>Recent Notifications</Text>
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.notification_id}
                style={[
                  styles.notificationCard,
                  !notification.is_read && styles.unreadNotification
                ]}
                onPress={() => markNotificationAsRead(notification.notification_id)}
              >
                <View style={styles.notificationIcon}>
                  <IconSymbol
                    name="exclamationmark.triangle"
                    size={24}
                    color={notification.is_read ? colors.textSecondary : colors.accent}
                  />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={[
                    styles.notificationMessage,
                    !notification.is_read && styles.unreadText
                  ]}>
                    {notification.message}
                  </Text>
                  <Text style={styles.notificationDate}>
                    {formatDate(notification.created_at)}
                  </Text>
                </View>
                {!notification.is_read && (
                  <View style={styles.unreadBadge} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(parent)/children')}
          >
            <IconSymbol name="people" size={24} color={colors.primary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>My Children</Text>
              <Text style={styles.actionDescription}>View children profiles</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(parent)/attendance')}
          >
            <IconSymbol name="check.circle" size={24} color={colors.success} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Attendance</Text>
              <Text style={styles.actionDescription}>View attendance history</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(parent)/events')}
          >
            <IconSymbol name="event" size={24} color={colors.secondary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Events</Text>
              <Text style={styles.actionDescription}>View upcoming events</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(parent)/announcements')}
          >
            <IconSymbol name="megaphone" size={24} color={colors.accent} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Announcements</Text>
              <Text style={styles.actionDescription}>Read school updates</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(parent)/media')}
          >
            <IconSymbol name="photo" size={24} color={colors.primary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Media Gallery</Text>
              <Text style={styles.actionDescription}>View photos and videos</Text>
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
  notificationsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.border,
  },
  unreadNotification: {
    borderLeftColor: colors.accent,
    backgroundColor: colors.card,
  },
  notificationIcon: {
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: '600',
  },
  notificationDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    marginLeft: 8,
  },
  quickActions: {
    marginBottom: 20,
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
