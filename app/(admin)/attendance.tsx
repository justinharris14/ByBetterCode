
import React, { useEffect, useState } from 'react';
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
import { Child, Attendance } from '@/types/database.types';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

export default function AttendanceScreen() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .order('first_name', { ascending: true });

      if (childrenError) throw childrenError;

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', selectedDate);

      if (attendanceError) throw attendanceError;

      setChildren(childrenData || []);

      const attendanceMap: Record<string, boolean> = {};
      attendanceData?.forEach((record) => {
        attendanceMap[record.child_id] = record.is_present;
      });
      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const toggleAttendance = async (childId: string, currentStatus: boolean | undefined) => {
    const newStatus = !currentStatus;

    try {
      const { data: existing } = await supabase
        .from('attendance')
        .select('attendance_id')
        .eq('child_id', childId)
        .eq('date', selectedDate)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('attendance')
          .update({ is_present: newStatus })
          .eq('attendance_id', existing.attendance_id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('attendance')
          .insert([{
            child_id: childId,
            date: selectedDate,
            is_present: newStatus,
            marked_by: user?.user_id || '',
          }]);

        if (error) throw error;
      }

      setAttendance({ ...attendance, [childId]: newStatus });
    } catch (error) {
      console.error('Error updating attendance:', error);
      Alert.alert('Error', 'Failed to update attendance');
    }
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
        <View style={styles.dateSelector}>
          <Text style={styles.dateLabel}>Date: {selectedDate}</Text>
        </View>

        {children.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No children registered</Text>
          </View>
        ) : (
          children.map((child) => {
            const isPresent = attendance[child.child_id];
            return (
              <TouchableOpacity
                key={child.child_id}
                style={[
                  commonStyles.cardWhite,
                  styles.attendanceCard,
                  isPresent && styles.presentCard,
                ]}
                onPress={() => toggleAttendance(child.child_id, isPresent)}
              >
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>
                    {child.first_name} {child.last_name}
                  </Text>
                  <Text style={commonStyles.textSecondary}>
                    {isPresent === undefined ? 'Not marked' : isPresent ? 'Present' : 'Absent'}
                  </Text>
                </View>
                <View style={[
                  styles.statusIcon,
                  isPresent && styles.presentIcon,
                  isPresent === false && styles.absentIcon,
                ]}>
                  <IconSymbol
                    name={isPresent ? 'checkmark.circle.fill' : 'xmark.circle.fill'}
                    size={32}
                    color={colors.white}
                  />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
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
  dateSelector: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  attendanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  presentCard: {
    backgroundColor: colors.primary,
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
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presentIcon: {
    backgroundColor: colors.success,
  },
  absentIcon: {
    backgroundColor: colors.accent,
  },
});
