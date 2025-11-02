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
import { useRouter } from "expo-router";
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
  const router = useRouter(); // ✅ Added router instance

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'upcoming' | 'past' | 'today'>('all');
  const [showFilters, setShowFilters] = useState(false);

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

      // Immediate notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📅 New Event: ' + event.title,
          body: `${event.description || 'No description'}\n📆 ${formattedDate} at ${formattedTime}`,
          data: { eventId: event.event_id, type: 'event', url: '/(parent)/events' },
          sound: true,
        },
        trigger: null,
      });

      // 1-day reminder
      const oneDayBefore = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);
      if (oneDayBefore > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⏰ Event Reminder: ' + event.title,
            body: `Tomorrow at ${formattedTime}`,
            data: { eventId: event.event_id, type: 'event_reminder', url: '/(parent)/events' },
            sound: true,
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: oneDayBefore },
        });
      }

      // 1-hour reminder
      const oneHourBefore = new Date(eventDate.getTime() - 60 * 60 * 1000);
      if (oneHourBefore > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🔔 Event Starting Soon: ' + event.title,
            body: `Starts in 1 hour`,
            data: { eventId: event.event_id, type: 'event_reminder', url: '/(parent)/events' },
            sound: true,
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: oneHourBefore },
        });
      }

      console.log('Notifications scheduled successfully');
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  };

  // ✅ Updated handleSave function
  const handleSave = async () => {
    if (!formData.title || !formData.event_datetime) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
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

      if (data) {
        await sendNotificationsToAllParents(data);
      }

      Alert.alert(
        '✅ Success',
        'Event created successfully! All parents have been notified.',
        [
          {
            text: 'OK',
            onPress: () => {
              setModalVisible(false);
              router.replace('/(admin)/dashboard'); // ✅ redirect after save
            },
          },
        ]
      );

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
              await supabase.from('event_notifications').delete().eq('event_id', event.event_id);
              const { error } = await supabase.from('events').delete().eq('event_id', event.event_id);
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

  const getFilteredEvents = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return events.filter((event) => {
      const matchesSearch = searchQuery === '' ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const eventDate = new Date(event.event_datetime);
      let matchesDateRange = true;

      if (filterDateRange === 'upcoming') matchesDateRange = eventDate >= now;
      else if (filterDateRange === 'past') matchesDateRange = eventDate < now;
      else if (filterDateRange === 'today') matchesDateRange = eventDate >= today && eventDate < tomorrow;

      return matchesSearch && matchesDateRange;
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterDateRange('all');
  };

  const hasActiveFilters = searchQuery !== '' || filterDateRange !== 'all';

  if (loading) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <Text style={commonStyles.text}>Loading...</Text>
      </View>
    );
  }

  const filteredEvents = getFilteredEvents();

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Search */}
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <TouchableOpacity
          style={[styles.filterToggle, hasActiveFilters && styles.filterToggleActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <IconSymbol name="line.3.horizontal.decrease.circle" size={20} color={hasActiveFilters ? colors.primary : colors.text} />
          <Text style={[styles.filterToggleText, hasActiveFilters && styles.filterToggleTextActive]}>
            Filters {hasActiveFilters && '(Active)'}
          </Text>
          <IconSymbol name={showFilters ? "chevron.up" : "chevron.down"} size={16} color={hasActiveFilters ? colors.primary : colors.text} />
        </TouchableOpacity>

        {showFilters && (
          <View style={styles.filterContainer}>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Date Range:</Text>
              <View style={styles.filterChips}>
                {['all', 'today', 'upcoming', 'past'].map(range => (
                  <TouchableOpacity
                    key={range}
                    style={[styles.filterChip, filterDateRange === range && styles.filterChipActive]}
                    onPress={() => setFilterDateRange(range as any)}
                  >
                    <Text style={[styles.filterChipText, filterDateRange === range && styles.filterChipTextActive]}>
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {hasActiveFilters && (
              <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                <Text style={styles.clearFiltersText}>Clear All Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Results */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
          </Text>
          <TouchableOpacity style={[buttonStyles.primary, styles.addButton]} onPress={openAddModal}>
            <Text style={styles.addButtonText}>+ Create Event</Text>
          </TouchableOpacity>
        </View>

        {/* Event List */}
        {filteredEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {hasActiveFilters ? 'No events match your filters' : 'No events scheduled'}
            </Text>
          </View>
        ) : (
          filteredEvents.map((event) => {
            const eventDate = new Date(event.event_datetime);
            const isPast = eventDate < new Date();
            return (
              <View key={event.event_id} style={[commonStyles.cardWhite, isPast && styles.pastEventCard]}>
                <View style={styles.eventHeader}>
                  <View style={styles.eventInfo}>
                    <Text style={[styles.eventTitle, isPast && styles.pastEventText]}>{event.title}</Text>
                    <Text style={commonStyles.textSecondary}>📅 {eventDate.toLocaleString()}</Text>
                    {isPast && <Text style={styles.pastBadge}>Past Event</Text>}
                    <Text style={styles.eventDescription}>{event.description}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(event)} style={styles.deleteButton}>
                    <IconSymbol name="trash" size={20} color={colors.accent} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Event</Text>

            <TextInput
              style={commonStyles.input}
              placeholder="Event Title *"
              placeholderTextColor={colors.textSecondary}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
            <TextInput
              style={commonStyles.input}
              placeholder="Date & Time (YYYY-MM-DD HH:MM) *"
              placeholderTextColor={colors.textSecondary}
              value={formData.event_datetime}
              onChangeText={(text) => setFormData({ ...formData, event_datetime: text })}
            />
            <TextInput
              style={[commonStyles.input, styles.textArea]}
              placeholder="Description"
              placeholderTextColor={colors.textSecondary}
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
  scrollView: { flex: 1 },
  content: { padding: 20 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterToggleActive: { borderColor: colors.primary, backgroundColor: colors.lightBlue },
  filterToggleText: { flex: 1, marginLeft: 8, fontSize: 16, fontWeight: '600', color: colors.text },
  filterToggleTextActive: { color: colors.primary },
  filterContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterRow: { marginBottom: 8 },
  filterLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 },
  filterChips: { flexDirection: 'row', flexWrap: 'wrap' },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: 14, color: colors.text, fontWeight: '500' },
  filterChipTextActive: { color: colors.white },
  clearFiltersButton: { alignItems: 'center', paddingVertical: 12, marginTop: 8 },
  clearFiltersText: { fontSize: 14, fontWeight: '600', color: colors.accent },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  resultsCount: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  addButton: { paddingHorizontal: 16, paddingVertical: 10 },
  addButtonText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: colors.textSecondary },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 4 },
  eventDescription: { fontSize: 14, color: colors.text, marginTop: 8 },
  pastEventCard: { opacity: 0.7 },
  pastEventText: { color: colors.textSecondary },
  pastBadge: { fontSize: 12, color: colors.textSecondary, fontWeight: '600', marginTop: 4 },
  deleteButton: { padding: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: colors.white, borderRadius: 16, padding: 20, width: '90%' },
  modalTitle: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 20 },
  textArea: { height: 100, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  modalButton: { flex: 1, marginHorizontal: 8 },
  cancelButtonText: { color: colors.text, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  saveButtonText: { color: colors.text, fontSize: 16, fontWeight: '600', textAlign: 'center' },
});
