
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
    if (!formData.title || !formData.message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      const { error } = await supabase
        .from('announcements')
        .insert([{
          title: formData.title,
          message: formData.message,
          created_by_id: user.user_id,
        }]);

      if (error) throw error;
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
          <Text style={styles.addButtonText}>+ New Announcement</Text>
        </TouchableOpacity>

        {announcements.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No announcements yet</Text>
          </View>
        ) : (
          announcements.map((announcement) => (
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
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
            <TextInput
              style={[commonStyles.input, styles.messageInput]}
              placeholder="Message *"
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
                onPress={handleSave}
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
