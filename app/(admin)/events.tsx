
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  RefreshControl,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Event } from '@/types/database.types';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import * as Notifications from 'expo-notifications';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function EventsScreen() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_datetime: '',
  });

  useEffect(() => {
    loadEvents();
    requestNotificationPermissions();
  }, []);

  const requestNotificationPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_datetime', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const openAddModal = () => {
    setFormData({
      title: '',
      description: '',
      event_datetime: '',
    });
    setModalVisible(true);
  };

  const sendNotificationsToAllParents = async (event: Event) => {
    try {
      console.log('Sending notifications to all parents for event:', event.title);

      // Get all parents
      const { data: parents, error: parentsError } = await supabase
        .from('users')
        .select('user_id, first_name, last_name')
        .eq('role', 'parent')
        .eq('is_active', true);

      if (parentsError) {
        console.error('Error fetching parents:', parentsError);
        return;
      }

      if (!parents || parents.length === 0) {
        console.log('No parents found to notify');
        return;
      }

      console.log(`Found ${parents.length} parents to notify`);

      // Create event notifications for all parents
      const notifications = parents.map(parent => ({
        event_id: event.event_id,
        parent_id: parent.user_id,
        is_read: false,
      }));

      const { error: notificationError } = await supabase
        .from('event_notifications')
        .insert(notifications);

      if (notificationError) {
        console.error('Error creating event notifications:', notificationError);
        return;
      }

      console.log(`Successfully created ${notifications.length} event notifications`);

      // Schedule local notifications for all parents
      const eventDate = new Date(event.event_datetime);
      const formattedDate = eventDate.toLocaleDateString('en-ZA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const formattedTime = eventDate.toLocaleTimeString('en-ZA', {
        hour: '2-digit',
        minute: '2-digit',
      });

      // Schedule immediate notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📅 New Event: ' + event.title,
          body: `${event.description || 'No description'}\n📆 ${formattedDate} at ${formattedTime}`,
          data: { 
            eventId: event.event_id,
            type: 'event',
            url: '/(parent)/events',
          },
          sound: true,
        },
        trigger: null, // Send immediately
      });

      // Schedule reminder 1 day before the event
      const oneDayBefore = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);
      if (oneDayBefore > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⏰ Event Reminder: ' + event.title,
            body: `Tomorrow at ${formattedTime}`,
            data: { 
              eventId: event.event_id,
              type: 'event_reminder',
              url: '/(parent)/events',
            },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: oneDayBefore,
          },
        });
      }

      // Schedule reminder 1 hour before the event
      const oneHourBefore = new Date(eventDate.getTime() - 60 * 60 * 1000);
      if (oneHourBefore > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🔔 Event Starting Soon: ' + event.title,
            body: `Starts in 1 hour`,
            data: { 
              eventId: event.event_id,
              type: 'event_reminder',
              url: '/(parent)/events',
            },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: oneHourBefore,
          },
        });
      }

      console.log('Notifications scheduled successfully');
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.event_datetime) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      // Validate date format
      const eventDate = new Date(formData.event_datetime);
      if (isNaN(eventDate.getTime())) {
        Alert.alert('Error', 'Invalid date format. Please use YYYY-MM-DD HH:MM');
        return;
      }

      const { data, error } = await supabase
        .from('events')
        .insert([{
          ...formData,
          created_by_id: user?.user_id || '',
        }])
        .select()
        .single();

      if (error) throw error;

      // Send notifications to all parents
      if (data) {
        await sendNotificationsToAllParents(data);
      }

      Alert.alert(
        'Success', 
        'Event created successfully! All parents have been notified.',
        [{ text: 'OK' }]
      );
      setModalVisible(false);
      loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      Alert.alert('Error', 'Failed to save event');
    }
  };

  const handleDelete = (event: Event) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete event notifications first
              await supabase
                .from('event_notifications')
                .delete()
                .eq('event_id', event.event_id);

              // Delete the event
              const { error } = await supabase
                .from('events')
                .delete()
                .eq('event_id', event.event_id);

              if (error) throw error;
              Alert.alert('Success', 'Event deleted successfully');
              loadEvents();
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', 'Failed to delete event');
            }
          },
        },
      ]
    );
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
        <TouchableOpacity style={[buttonStyles.primary, styles.addButton]} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Create Event</Text>
        </TouchableOpacity>

        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No events scheduled</Text>
          </View>
        ) : (
          events.map((event) => (
            <View key={event.event_id} style={commonStyles.cardWhite}>
              <View style={styles.eventHeader}>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={commonStyles.textSecondary}>
                    📅 {new Date(event.event_datetime).toLocaleString()}
                  </Text>
                  <Text style={styles.eventDescription}>{event.description}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(event)} style={styles.deleteButton}>
                  <IconSymbol name="trash" size={20} color={colors.accent} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Event</Text>

            <TextInput
              style={commonStyles.input}
              placeholder="Event Title *"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
            <TextInput
              style={commonStyles.input}
              placeholder="Date & Time (YYYY-MM-DD HH:MM) *"
              value={formData.event_datetime}
              onChangeText={(text) => setFormData({ ...formData, event_datetime: text })}
            />
            <TextInput
              style={[commonStyles.input, styles.textArea]}
              placeholder="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[buttonStyles.outline, styles.modalButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[buttonStyles.primary, styles.modalButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Create & Notify</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  addButton: {
    marginBottom: 20,
  },
  addButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.text,
    marginTop: 8,
  },
  deleteButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    width: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
