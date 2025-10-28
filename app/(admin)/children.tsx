
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
import { Child, User } from '@/types/database.types';

export default function ChildrenScreen() {
  const [children, setChildren] = useState<Child[]>([]);
  const [parents, setParents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [parentPickerVisible, setParentPickerVisible] = useState(false);
  const [genderPickerVisible, setGenderPickerVisible] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    dob: '',
    gender: '',
    parent_id: '',
    allergies: '',
    medical_info: '',
    blood_type: '',
    doctor_name: '',
    doctor_phone: '',
    medical_aid_name: '',
    medical_aid_number: '',
    chronic_conditions: '',
    medications: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    special_needs: '',
    dietary_restrictions: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [childrenResult, parentsResult] = await Promise.all([
        supabase.from('children').select('*').order('first_name', { ascending: true }),
        supabase.from('users').select('*').eq('role', 'parent').order('first_name', { ascending: true }),
      ]);

      if (childrenResult.error) throw childrenResult.error;
      if (parentsResult.error) throw parentsResult.error;

      setChildren(childrenResult.data || []);
      setParents(parentsResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
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
      gender: '',
      parent_id: '',
      allergies: '',
      medical_info: '',
      blood_type: '',
      doctor_name: '',
      doctor_phone: '',
      medical_aid_name: '',
      medical_aid_number: '',
      chronic_conditions: '',
      medications: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relationship: '',
      special_needs: '',
      dietary_restrictions: '',
    });
    setModalVisible(true);
  };

  const openEditModal = (child: Child) => {
    setEditingChild(child);
    setFormData({
      first_name: child.first_name,
      last_name: child.last_name,
      dob: child.dob,
      gender: child.gender || '',
      parent_id: child.parent_id,
      allergies: child.allergies || '',
      medical_info: child.medical_info || '',
      blood_type: child.blood_type || '',
      doctor_name: child.doctor_name || '',
      doctor_phone: child.doctor_phone || '',
      medical_aid_name: child.medical_aid_name || '',
      medical_aid_number: child.medical_aid_number || '',
      chronic_conditions: child.chronic_conditions || '',
      medications: child.medications || '',
      emergency_contact_name: child.emergency_contact_name || '',
      emergency_contact_phone: child.emergency_contact_phone || '',
      emergency_contact_relationship: child.emergency_contact_relationship || '',
      special_needs: child.special_needs || '',
      dietary_restrictions: child.dietary_restrictions || '',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name || !formData.dob || !formData.parent_id) {
      Alert.alert('Error', 'Please fill in all required fields (Name, DOB, Parent)');
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        gender: formData.gender || null,
        blood_type: formData.blood_type || null,
      };

      if (editingChild) {
        const { error } = await supabase
          .from('children')
          .update(dataToSave)
          .eq('child_id', editingChild.child_id);

        if (error) throw error;
        Alert.alert('Success', 'Child updated successfully');
      } else {
        const { error } = await supabase
          .from('children')
          .insert([dataToSave]);

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

  const getParentName = (parentId: string) => {
    const parent = parents.find((p) => p.user_id === parentId);
    return parent ? `${parent.first_name} ${parent.last_name}` : 'Unknown';
  };

  const selectParent = (parentId: string) => {
    setFormData({ ...formData, parent_id: parentId });
    setParentPickerVisible(false);
  };

  const selectGender = (gender: string) => {
    setFormData({ ...formData, gender });
    setGenderPickerVisible(false);
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
                    Parent: {getParentName(child.parent_id)}
                  </Text>
                  <Text style={commonStyles.textSecondary}>
                    DOB: {new Date(child.dob).toLocaleDateString()} • Age: {new Date().getFullYear() - new Date(child.dob).getFullYear()}
                  </Text>
                  {child.gender && (
                    <Text style={commonStyles.textSecondary}>
                      Gender: {child.gender.charAt(0).toUpperCase() + child.gender.slice(1)}
                    </Text>
                  )}
                  {child.blood_type && (
                    <Text style={commonStyles.textSecondary}>
                      Blood Type: {child.blood_type}
                    </Text>
                  )}
                  {child.allergies && (
                    <Text style={styles.allergyText}>⚠️ Allergies: {child.allergies}</Text>
                  )}
                  {child.chronic_conditions && (
                    <Text style={styles.medicalText}>🏥 Chronic: {child.chronic_conditions}</Text>
                  )}
                  {child.medications && (
                    <Text style={styles.medicalText}>💊 Medications: {child.medications}</Text>
                  )}
                  {child.dietary_restrictions && (
                    <Text style={commonStyles.textSecondary}>
                      🍽️ Diet: {child.dietary_restrictions}
                    </Text>
                  )}
                  {child.emergency_contact_name && (
                    <View style={styles.emergencySection}>
                      <Text style={styles.emergencyTitle}>Emergency Contact:</Text>
                      <Text style={styles.emergencyText}>
                        {child.emergency_contact_name} ({child.emergency_contact_relationship})
                      </Text>
                      <Text style={styles.emergencyText}>
                        📞 {child.emergency_contact_phone}
                      </Text>
                    </View>
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

      {/* Main Form Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editingChild ? 'Edit Child' : 'Add Child'}
              </Text>

              <Text style={styles.sectionTitle}>Basic Information</Text>
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
              
              <TouchableOpacity
                style={[commonStyles.input, styles.pickerButton]}
                onPress={() => setGenderPickerVisible(true)}
              >
                <Text style={formData.gender ? styles.pickerText : styles.pickerPlaceholder}>
                  {formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : 'Select Gender'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[commonStyles.input, styles.pickerButton]}
                onPress={() => setParentPickerVisible(true)}
              >
                <Text style={formData.parent_id ? styles.pickerText : styles.pickerPlaceholder}>
                  {formData.parent_id ? getParentName(formData.parent_id) : 'Select Parent *'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>Medical Information</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="Blood Type (e.g., A+, O-)"
                placeholderTextColor={colors.textSecondary}
                value={formData.blood_type}
                onChangeText={(text) => setFormData({ ...formData, blood_type: text })}
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
                placeholder="Chronic Conditions (e.g., Asthma, Diabetes)"
                placeholderTextColor={colors.textSecondary}
                value={formData.chronic_conditions}
                onChangeText={(text) => setFormData({ ...formData, chronic_conditions: text })}
                multiline
              />
              <TextInput
                style={commonStyles.input}
                placeholder="Current Medications & Dosages"
                placeholderTextColor={colors.textSecondary}
                value={formData.medications}
                onChangeText={(text) => setFormData({ ...formData, medications: text })}
                multiline
              />
              <TextInput
                style={commonStyles.input}
                placeholder="General Medical Information"
                placeholderTextColor={colors.textSecondary}
                value={formData.medical_info}
                onChangeText={(text) => setFormData({ ...formData, medical_info: text })}
                multiline
              />

              <Text style={styles.sectionTitle}>Doctor Information</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="Doctor Name"
                placeholderTextColor={colors.textSecondary}
                value={formData.doctor_name}
                onChangeText={(text) => setFormData({ ...formData, doctor_name: text })}
              />
              <TextInput
                style={commonStyles.input}
                placeholder="Doctor Phone"
                placeholderTextColor={colors.textSecondary}
                value={formData.doctor_phone}
                onChangeText={(text) => setFormData({ ...formData, doctor_phone: text })}
                keyboardType="phone-pad"
              />

              <Text style={styles.sectionTitle}>Medical Aid</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="Medical Aid Name"
                placeholderTextColor={colors.textSecondary}
                value={formData.medical_aid_name}
                onChangeText={(text) => setFormData({ ...formData, medical_aid_name: text })}
              />
              <TextInput
                style={commonStyles.input}
                placeholder="Medical Aid Number"
                placeholderTextColor={colors.textSecondary}
                value={formData.medical_aid_number}
                onChangeText={(text) => setFormData({ ...formData, medical_aid_number: text })}
              />

              <Text style={styles.sectionTitle}>Emergency Contact</Text>
              <Text style={styles.helperText}>
                (If different from parent)
              </Text>
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
                placeholder="Relationship (e.g., Grandparent, Aunt)"
                placeholderTextColor={colors.textSecondary}
                value={formData.emergency_contact_relationship}
                onChangeText={(text) => setFormData({ ...formData, emergency_contact_relationship: text })}
              />

              <Text style={styles.sectionTitle}>Additional Information</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="Special Needs"
                placeholderTextColor={colors.textSecondary}
                value={formData.special_needs}
                onChangeText={(text) => setFormData({ ...formData, special_needs: text })}
                multiline
              />
              <TextInput
                style={commonStyles.input}
                placeholder="Dietary Restrictions"
                placeholderTextColor={colors.textSecondary}
                value={formData.dietary_restrictions}
                onChangeText={(text) => setFormData({ ...formData, dietary_restrictions: text })}
                multiline
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

      {/* Parent Picker Modal */}
      <Modal visible={parentPickerVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <Text style={styles.pickerModalTitle}>Select Parent</Text>
            <ScrollView>
              {parents.map((parent) => (
                <TouchableOpacity
                  key={parent.user_id}
                  style={styles.pickerOption}
                  onPress={() => selectParent(parent.user_id)}
                >
                  <Text style={styles.pickerOptionText}>
                    {parent.first_name} {parent.last_name}
                  </Text>
                  <Text style={styles.pickerOptionSubtext}>{parent.email}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[buttonStyles.outline, { marginTop: 16 }]}
              onPress={() => setParentPickerVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Gender Picker Modal */}
      <Modal visible={genderPickerVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <Text style={styles.pickerModalTitle}>Select Gender</Text>
            <TouchableOpacity
              style={styles.pickerOption}
              onPress={() => selectGender('male')}
            >
              <Text style={styles.pickerOptionText}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.pickerOption}
              onPress={() => selectGender('female')}
            >
              <Text style={styles.pickerOptionText}>Female</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.pickerOption}
              onPress={() => selectGender('other')}
            >
              <Text style={styles.pickerOptionText}>Other</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[buttonStyles.outline, { marginTop: 16 }]}
              onPress={() => setGenderPickerVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
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
    fontWeight: '600',
  },
  medicalText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginTop: 2,
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
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  pickerButton: {
    justifyContent: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: colors.text,
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  pickerModal: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  pickerModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  pickerOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerOptionText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  pickerOptionSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
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
