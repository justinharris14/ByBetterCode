
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { Child, Attendance } from '@/types/database.types';
import { useAuth } from '@/contexts/AuthContext';

export default function AttendanceScreen() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];

      const [childrenData, attendanceData] = await Promise.all([
        supabase.from('children').select('*').order('first_name', { ascending: true }),
        supabase.from('attendance').select('*').eq('date', dateStr),
      ]);

      if (childrenData.error) throw childrenData.error;
      if (attendanceData.error) throw attendanceData.error;

      setChildren(childrenData.data || []);
      setAttendance(attendanceData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const toggleAttendance = async (childId: string, currentStatus: boolean | undefined) => {
    if (!user) return;

    const dateStr = selectedDate.toISOString().split('T')[0];
    const newStatus = !currentStatus;

    try {
      const existingRecord = attendance.find((a) => a.child_id === childId);

      if (existingRecord) {
        const { error } = await supabase
          .from('attendance')
          .update({ is_present: newStatus })
          .eq('attendance_id', existingRecord.attendance_id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('attendance').insert([
          {
            child_id: childId,
            date: dateStr,
            is_present: newStatus,
            marked_by: user.user_id,
          },
        ]);

        if (error) throw error;
      }

      loadData();
    } catch (error) {
      console.error('Error updating attendance:', error);
      Alert.alert('Error', 'Failed to update attendance');
    }
  };

  const getAttendanceStatus = (childId: string): boolean | undefined => {
    const record = attendance.find((a) => a.child_id === childId);
    return record?.is_present;
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
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
      <View style={styles.dateSelector}>
        <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.dateText}>{selectedDate.toLocaleDateString()}</Text>
        <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateButton}>
          <IconSymbol name="chevron.right" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {children.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No children registered</Text>
          </View>
        ) : (
          children.map((child) => {
            const status = getAttendanceStatus(child.child_id);
            return (
              <TouchableOpacity
                key={child.child_id}
                style={[
                  commonStyles.cardWhite,
                  styles.childCard,
                  status === true && styles.presentCard,
                  status === false && styles.absentCard,
                ]}
                onPress={() => toggleAttendance(child.child_id, status)}
              >
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>
                    {child.first_name} {child.last_name}
                  </Text>
                  <Text style={commonStyles.textSecondary}>
                    {status === true
                      ? '✓ Present'
                      : status === false
                      ? '✗ Absent'
                      : 'Not marked'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusIndicator,
                    status === true && styles.presentIndicator,
                    status === false && styles.absentIndicator,
                  ]}
                />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dateButton: {
    padding: 8,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  childCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  presentCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  absentCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  presentIndicator: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  absentIndicator: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
});
