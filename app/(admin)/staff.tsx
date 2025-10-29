
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
import { Staff } from '@/types/database.types';

export default function StaffScreen() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [rolePickerVisible, setRolePickerVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'teacher' as 'teacher' | 'assistant' | 'coordinator' | 'other',
    specialization: '',
    qualifications: '',
    hire_date: '',
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('first_name', { ascending: true });

      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error('Error loading staff:', error);
      Alert.alert('Error', 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStaff();
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
      specialization: '',
      qualifications: '',
      hire_date: '',
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
      specialization: staffMember.specialization || '',
      qualifications: staffMember.qualifications || '',
      hire_date: staffMember.hire_date || '',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      Alert.alert('Error', 'Please fill in all required fields (Name, Email)');
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        phone: formData.phone || null,
        specialization: formData.specialization || null,
        qualifications: formData.qualifications || null,
        hire_date: formData.hire_date || null,
      };

      if (editingStaff) {
        const { error } = await supabase
          .from('staff')
          .update(dataToSave)
          .eq('staff_id', editingStaff.staff_id);

        if (error) throw error;
        Alert.alert('Success', 'Staff member updated successfully');
      } else {
        const { error } = await supabase
          .from('staff')
          .insert([dataToSave]);

        if (error) throw error;
        Alert.alert('Success', 'Staff member added successfully');
      }

      setModalVisible(false);
      loadStaff();
    } catch (error: any) {
      console.error('Error saving staff:', error);
      if (error.code === '23505') {
        Alert.alert('Error', 'A staff member with this email already exists');
      } else {
        Alert.alert('Error', 'Failed to save staff member');
      }
    }
  };

  const handleDelete = (staffMember: Staff) => {
    Alert.alert(
      'Delete Staff Member',
      `Are you sure you want to delete ${staffMember.first_name} ${staffMember.last_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('staff')
                .delete()
                .eq('staff_id', staffMember.staff_id);

              if (error) throw error;
              Alert.alert('Success', 'Staff member deleted successfully');
              loadStaff();
            } catch (error) {
              console.error('Error deleting staff:', error);
              Alert.alert('Error', 'Failed to delete staff member. They may have children assigned to them.');
            }
          },
        },
      ]
    );
  };

  const toggleActiveStatus = async (staffMember: Staff) => {
    try {
      const { error } = await supabase
        .from('staff')
        .update({ is_active: !staffMember.is_active })
        .eq('staff_id', staffMember.staff_id);

      if (error) throw error;
      loadStaff();
    } catch (error) {
      console.error('Error updating staff status:', error);
      Alert.alert('Error', 'Failed to update staff status');
    }
  };

  const selectRole = (role: 'teacher' | 'assistant' | 'coordinator' | 'other') => {
    setFormData({ ...formData, role });
    setRolePickerVisible(false);
  };

  const getRoleLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      teacher: 'Teacher',
      assistant: 'Assistant',
      coordinator: 'Coordinator',
      other: 'Other',
    };
    return labels[role] || role;
  };

  // Filter function
  const getFilteredStaff = () => {
    return staff.filter((staffMember) => {
      // Search query filter (name or email)
      const matchesSearch = searchQuery === '' || 
        `${staffMember.first_name} ${staffMember.last_name} ${staffMember.email}`.toLowerCase().includes(searchQuery.toLowerCase());

      // Role filter
      const matchesRole = filterRole === '' || staffMember.role === filterRole;

      // Status filter
      const matchesStatus = filterStatus === '' || 
        (filterStatus === 'active' ? staffMember.is_active : !staffMember.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterRole('');
    setFilterStatus('');
  };

  const hasActiveFilters = searchQuery !== '' || filterRole !== '' || filterStatus !== '';

  if (loading) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <Text style={commonStyles.text}>Loading...</Text>
      </View>
    );
  }

  const filteredStaff = getFilteredStaff();

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
            placeholder="Search by name or email..."
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
            Filters {hasActiveFilters && `(${[filterRole, filterStatus].filter(f => f !== '').length})`}
          </Text>
          <IconSymbol name={showFilters ? "chevron.up" : "chevron.down"} size={16} color={hasActiveFilters ? colors.primary : colors.text} />
        </TouchableOpacity>

        {/* Filter Options */}
        {showFilters && (
          <View style={styles.filterContainer}>
            {/* Role Filter */}
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Role:</Text>
              <View style={styles.filterChips}>
                <TouchableOpacity
                  style={[styles.filterChip, filterRole === '' && styles.filterChipActive]}
                  onPress={() => setFilterRole('')}
                >
                  <Text style={[styles.filterChipText, filterRole === '' && styles.filterChipTextActive]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, filterRole === 'teacher' && styles.filterChipActive]}
                  onPress={() => setFilterRole('teacher')}
                >
                  <Text style={[styles.filterChipText, filterRole === 'teacher' && styles.filterChipTextActive]}>Teacher</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, filterRole === 'assistant' && styles.filterChipActive]}
                  onPress={() => setFilterRole('assistant')}
                >
                  <Text style={[styles.filterChipText, filterRole === 'assistant' && styles.filterChipTextActive]}>Assistant</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, filterRole === 'coordinator' && styles.filterChipActive]}
                  onPress={() => setFilterRole('coordinator')}
                >
                  <Text style={[styles.filterChipText, filterRole === 'coordinator' && styles.filterChipTextActive]}>Coordinator</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, filterRole === 'other' && styles.filterChipActive]}
                  onPress={() => setFilterRole('other')}
                >
                  <Text style={[styles.filterChipText, filterRole === 'other' && styles.filterChipTextActive]}>Other</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Status Filter */}
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Status:</Text>
              <View style={styles.filterChips}>
                <TouchableOpacity
                  style={[styles.filterChip, filterStatus === '' && styles.filterChipActive]}
                  onPress={() => setFilterStatus('')}
                >
                  <Text style={[styles.filterChipText, filterStatus === '' && styles.filterChipTextActive]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, filterStatus === 'active' && styles.filterChipActive]}
                  onPress={() => setFilterStatus('active')}
                >
                  <Text style={[styles.filterChipText, filterStatus === 'active' && styles.filterChipTextActive]}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, filterStatus === 'inactive' && styles.filterChipActive]}
                  onPress={() => setFilterStatus('inactive')}
                >
                  <Text style={[styles.filterChipText, filterStatus === 'inactive' && styles.filterChipTextActive]}>Inactive</Text>
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
            {filteredStaff.length} staff {filteredStaff.length === 1 ? 'member' : 'members'} found
          </Text>
          <TouchableOpacity style={[buttonStyles.primary, styles.addButton]} onPress={openAddModal}>
            <Text style={styles.addButtonText}>+ Add Staff</Text>
          </TouchableOpacity>
        </View>

        {filteredStaff.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {hasActiveFilters ? 'No staff members match your filters' : 'No staff members registered yet'}
            </Text>
          </View>
        ) : (
          filteredStaff.map((staffMember) => (
            <View key={staffMember.staff_id} style={commonStyles.cardWhite}>
              <View style={styles.staffHeader}>
                <View style={styles.staffInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.staffName}>
                      {staffMember.first_name} {staffMember.last_name}
                    </Text>
                    {!staffMember.is_active && (
                      <View style={styles.inactiveBadge}>
                        <Text style={styles.inactiveBadgeText}>Inactive</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.roleText}>
                    {getRoleLabel(staffMember.role)}
                  </Text>
                  <Text style={commonStyles.textSecondary}>
                    📧 {staffMember.email}
                  </Text>
                  {staffMember.phone && (
                    <Text style={commonStyles.textSecondary}>
                      📞 {staffMember.phone}
                    </Text>
                  )}
                  {staffMember.specialization && (
                    <Text style={styles.specializationText}>
                      🎓 {staffMember.specialization}
                    </Text>
                  )}
                  {staffMember.qualifications && (
                    <Text style={commonStyles.textSecondary}>
                      📜 {staffMember.qualifications}
                    </Text>
                  )}
                  {staffMember.hire_date && (
                    <Text style={commonStyles.textSecondary}>
                      📅 Hired: {new Date(staffMember.hire_date).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => toggleActiveStatus(staffMember)}
                    style={styles.actionButton}
                  >
                    <IconSymbol
                      name={staffMember.is_active ? 'checkmark.circle' : 'xmark.circle'}
                      size={20}
                      color={staffMember.is_active ? colors.primary : colors.textSecondary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openEditModal(staffMember)} style={styles.actionButton}>
                    <IconSymbol name="pencil" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(staffMember)} style={styles.actionButton}>
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
                {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
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
                placeholder="Email *"
                placeholderTextColor={colors.textSecondary}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={commonStyles.input}
                placeholder="Phone"
                placeholderTextColor={colors.textSecondary}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />

              <TouchableOpacity
                style={[commonStyles.input, styles.pickerButton]}
                onPress={() => setRolePickerVisible(true)}
              >
                <Text style={styles.pickerText}>
                  {getRoleLabel(formData.role)}
                </Text>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>Professional Information</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="Specialization (e.g., Early Childhood Development)"
                placeholderTextColor={colors.textSecondary}
                value={formData.specialization}
                onChangeText={(text) => setFormData({ ...formData, specialization: text })}
              />
              <TextInput
                style={commonStyles.input}
                placeholder="Qualifications"
                placeholderTextColor={colors.textSecondary}
                value={formData.qualifications}
                onChangeText={(text) => setFormData({ ...formData, qualifications: text })}
                multiline
              />
              <TextInput
                style={commonStyles.input}
                placeholder="Hire Date (YYYY-MM-DD)"
                placeholderTextColor={colors.textSecondary}
                value={formData.hire_date}
                onChangeText={(text) => setFormData({ ...formData, hire_date: text })}
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

      {/* Role Picker Modal */}
      <Modal visible={rolePickerVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <Text style={styles.pickerModalTitle}>Select Role</Text>
            <TouchableOpacity
              style={styles.pickerOption}
              onPress={() => selectRole('teacher')}
            >
              <Text style={styles.pickerOptionText}>Teacher</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.pickerOption}
              onPress={() => selectRole('assistant')}
            >
              <Text style={styles.pickerOptionText}>Assistant</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.pickerOption}
              onPress={() => selectRole('coordinator')}
            >
              <Text style={styles.pickerOptionText}>Coordinator</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.pickerOption}
              onPress={() => selectRole('other')}
            >
              <Text style={styles.pickerOptionText}>Other</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[buttonStyles.outline, { marginTop: 16 }]}
              onPress={() => setRolePickerVisible(false)}
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
    marginBottom: 16,
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
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  staffInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  staffName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  inactiveBadge: {
    backgroundColor: colors.textSecondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  inactiveBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  roleText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  specializationText: {
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
  pickerButton: {
    justifyContent: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: colors.text,
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
