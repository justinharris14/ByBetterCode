
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { colors, commonStyles } from '@/styles/commonStyles';
import { Announcement } from '@/types/database.types';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

export default function ParentAnnouncementsScreen() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const markAllAnnouncementsAsRead = useCallback(async () => {
    if (!user) return;

    try {
      // Mark all announcement notifications as read for this parent
      const { error } = await supabase
        .from('announcement_notifications')
        .update({ is_read: true })
        .eq('parent_id', user.user_id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking announcements as read:', error);
      } else {
        console.log('All announcements marked as read');
      }
    } catch (error) {
      console.error('Error in markAllAnnouncementsAsRead:', error);
    }
  }, [user]);

  const loadAnnouncements = useCallback(async () => {
    try {
      console.log('Loading announcements...');
      
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading announcements:', error);
        return;
      }

      console.log('Announcements loaded:', data);
      setAnnouncements(data || []);

      // Mark all announcements as read when viewing this screen
      await markAllAnnouncementsAsRead();
    } catch (error) {
      console.error('Error in loadAnnouncements:', error);
    }
  }, [markAllAnnouncementsAsRead]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnnouncements();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
          <Text style={styles.title}>Announcements</Text>
          <Text style={styles.subtitle}>
            {announcements.length} {announcements.length === 1 ? 'announcement' : 'announcements'}
          </Text>
        </View>

        {announcements.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📢</Text>
            <Text style={styles.emptyText}>No announcements</Text>
            <Text style={styles.emptySubtext}>
              Check back later for updates
            </Text>
          </View>
        ) : (
          <View style={styles.announcementsList}>
            {announcements.map((announcement) => (
              <View key={announcement.announcement_id} style={styles.announcementCard}>
                <View style={styles.announcementHeader}>
                  <View style={styles.announcementIcon}>
                    <IconSymbol name={"notifications" as any} size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.announcementDate}>
                    {formatDate(announcement.created_at)}
                  </Text>
                </View>

                <Text style={styles.announcementTitle}>{announcement.title}</Text>
                <Text style={styles.announcementMessage}>{announcement.message}</Text>
              </View>
            ))}
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
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
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
  announcementsList: {
    padding: 20,
    gap: 16,
  },
  announcementCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  announcementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  announcementDate: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  announcementMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
