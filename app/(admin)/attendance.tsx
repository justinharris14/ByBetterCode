
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
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      const [childrenData, attendanceData] = await Promise.all([
        supabase.from('children').select('*').order('first_name', { ascending: true }),
        supabase.from('attendance').select('*').eq('date', selectedDate),
      ]);

      if (childrenData.error) throw childrenData.error;
      if (attendanceData.error) throw attendanceData.error;

      setChildren(childrenData.data || []);
      setAttendance(attendanceData.data || []);
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

  const toggleAttendance = async (childId: string, currentStatus: boolean | undefined) => {
    if (!user) return;

    try {
      const existingRecord = attendance.find(a => a.child_id === childId);
      const newStatus = !currentStatus;

      if (existingRecord) {
        const { error } = await supabase
          .from('attendance')
          .update({ is_present: newStatus })
          .eq('attendance_id', existingRecord.attendance_id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('attendance')
          .insert([{
            child_id: childId,
            date: selectedDate,
            is_present: newStatus,
            marked_by: user.user_id,
          }]);

        if (error) throw error;
      }

      loadData();
    } catch (error) {
      console.error('Error toggling attendance:', error);
      Alert.alert('Error', 'Failed to update attendance');
    }
  };

  const getAttendanceStatus = (childId: string) => {
    const record = attendance.find(a => a.child_id === childId);
    return record?.is_present;
  };

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
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
          <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateButton}>
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.dateDisplay}>
            <Text style={styles.dateText}>{new Date(selectedDate).toLocaleDateString()}</Text>
          </View>
          <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateButton}>
            <IconSymbol name="chevron.right" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {attendance.filter(a => a.is_present).length}
            </Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {attendance.filter(a => !a.is_present).length}
            </Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {children.length - attendance.length}
            </Text>
            <Text style={styles.statLabel}>Not Marked</Text>
          </View>
        </View>

        {children.map((child) => {
          const status = getAttendanceStatus(child.child_id);
          return (
            <View key={child.child_id} style={commonStyles.cardWhite}>
              <View style={styles.childRow}>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>
                    {child.first_name} {child.last_name}
                  </Text>
                  <Text style={commonStyles.textSecondary}>
                    Age: {new Date().getFullYear() - new Date(child.dob).getFullYear()}
                  </Text>
                </View>
                <View style={styles.attendanceButtons}>
                  <TouchableOpacity
                    style={[
                      styles.attendanceButton,
                      status === true && styles.attendanceButtonPresent,
                    ]}
                    onPress={() => toggleAttendance(child.child_id, status)}
                  >
                    <IconSymbol
                      name="checkmark.circle"
                      size={24}
                      color={status === true ? colors.white : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.attendanceButtonText,
                        status === true && styles.attendanceButtonTextActive,
                      ]}
                    >
                      Present
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.attendanceButton,
                      status === false && styles.attendanceButtonAbsent,
                    ]}
                    onPress={() => toggleAttendance(child.child_id, status)}
                  >
                    <IconSymbol
                      name="xmark.circle"
                      size={24}
                      color={status === false ? colors.white : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.attendanceButtonText,
                        status === false && styles.attendanceButtonTextActive,
                      ]}
                    >
                      Absent
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  dateButton: {
    padding: 8,
  },
  dateDisplay: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  childRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  attendanceButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  attendanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    gap: 4,
  },
  attendanceButtonPresent: {
    backgroundColor: '#4CAF50',
  },
  attendanceButtonAbsent: {
    backgroundColor: '#FF5252',
  },
  attendanceButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  attendanceButtonTextActive: {
    color: colors.white,
  },
});
