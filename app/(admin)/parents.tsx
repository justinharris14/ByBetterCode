
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
import { Parent } from '@/types/database.types';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function ParentsScreen() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
  });

  useEffect(() => {
    loadParents();
  }, []);

  const loadParents = async () => {
    try {
      const { data, error } = await supabase
        .from('parents')
        .select('*')
        .order('first_name', { ascending: true });

      if (error) throw error;
      setParents(data || []);
    } catch (error) {
      console.error('Error loading parents:', error);
      Alert.alert('Error', 'Failed to load parents');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadParents();
    setRefreshing(false);
  };

  const openAddModal = () => {
    setEditingParent(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relationship: '',
    });
    setModalVisible(true);
  };

  const openEditModal = (parent: Parent) => {
    setEditingParent(parent);
    setFormData({
      first_name: parent.first_name,
      last_name: parent.last_name,
      email: parent.email,
      phone: parent.phone || '',
      address: parent.address || '',
      emergency_contact_name: parent.emergency_contact_name || '',
      emergency_contact_phone: parent.emergency_contact_phone || '',
      emergency_contact_relationship: parent.emergency_contact_relationship || '',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (editingParent) {
        const { error } = await supabase
          .from('parents')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('parent_id', editingParent.parent_id);

        if (error) throw error;
        Alert.alert('Success', 'Parent updated successfully');
      } else {
        // First create a user account
        const { data: userData, error: userError } = await supabase
          .from('users')
          .insert([{
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone,
            role: 'parent',
          }])
          .select()
          .single();

        if (userError) throw userError;

        // Then create parent record
        const { error: parentError } = await supabase
          .from('parents')
          .insert([{ ...formData, user_id: userData.user_id }]);

        if (parentError) throw parentError;
        Alert.alert('Success', 'Parent added successfully');
      }

      setModalVisible(false);
      loadParents();
    } catch (error) {
      console.error('Error saving parent:', error);
      Alert.alert('Error', 'Failed to save parent');
    }
  };

  const handleDelete = (parent: Parent) => {
    Alert.alert(
      'Delete Parent',
      `Are you sure you want to delete ${parent.first_name} ${parent.last_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('parents')
                .delete()
                .eq('parent_id', parent.parent_id);

              if (error) throw error;
              Alert.alert('Success', 'Parent deleted successfully');
              loadParents();
            } catch (error) {
              console.error('Error deleting parent:', error);
              Alert.alert('Error', 'Failed to delete parent');
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
          <Text style={styles.addButtonText}>+ Add Parent</Text>
        </TouchableOpacity>

        {parents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No parents registered yet</Text>
          </View>
        ) : (
          parents.map((parent) => (
            <View key={parent.parent_id} style={commonStyles.cardWhite}>
              <View style={styles.parentHeader}>
                <View style={styles.parentInfo}>
                  <Text style={styles.parentName}>
                    {parent.first_name} {parent.last_name}
                  </Text>
                  <Text style={commonStyles.textSecondary}>📧 {parent.email}</Text>
                  {parent.phone && (
                    <Text style={commonStyles.textSecondary}>📱 {parent.phone}</Text>
                  )}
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => openEditModal(parent)} style={styles.actionButton}>
                    <IconSymbol name="pencil" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(parent)} style={styles.actionButton}>
                    <IconSymbol name="trash" size={20} color={colors.accent} />
                  </TouchableOpacity>
                </View>
              </View>
              {parent.address && (
                <Text style={styles.infoText}>🏠 {parent.address}</Text>
              )}
              {parent.emergency_contact_name && (
                <View style={styles.emergencySection}>
                  <Text style={styles.emergencyTitle}>Emergency Contact:</Text>
                  <Text style={styles.infoText}>
                    {parent.emergency_contact_name} ({parent.emergency_contact_relationship})
                  </Text>
                  <Text style={styles.infoText}>📞 {parent.emergency_contact_phone}</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingParent ? 'Edit Parent' : 'Add Parent'}
            </Text>

            <ScrollView>
              <Text style={styles.sectionLabel}>Personal Information</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="First Name *"
                value={formData.first_name}
                onChangeText={(text) => setFormData({ ...formData, first_name: text })}
              />
              <TextInput
                style={commonStyles.input}
                placeholder="Last Name *"
                value={formData.last_name}
                onChangeText={(text) => setFormData({ ...formData, last_name: text })}
              />
              <TextInput
                style={commonStyles.input}
                placeholder="Email *"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={commonStyles.input}
                placeholder="Phone"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />
              <TextInput
                style={commonStyles.input}
                placeholder="Address"
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                multiline
              />

              <Text style={styles.sectionLabel}>Emergency Contact</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="Emergency Contact Name"
                value={formData.emergency_contact_name}
                onChangeText={(text) => setFormData({ ...formData, emergency_contact_name: text })}
              />
              <TextInput
                style={commonStyles.input}
                placeholder="Emergency Contact Phone"
                value={formData.emergency_contact_phone}
                onChangeText={(text) => setFormData({ ...formData, emergency_contact_phone: text })}
                keyboardType="phone-pad"
              />
              <TextInput
                style={commonStyles.input}
                placeholder="Relationship (e.g., Spouse, Sibling)"
                value={formData.emergency_contact_relationship}
                onChangeText={(text) => setFormData({ ...formData, emergency_contact_relationship: text })}
              />
            </ScrollView>

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
                <Text style={styles.saveButtonText}>Save</Text>
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
  parentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  parentInfo: {
    flex: 1,
  },
  parentName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    marginTop: 4,
  },
  emergencySection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
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
