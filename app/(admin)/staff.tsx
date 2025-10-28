
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
import { Staff, Child, ChildStaffAssignment } from '@/types/database.types';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function StaffScreen() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [assignments, setAssignments] = useState<ChildStaffAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'teacher' as 'teacher' | 'assistant' | 'admin',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [staffData, childrenData, assignmentsData] = await Promise.all([
        supabase.from('staff').select('*').order('first_name', { ascending: true }),
        supabase.from('children').select('*').order('first_name', { ascending: true }),
        supabase.from('child_staff_assignments').select('*'),
      ]);

      if (staffData.error) throw staffData.error;
      if (childrenData.error) throw childrenData.error;
      if (assignmentsData.error) throw assignmentsData.error;

      setStaff(staffData.data || []);
      setChildren(childrenData.data || []);
      setAssignments(assignmentsData.data || []);
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
    setEditingStaff(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: 'teacher',
    });
    setModalVisible(true);
  };

  const openEditModal = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setFormData({
      first_name: staffMember.first_name,
      last_name: staffMember.last_name,
      email: staffMember.email,
      phone: staffMember.phone || '',
      role: staffMember.role,
    });
    setModalVisible(true);
  };

  const openAssignModal = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setAssignModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (editingStaff) {
        const { error } = await supabase
          .from('staff')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('staff_id', editingStaff.staff_id);

        if (error) throw error;
        Alert.alert('Success', 'Staff member updated successfully');
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

        // Then create staff record
        const { error: staffError } = await supabase
          .from('staff')
          .insert([{ ...formData, user_id: userData.user_id }]);

        if (staffError) throw staffError;
        Alert.alert('Success', 'Staff member added successfully');
      }

      setModalVisible(false);
      loadData();
    } catch (error) {
      console.error('Error saving staff:', error);
      Alert.alert('Error', 'Failed to save staff member');
    }
  };

  const handleAssignChild = async (childId: string) => {
    if (!selectedStaff) return;

    try {
      const { error } = await supabase
        .from('child_staff_assignments')
        .insert([{
          child_id: childId,
          staff_id: selectedStaff.staff_id,
        }]);

      if (error) {
        if (error.code === '23505') {
          Alert.alert('Info', 'This child is already assigned to this staff member');
        } else {
          throw error;
        }
      } else {
        Alert.alert('Success', 'Child assigned successfully');
        loadData();
      }
    } catch (error) {
      console.error('Error assigning child:', error);
      Alert.alert('Error', 'Failed to assign child');
    }
  };

  const handleUnassignChild = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('child_staff_assignments')
        .delete()
        .eq('assignment_id', assignmentId);

      if (error) throw error;
      Alert.alert('Success', 'Child unassigned successfully');
      loadData();
    } catch (error) {
      console.error('Error unassigning child:', error);
      Alert.alert('Error', 'Failed to unassign child');
    }
  };

  const getAssignedChildren = (staffId: string) => {
    const staffAssignments = assignments.filter(a => a.staff_id === staffId);
    return children.filter(c => staffAssignments.some(a => a.child_id === c.child_id));
  };

  const getAssignmentId = (staffId: string, childId: string) => {
    const assignment = assignments.find(a => a.staff_id === staffId && a.child_id === childId);
    return assignment?.assignment_id;
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
          <Text style={styles.addButtonText}>+ Add Staff Member</Text>
        </TouchableOpacity>

        {staff.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No staff members registered yet</Text>
          </View>
        ) : (
          staff.map((staffMember) => {
            const assignedChildren = getAssignedChildren(staffMember.staff_id);
            return (
              <View key={staffMember.staff_id} style={commonStyles.cardWhite}>
                <View style={styles.staffHeader}>
                  <View style={styles.staffInfo}>
                    <Text style={styles.staffName}>
                      {staffMember.first_name} {staffMember.last_name}
                    </Text>
                    <Text style={styles.roleText}>
                      {staffMember.role.charAt(0).toUpperCase() + staffMember.role.slice(1)}
                    </Text>
                    <Text style={commonStyles.textSecondary}>📧 {staffMember.email}</Text>
                    {staffMember.phone && (
                      <Text style={commonStyles.textSecondary}>📱 {staffMember.phone}</Text>
                    )}
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => openEditModal(staffMember)} style={styles.actionButton}>
                      <IconSymbol name="pencil" size={20} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.assignmentSection}>
                  <View style={styles.assignmentHeader}>
                    <Text style={styles.assignmentTitle}>
                      Assigned Children ({assignedChildren.length})
                    </Text>
                    <TouchableOpacity
                      style={styles.assignButton}
                      onPress={() => openAssignModal(staffMember)}
                    >
                      <Text style={styles.assignButtonText}>+ Assign</Text>
                    </TouchableOpacity>
                  </View>
                  {assignedChildren.map((child) => (
                    <View key={child.child_id} style={styles.childItem}>
                      <Text style={styles.childName}>
                        {child.first_name} {child.last_name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          const assignmentId = getAssignmentId(staffMember.staff_id, child.child_id);
                          if (assignmentId) {
                            Alert.alert(
                              'Unassign Child',
                              `Remove ${child.first_name} from ${staffMember.first_name}'s class?`,
                              [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                  text: 'Unassign',
                                  style: 'destructive',
                                  onPress: () => handleUnassignChild(assignmentId),
                                },
                              ]
                            );
                          }
                        }}
                      >
                        <IconSymbol name="xmark.circle" size={20} color={colors.accent} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
            </Text>

            <ScrollView>
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
              
              <Text style={styles.sectionLabel}>Role</Text>
              <View style={styles.roleButtons}>
                {(['teacher', 'assistant', 'admin'] as const).map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      formData.role === role && styles.roleButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, role })}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        formData.role === role && styles.roleButtonTextActive,
                      ]}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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

      <Modal visible={assignModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Assign Children to {selectedStaff?.first_name}
            </Text>

            <ScrollView>
              {children.map((child) => {
                const isAssigned = selectedStaff && 
                  assignments.some(a => a.staff_id === selectedStaff.staff_id && a.child_id === child.child_id);
                
                return (
                  <TouchableOpacity
                    key={child.child_id}
                    style={[styles.childSelectItem, isAssigned && styles.childSelectItemAssigned]}
                    onPress={() => handleAssignChild(child.child_id)}
                    disabled={isAssigned}
                  >
                    <Text style={styles.childSelectName}>
                      {child.first_name} {child.last_name}
                    </Text>
                    {isAssigned && (
                      <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={[buttonStyles.primary, { marginTop: 20 }]}
              onPress={() => setAssignModalVisible(false)}
            >
              <Text style={styles.saveButtonText}>Done</Text>
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
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  assignmentSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  assignButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  assignButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  childItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginTop: 4,
  },
  childName: {
    fontSize: 14,
    color: colors.text,
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
  roleButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  roleButtonTextActive: {
    color: colors.white,
  },
  childSelectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 8,
  },
  childSelectItemAssigned: {
    backgroundColor: colors.primaryLight,
  },
  childSelectName: {
    fontSize: 16,
    color: colors.text,
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
