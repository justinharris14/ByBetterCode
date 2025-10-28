
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
import { Child } from '@/types/database.types';

export default function ChildrenScreen() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    dob: '',
    allergies: '',
    medical_info: '',
    parent_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .order('first_name', { ascending: true });

      if (error) throw error;
      setChildren(data || []);
    } catch (error) {
      console.error('Error loading children:', error);
      Alert.alert('Error', 'Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openAddModal = () => {
    setEditingChild(null);
    setFormData({
      first_name: '',
      last_name: '',
      dob: '',
      allergies: '',
      medical_info: '',
      parent_id: '',
    });
    setModalVisible(true);
  };

  const openEditModal = (child: Child) => {
    setEditingChild(child);
    setFormData({
      first_name: child.first_name,
      last_name: child.last_name,
      dob: child.dob,
      allergies: child.allergies || '',
      medical_info: child.medical_info || '',
      parent_id: child.parent_id,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name || !formData.dob || !formData.parent_id) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (editingChild) {
        const { error } = await supabase
          .from('children')
          .update(formData)
          .eq('child_id', editingChild.child_id);

        if (error) throw error;
        Alert.alert('Success', 'Child updated successfully');
      } else {
        const { error } = await supabase
          .from('children')
          .insert([formData]);

        if (error) throw error;
        Alert.alert('Success', 'Child added successfully');
      }

      setModalVisible(false);
      loadData();
    } catch (error) {
      console.error('Error saving child:', error);
      Alert.alert('Error', 'Failed to save child');
    }
  };

  const handleDelete = (child: Child) => {
    Alert.alert(
      'Delete Child',
      `Are you sure you want to delete ${child.first_name} ${child.last_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('children')
                .delete()
                .eq('child_id', child.child_id);

              if (error) throw error;
              Alert.alert('Success', 'Child deleted successfully');
              loadData();
            } catch (error) {
              console.error('Error deleting child:', error);
              Alert.alert('Error', 'Failed to delete child');
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
          <Text style={styles.addButtonText}>+ Add Child</Text>
        </TouchableOpacity>

        {children.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No children registered yet</Text>
          </View>
        ) : (
          children.map((child) => (
            <View key={child.child_id} style={commonStyles.cardWhite}>
              <View style={styles.childHeader}>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>
                    {child.first_name} {child.last_name}
                  </Text>
                  <Text style={commonStyles.textSecondary}>
                    DOB: {new Date(child.dob).toLocaleDateString()}
                  </Text>
                  <Text style={commonStyles.textSecondary}>
                    Age: {new Date().getFullYear() - new Date(child.dob).getFullYear()}
                  </Text>
                  {child.allergies && (
                    <Text style={styles.allergyText}>⚠️ Allergies: {child.allergies}</Text>
                  )}
                  {child.medical_info && (
                    <Text style={commonStyles.textSecondary}>
                      Medical: {child.medical_info}
                    </Text>
                  )}
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => openEditModal(child)} style={styles.actionButton}>
                    <IconSymbol name="pencil" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(child)} style={styles.actionButton}>
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
            <Text style={styles.modalTitle}>
              {editingChild ? 'Edit Child' : 'Add Child'}
            </Text>

            <ScrollView>
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
                placeholder="Date of Birth (YYYY-MM-DD) *"
                placeholderTextColor={colors.textSecondary}
                value={formData.dob}
                onChangeText={(text) => setFormData({ ...formData, dob: text })}
              />
              <TextInput
                style={commonStyles.input}
                placeholder="Parent ID *"
                placeholderTextColor={colors.textSecondary}
                value={formData.parent_id}
                onChangeText={(text) => setFormData({ ...formData, parent_id: text })}
              />
              <TextInput
                style={commonStyles.input}
                placeholder="Allergies"
                placeholderTextColor={colors.textSecondary}
                value={formData.allergies}
                onChangeText={(text) => setFormData({ ...formData, allergies: text })}
                multiline
              />
              <TextInput
                style={commonStyles.input}
                placeholder="Medical Information"
                placeholderTextColor={colors.textSecondary}
                value={formData.medical_info}
                onChangeText={(text) => setFormData({ ...formData, medical_info: text })}
                multiline
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
  childHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  allergyText: {
    fontSize: 14,
    color: colors.accent,
    marginTop: 4,
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
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
