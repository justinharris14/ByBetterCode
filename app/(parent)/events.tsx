
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { colors, commonStyles } from '@/styles/commonStyles';
import { Event } from '@/types/database.types';
import { IconSymbol } from '@/components/IconSymbol';

export default function ParentEventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      console.log('Loading events...');
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('event_datetime', new Date().toISOString())
        .order('event_datetime', { ascending: true });

      if (error) {
        console.error('Error loading events:', error);
        return;
      }

      console.log('Events loaded:', data);
      setEvents(data || []);
    } catch (error) {
      console.error('Error in loadEvents:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('en-ZA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-ZA', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const getDaysUntil = (dateTimeString: string) => {
    const eventDate = new Date(dateTimeString);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
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
          <Text style={styles.title}>Upcoming Events</Text>
          <Text style={styles.subtitle}>
            {events.length} {events.length === 1 ? 'event' : 'events'} scheduled
          </Text>
        </View>

        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>No upcoming events</Text>
            <Text style={styles.emptySubtext}>
              Check back later for new events
            </Text>
          </View>
        ) : (
          <View style={styles.eventsList}>
            {events.map((event) => {
              const { date, time } = formatDateTime(event.event_datetime);
              const daysUntil = getDaysUntil(event.event_datetime);
              
              return (
                <View key={event.event_id} style={styles.eventCard}>
                  <View style={styles.eventHeader}>
                    <View style={styles.eventIcon}>
                      <IconSymbol name="event" size={28} color={colors.primary} />
                    </View>
                    <View style={styles.eventBadge}>
                      <Text style={styles.eventBadgeText}>{daysUntil}</Text>
                    </View>
                  </View>

                  <Text style={styles.eventTitle}>{event.title}</Text>
                  
                  {event.description && (
                    <Text style={styles.eventDescription}>{event.description}</Text>
                  )}

                  <View style={styles.eventDetails}>
                    <View style={styles.eventDetailRow}>
                      <IconSymbol name="calendar.today" size={18} color={colors.textSecondary} />
                      <Text style={styles.eventDetailText}>{date}</Text>
                    </View>
                    <View style={styles.eventDetailRow}>
                      <IconSymbol name="schedule" size={18} color={colors.textSecondary} />
                      <Text style={styles.eventDetailText}>{time}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
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
  eventsList: {
    padding: 20,
    gap: 16,
  },
  eventCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  eventBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  eventDetails: {
    gap: 8,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
