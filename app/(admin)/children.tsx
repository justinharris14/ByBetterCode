
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
import { Child, User, Staff } from '@/types/database.types';
import { useRouter } from 'expo-router';

export default function ChildrenScreen() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [parents, setParents] = useState<User[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [parentPickerVisible, setParentPickerVisible] = useState(false);
  const [teacherPickerVisible, setTeacherPickerVisible] = useState(false);
  const [genderPickerVisible, setGenderPickerVisible] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTeacher, setFilterTeacher] = useState<string>('');
  const [filterGender, setFilterGender] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    dob: '',
    gender: '',
    parent_id: '',
    assigned_teacher_id: '',
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
      const [childrenResult, parentsResult, staffResult] = await Promise.all([
        supabase.from('children').select('*').order('first_name', { ascending: true }),
        supabase.from('users').select('*').eq('role', 'parent').order('first_name', { ascending: true }),
        supabase.from('staff').select('*').eq('is_active', true).order('first_name', { ascending: true }),
      ]);

      if (childrenResult.error) throw childrenResult.error;
      if (parentsResult.error) throw parentsResult.error;
      if (staffResult.error) throw staffResult.error;

      setChildren(childrenResult.data || []);
      setParents(parentsResult.data || []);
      setStaff(staffResult.data || []);
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
      assigned_teacher_id: '',
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
      assigned_teacher_id: child.assigned_teacher_id || '',
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
        assigned_teacher_id: formData.assigned_teacher_id || null,
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

  const getTeacherName = (teacherId: string | undefined) => {
    if (!teacherId) return 'Not Assigned';
    const teacher = staff.find((s) => s.staff_id === teacherId);
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Unknown';
  };

  const selectParent = (parentId: string) => {
    setFormData({ ...formData, parent_id: parentId });
    setParentPickerVisible(false);
  };

  const selectTeacher = (teacherId: string) => {
    setFormData({ ...formData, assigned_teacher_id: teacherId });
    setTeacherPickerVisible(false);
  };

  const clearTeacher = () => {
    setFormData({ ...formData, assigned_teacher_id: '' });
    setTeacherPickerVisible(false);
  };

  const selectGender = (gender: string) => {
    setFormData({ ...formData, gender });
    setGenderPickerVisible(false);
  };

  // Filter function
  const getFilteredChildren = () => {
    return children.filter((child) => {
      // Search query filter (name)
      const matchesSearch = searchQuery === '' || 
        `${child.first_name} ${child.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());

      // Teacher filter
      const matchesTeacher = filterTeacher === '' || 
        (filterTeacher === 'unassigned' ? !child.assigned_teacher_id : child.assigned_teacher_id === filterTeacher);

      // Gender filter
      const matchesGender = filterGender === '' || child.gender === filterGender;

      return matchesSearch && matchesTeacher && matchesGender;
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterTeacher('');
    setFilterGender('');
  };

  const hasActiveFilters = searchQuery !== '' || filterTeacher !== '' || filterGender !== '';

  if (loading) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <Text style={commonStyles.text}>Loading...</Text>
      </View>
    );
  }

  const filteredChildren = getFilteredChildren();

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
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
            Filters {hasActiveFilters && `(${[filterTeacher, filterGender].filter(f => f !== '').length})`}
          </Text>
          <IconSymbol name={showFilters ? "chevron.up" : "chevron.down"} size={16} color={hasActiveFilters ? colors.primary : colors.text} />
        </TouchableOpacity>

        {/* Filter Options */}
        {showFilters && (
          <View style={styles.filterContainer}>
            {/* Teacher Filter */}
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Teacher:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
                <TouchableOpacity
                  style={[styles.filterChip, filterTeacher === '' && styles.filterChipActive]}
                  onPress={() => setFilterTeacher('')}
                >
                  <Text style={[styles.filterChipText, filterTeacher === '' && styles.filterChipTextActive]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, filterTeacher === 'unassigned' && styles.filterChipActive]}
                  onPress={() => setFilterTeacher('unassigned')}
                >
                  <Text style={[styles.filterChipText, filterTeacher === 'unassigned' && styles.filterChipTextActive]}>Unassigned</Text>
                </TouchableOpacity>
                {staff.map((teacher) => (
                  <TouchableOpacity
                    key={teacher.staff_id}
                    style={[styles.filterChip, filterTeacher === teacher.staff_id && styles.filterChipActive]}
                    onPress={() => setFilterTeacher(teacher.staff_id)}
                  >
                    <Text style={[styles.filterChipText, filterTeacher === teacher.staff_id && styles.filterChipTextActive]}>
                      {teacher.first_name} {teacher.last_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Gender Filter */}
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Gender:</Text>
              <View style={styles.filterChips}>
                <TouchableOpacity
                  style={[styles.filterChip, filterGender === '' && styles.filterChipActive]}
                  onPress={() => setFilterGender('')}
                >
                  <Text style={[styles.filterChipText, filterGender === '' && styles.filterChipTextActive]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, filterGender === 'male' && styles.filterChipActive]}
                  onPress={() => setFilterGender('male')}
                >
                  <Text style={[styles.filterChipText, filterGender === 'male' && styles.filterChipTextActive]}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, filterGender === 'female' && styles.filterChipActive]}
                  onPress={() => setFilterGender('female')}
                >
                  <Text style={[styles.filterChipText, filterGender === 'female' && styles.filterChipTextActive]}>Female</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, filterGender === 'other' && styles.filterChipActive]}
                  onPress={() => setFilterGender('other')}
                >
                  <Text style={[styles.filterChipText, filterGender === 'other' && styles.filterChipTextActive]}>Other</Text>
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
            {filteredChildren.length} {filteredChildren.length === 1 ? 'child' : 'children'} found
          </Text>
          <TouchableOpacity style={[buttonStyles.primary, styles.addButton]} onPress={openAddModal}>
            <Text style={styles.addButtonText}>+ Add Child</Text>
          </TouchableOpacity>
        </View>

        {filteredChildren.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {hasActiveFilters ? 'No children match your filters' : 'No children registered yet'}
            </Text>
          </View>
        ) : (
          filteredChildren.map((child) => (
            <View key={child.child_id} style={commonStyles.cardWhite}>
              <View style={styles.childHeader}>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>
                    {child.first_name} {child.last_name}
                  </Text>
                  <Text style={commonStyles.textSecondary}>
                    Parent: {getParentName(child.parent_id)}
                  </Text>
                  <Text style={styles.teacherText}>
                    👨‍🏫 Teacher: {getTeacherName(child.assigned_teacher_id)}
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

              <Text style={styles.sectionTitle}>Teacher Assignment</Text>
              <TouchableOpacity
                style={[commonStyles.input, styles.pickerButton]}
                onPress={() => setTeacherPickerVisible(true)}
              >
                <Text style={formData.assigned_teacher_id ? styles.pickerText : styles.pickerPlaceholder}>
                  {formData.assigned_teacher_id ? getTeacherName(formData.assigned_teacher_id) : 'Select Teacher (Optional)'}
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

      {/* Teacher Picker Modal */}
      <Modal visible={teacherPickerVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <Text style={styles.pickerModalTitle}>Select Teacher</Text>
            <ScrollView>
              <TouchableOpacity
                style={styles.pickerOption}
                onPress={clearTeacher}
              >
                <Text style={[styles.pickerOptionText, { color: colors.textSecondary }]}>
                  No Teacher (Clear Assignment)
                </Text>
              </TouchableOpacity>
              {staff.map((teacher) => (
                <TouchableOpacity
                  key={teacher.staff_id}
                  style={styles.pickerOption}
                  onPress={() => selectTeacher(teacher.staff_id)}
                >
                  <Text style={styles.pickerOptionText}>
                    {teacher.first_name} {teacher.last_name}
                  </Text>
                  <Text style={styles.pickerOptionSubtext}>
                    {teacher.role.charAt(0).toUpperCase() + teacher.role.slice(1)}
                    {teacher.specialization && ` • ${teacher.specialization}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[buttonStyles.outline, { marginTop: 16 }]}
              onPress={() => setTeacherPickerVisible(false)}
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
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
  teacherText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
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
