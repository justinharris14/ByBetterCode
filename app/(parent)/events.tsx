
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { Event } from '@/types/database.types';
import { IconSymbol } from '@/components/IconSymbol';
import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';

export default function ParentEventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [calendarPermission, setCalendarPermission] = useState(false);

  useEffect(() => {
    loadEvents();
    checkCalendarPermissions();
    requestNotificationPermissions();
  }, []);

  const checkCalendarPermissions = async () => {
    const { status } = await Calendar.getCalendarPermissionsAsync();
    setCalendarPermission(status === 'granted');
  };

  const requestNotificationPermissions = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
    }
  };

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

  const addToCalendar = async (event: Event) => {
    try {
      // Request calendar permissions
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Calendar permission is required to add events to your calendar.'
        );
        return;
      }

      // Get the default calendar or create one
      let calendarId: string;
      
      if (Platform.OS === 'ios') {
        const defaultCalendar = await Calendar.getDefaultCalendarAsync();
        calendarId = defaultCalendar.id;
      } else {
        // Android - get or create calendar
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const appCalendar = calendars.find(cal => cal.title === 'CrècheConnect');
        
        if (appCalendar) {
          calendarId = appCalendar.id;
        } else {
          // Create a new calendar
          const defaultCalendarSource = {
            isLocalAccount: true,
            name: 'CrècheConnect',
            type: Calendar.SourceType.LOCAL,
          };
          
          calendarId = await Calendar.createCalendarAsync({
            title: 'CrècheConnect',
            color: colors.primary,
            entityType: Calendar.EntityTypes.EVENT,
            sourceId: defaultCalendarSource.name,
            source: defaultCalendarSource,
            name: 'CrècheConnect',
            ownerAccount: 'personal',
            accessLevel: Calendar.CalendarAccessLevel.OWNER,
          });
        }
      }

      // Create the event
      const eventDate = new Date(event.event_datetime);
      const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000); // 1 hour duration

      const eventId = await Calendar.createEventAsync(calendarId, {
        title: event.title,
        notes: event.description || '',
        startDate: eventDate,
        endDate: endDate,
        timeZone: 'Africa/Johannesburg',
        alarms: [
          { relativeOffset: -60 }, // 1 hour before
          { relativeOffset: -1440 }, // 1 day before
        ],
      });

      console.log('Event added to calendar:', eventId);
      Alert.alert(
        'Success',
        'Event has been added to your calendar!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error adding event to calendar:', error);
      Alert.alert(
        'Error',
        'Failed to add event to calendar. Please try again.'
      );
    }
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
                      <IconSymbol name={"event" as any} size={28} color={colors.primary} />
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
                      <IconSymbol name={"calendar.today" as any} size={18} color={colors.textSecondary} />
                      <Text style={styles.eventDetailText}>{date}</Text>
                    </View>
                    <View style={styles.eventDetailRow}>
                      <IconSymbol name={"schedule" as any} size={18} color={colors.textSecondary} />
                      <Text style={styles.eventDetailText}>{time}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[buttonStyles.primary, styles.addToCalendarButton]}
                    onPress={() => addToCalendar(event)}
                  >
                    <IconSymbol name="calendar.badge.plus" size={20} color={colors.text} />
                    <Text style={styles.addToCalendarText}>Add to Calendar</Text>
                  </TouchableOpacity>
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
    marginBottom: 16,
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
  addToCalendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  addToCalendarText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
