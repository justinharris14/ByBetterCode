
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
import { User } from '@/types/database.types';

export default function ParentsScreen() {
  const [parents, setParents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingParent, setEditingParent] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    id_number: '',
    work_phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    secondary_emergency_contact_name: '',
    secondary_emergency_contact_phone: '',
    secondary_emergency_contact_relationship: '',
  });

  useEffect(() => {
    loadParents();
  }, []);

  const loadParents = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'parent')
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
      city: '',
      postal_code: '',
      id_number: '',
      work_phone: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relationship: '',
      secondary_emergency_contact_name: '',
      secondary_emergency_contact_phone: '',
      secondary_emergency_contact_relationship: '',
    });
    setModalVisible(true);
  };

  const openEditModal = (parent: User) => {
    setEditingParent(parent);
    setFormData({
      first_name: parent.first_name,
      last_name: parent.last_name,
      email: parent.email,
      phone: parent.phone || '',
      address: parent.address || '',
      city: parent.city || '',
      postal_code: parent.postal_code || '',
      id_number: parent.id_number || '',
      work_phone: parent.work_phone || '',
      emergency_contact_name: parent.emergency_contact_name || '',
      emergency_contact_phone: parent.emergency_contact_phone || '',
      emergency_contact_relationship: parent.emergency_contact_relationship || '',
      secondary_emergency_contact_name: parent.secondary_emergency_contact_name || '',
      secondary_emergency_contact_phone: parent.secondary_emergency_contact_phone || '',
      secondary_emergency_contact_relationship: parent.secondary_emergency_contact_relationship || '',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      Alert.alert('Error', 'Please fill in all required fields (Name and Email)');
      return;
    }

    try {
      if (editingParent) {
        const { error } = await supabase
          .from('users')
          .update(formData)
          .eq('user_id', editingParent.user_id);

        if (error) throw error;
        Alert.alert('Success', 'Parent updated successfully');
      } else {
        const { error } = await supabase
          .from('users')
          .insert([{ ...formData, role: 'parent' }]);

        if (error) throw error;
        Alert.alert('Success', 'Parent added successfully');
      }

      setModalVisible(false);
      loadParents();
    } catch (error) {
      console.error('Error saving parent:', error);
      Alert.alert('Error', 'Failed to save parent');
    }
  };

  const handleDelete = (parent: User) => {
    Alert.alert(
      'Delete Parent',
      `Are you sure you want to delete ${parent.first_name} ${parent.last_name}? This will also delete all associated children.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('users')
                .delete()
                .eq('user_id', parent.user_id);

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
            <View key={parent.user_id} style={commonStyles.cardWhite}>
              <View style={styles.parentHeader}>
                <View style={styles.parentInfo}>
                  <Text style={styles.parentName}>
                    {parent.first_name} {parent.last_name}
                  </Text>
                  <Text style={commonStyles.textSecondary}>📧 {parent.email}</Text>
                  {parent.phone && (
                    <Text style={commonStyles.textSecondary}>📱 {parent.phone}</Text>
                  )}
                  {parent.work_phone && (
                    <Text style={commonStyles.textSecondary}>💼 {parent.work_phone}</Text>
                  )}
                  {parent.address && (
                    <Text style={commonStyles.textSecondary}>
                      🏠 {parent.address}
                      {parent.city && `, ${parent.city}`}
                      {parent.postal_code && ` ${parent.postal_code}`}
                    </Text>
                  )}
                  {parent.emergency_contact_name && (
                    <View style={styles.emergencySection}>
                      <Text style={styles.emergencyTitle}>Emergency Contact:</Text>
                      <Text style={styles.emergencyText}>
                        {parent.emergency_contact_name} ({parent.emergency_contact_relationship})
                      </Text>
                      <Text style={styles.emergencyText}>
                        📞 {parent.emergency_contact_phone}
                      </Text>
                    </View>
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
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editingParent ? 'Edit Parent' : 'Add Parent'}
              </Text>

              <Text style={styles.sectionTitle}>Personal Information</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="First Name *"
                placeholderTextColor={colors.textSecondary}
                value={formData.first_name}
                onChangeText={(text) => setFormData({ ...formData, first_name: text })}
              />
              <TextInput
                style={commonStyles.input}
                placeholder="Last Name *"
                placeholderTextColor={colors.textSecondary}
                value={formData.last_name}
                onChangeText={(text) => setFormData({ ...formData, last_name: text })}
              />
              <TextInput
                style={commonStyles.input}
                placeholder="Email *"
                placeholderTextColor={colors.textSecondary}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={commonStyles.input}
                placeholder="ID Number"
                placeholderTextColor={colors.textSecondary}
                value={formData.id_number}
                onChangeText={(text) => setFormData({ ...formData, id_number: text })}
              />

              <Text style={styles.sectionTitle}>Contact Information</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="Mobile Phone"
                placeholderTextColor={colors.textSecondary}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />
              <TextInput
                style={commonStyles.input}
                placeholder="Work Phone"
                placeholderTextColor={colors.textSecondary}
                value={formData.work_phone}
                onChangeText={(text) => setFormData({ ...formData, work_phone: text })}
                keyboardType="phone-pad"
              />
              <TextInput
                style={commonStyles.input}
                placeholder="Address"
                placeholderTextColor={colors.textSecondary}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
              />
              <TextInput
                style={commonStyles.input}
                placeholder="City"
                placeholderTextColor={colors.textSecondary}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
              />
              <TextInput
                style={commonStyles.input}
                placeholder="Postal Code"
                placeholderTextColor={colors.textSecondary}
                value={formData.postal_code}
                onChangeText={(text) => setFormData({ ...formData, postal_code: text })}
                keyboardType="numeric"
              />

              <Text style={styles.sectionTitle}>Primary Emergency Contact</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="Emergency Contact Name"
                placeholderTextColor={colors.textSecondary}
                value={formData.emergency_contact_name}
                onChangeText={(text) => setFormData({ ...formData, emergency_contact_name: text })}
              />
              <TextInput
                style={commonStyles.input}
                placeholder="Emergency Contact Phone"
                placeholderTextColor={colors.textSecondary}
                value={formData.emergency_contact_phone}
                onChangeText={(text) => setFormData({ ...formData, emergency_contact_phone: text })}
                keyboardType="phone-pad"
              />
              <TextInput
                style={commonStyles.input}
                placeholder="Relationship (e.g., Spouse, Sibling)"
                placeholderTextColor={colors.textSecondary}
                value={formData.emergency_contact_relationship}
                onChangeText={(text) => setFormData({ ...formData, emergency_contact_relationship: text })}
              />

              <Text style={styles.sectionTitle}>Secondary Emergency Contact</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="Secondary Contact Name"
                placeholderTextColor={colors.textSecondary}
                value={formData.secondary_emergency_contact_name}
                onChangeText={(text) => setFormData({ ...formData, secondary_emergency_contact_name: text })}
              />
              <TextInput
                style={commonStyles.input}
                placeholder="Secondary Contact Phone"
                placeholderTextColor={colors.textSecondary}
                value={formData.secondary_emergency_contact_phone}
                onChangeText={(text) => setFormData({ ...formData, secondary_emergency_contact_phone: text })}
                keyboardType="phone-pad"
              />
              <TextInput
                style={commonStyles.input}
                placeholder="Relationship"
                placeholderTextColor={colors.textSecondary}
                value={formData.secondary_emergency_contact_relationship}
                onChangeText={(text) => setFormData({ ...formData, secondary_emergency_contact_relationship: text })}
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
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  emergencySection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 4,
  },
  emergencyText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
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
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
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
