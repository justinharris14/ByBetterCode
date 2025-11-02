
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { Announcement } from '@/types/database.types';

export default function AnnouncementsScreen() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
      Alert.alert('Error', 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnnouncements();
    setRefreshing(false);
  };

  const openAddModal = () => {
    setFormData({
      title: '',
      message: '',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    console.log('handleSave called with data:', formData);
    console.log('Current user:', user);
    
    if (!formData.title || !formData.message) {
      console.log('Validation failed - missing required fields');
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!user) {
      console.log('Error: User not found');
      Alert.alert('Error', 'User not found');
      return;
    }

    console.log('Starting to save announcement...');
    try {
      // Get auth token and use REST API directly
      const token = await AsyncStorage.getItem('auth_token');
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch('https://bldlekwvgeatnqjwiowq.supabase.co/rest/v1/announcements', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsZGxla3d2Z2VhdG5xandpb3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MDEwOTcsImV4cCI6MjA3NzA3NzA5N30.S8YzBbuBaCgzy7Dhox0LlLLsXDgIvQep839mgkWI43g',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          title: formData.title,
          message: formData.message,
          created_by_id: user.user_id,
        }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.message || 'Failed to save');
      }
      Alert.alert('Success', 'Announcement created successfully');
      setModalVisible(false);
      loadAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      Alert.alert('Error', 'Failed to save announcement');
    }
  };

  const handleDelete = (announcement: Announcement) => {
    Alert.alert(
      'Delete Announcement',
      'Are you sure you want to delete this announcement?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('announcements')
                .delete()
                .eq('announcement_id', announcement.announcement_id);

              if (error) throw error;
              Alert.alert('Success', 'Announcement deleted successfully');
              loadAnnouncements();
            } catch (error) {
              console.error('Error deleting announcement:', error);
              Alert.alert('Error', 'Failed to delete announcement');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter function
  const getFilteredAnnouncements = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return announcements.filter((announcement) => {
      // Search query filter
      const matchesSearch = searchQuery === '' || 
        announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.message.toLowerCase().includes(searchQuery.toLowerCase());

      // Date range filter
      const announcementDate = new Date(announcement.created_at);
      let matchesDateRange = true;

      if (filterDateRange === 'today') {
        matchesDateRange = announcementDate >= today;
      } else if (filterDateRange === 'week') {
        matchesDateRange = announcementDate >= weekAgo;
      } else if (filterDateRange === 'month') {
        matchesDateRange = announcementDate >= monthAgo;
      }

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

  const filteredAnnouncements = getFilteredAnnouncements();

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search announcements..."
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

        {/* Filter Toggle Button */}
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

        {/* Filter Options */}
        {showFilters && (
          <View style={styles.filterContainer}>
            {/* Date Range Filter */}
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Date Range:</Text>
              <View style={styles.filterChips}>
                <TouchableOpacity
                  style={[styles.filterChip, filterDateRange === 'all' && styles.filterChipActive]}
                  onPress={() => setFilterDateRange('all')}
                >
                  <Text style={[styles.filterChipText, filterDateRange === 'all' && styles.filterChipTextActive]}>All Time</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, filterDateRange === 'today' && styles.filterChipActive]}
                  onPress={() => setFilterDateRange('today')}
                >
                  <Text style={[styles.filterChipText, filterDateRange === 'today' && styles.filterChipTextActive]}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, filterDateRange === 'week' && styles.filterChipActive]}
                  onPress={() => setFilterDateRange('week')}
                >
                  <Text style={[styles.filterChipText, filterDateRange === 'week' && styles.filterChipTextActive]}>Last 7 Days</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, filterDateRange === 'month' && styles.filterChipActive]}
                  onPress={() => setFilterDateRange('month')}
                >
                  <Text style={[styles.filterChipText, filterDateRange === 'month' && styles.filterChipTextActive]}>Last 30 Days</Text>
                </TouchableOpacity>
              </View>
            </View>

            {hasActiveFilters && (
              <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                <Text style={styles.clearFiltersText}>Clear All Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Results Count */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredAnnouncements.length} {filteredAnnouncements.length === 1 ? 'announcement' : 'announcements'} found
          </Text>
          <TouchableOpacity style={[buttonStyles.primary, styles.addButton]} onPress={openAddModal}>
            <Text style={styles.addButtonText}>+ New</Text>
          </TouchableOpacity>
        </View>

        {filteredAnnouncements.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {hasActiveFilters ? 'No announcements match your filters' : 'No announcements yet'}
            </Text>
          </View>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <View key={announcement.announcement_id} style={commonStyles.cardWhite}>
              <View style={styles.announcementHeader}>
                <View style={styles.announcementInfo}>
                  <Text style={styles.announcementTitle}>{announcement.title}</Text>
                  <Text style={styles.announcementDate}>
                    {formatDate(announcement.created_at)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(announcement)}
                  style={styles.deleteButton}
                >
                  <IconSymbol name="trash" size={20} color={colors.accent} />
                </TouchableOpacity>
              </View>
              <Text style={styles.announcementMessage}>{announcement.message}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Announcement</Text>

            <TextInput
              style={commonStyles.input}
              placeholder="Title *"
              placeholderTextColor={colors.textSecondary}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
            <TextInput
              style={[commonStyles.input, styles.messageInput]}
              placeholder="Message *"
              placeholderTextColor={colors.textSecondary}
              value={formData.message}
              onChangeText={(text) => setFormData({ ...formData, message: text })}
              multiline
              numberOfLines={6}
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
                onPress={() => {
                  console.log('Post button clicked!');
                  handleSave();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>Post</Text>
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
  filterToggleActive: {
    borderColor: colors.primary,
    backgroundColor: colors.lightBlue,
  },
  filterToggleText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  filterToggleTextActive: {
    color: colors.primary,
  },
  filterContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterRow: {
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
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
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.white,
  },
  clearFiltersButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addButtonText: {
    color: colors.text,
    fontSize: 14,
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
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  announcementInfo: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  announcementDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  deleteButton: {
    padding: 8,
  },
  announcementMessage: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
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
  messageInput: {
    height: 120,
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
