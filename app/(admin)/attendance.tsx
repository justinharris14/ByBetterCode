
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
import AttendanceGraph from '@/components/AttendanceGraph';

export default function AttendanceScreen() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [graphData, setGraphData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    loadGraphData();
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

  const loadGraphData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const { data: attendanceData, error } = await supabase
        .from('attendance')
        .select('date, is_present')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      if (error) throw error;

      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('child_id');

      if (childrenError) throw childrenError;

      const totalChildren = childrenData?.length || 0;

      const dateMap = new Map<string, { present: number; absent: number }>();
      
      attendanceData?.forEach((record) => {
        const existing = dateMap.get(record.date) || { present: 0, absent: 0 };
        if (record.is_present) {
          existing.present++;
        } else {
          existing.absent++;
        }
        dateMap.set(record.date, existing);
      });

      const graphDataArray = Array.from(dateMap.entries()).map(([date, counts]) => ({
        date,
        present: counts.present,
        absent: counts.absent,
        total: totalChildren,
      }));

      graphDataArray.sort((a, b) => a.date.localeCompare(b.date));
      setGraphData(graphDataArray);
    } catch (error) {
      console.error('Error loading graph data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    await loadGraphData();
    setRefreshing(false);
  };

  const sendAbsenceNotification = async (childId: string, childName: string, parentId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          parent_id: parentId,
          notification_type: 'absence',
          title: 'Child Absence Alert',
          message: `${childName} was marked absent today (${selectedDate}). Please contact the school if this is unexpected.`,
          related_id: childId,
        }]);

      if (error) throw error;
      console.log('Absence notification sent successfully');
    } catch (error) {
      console.error('Error sending absence notification:', error);
    }
  };

  const toggleAttendance = async (childId: string, currentStatus: boolean | undefined) => {
    if (!user) return;

    try {
      const child = children.find(c => c.child_id === childId);
      if (!child) return;

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

      if (!newStatus) {
        await sendAbsenceNotification(
          childId,
          `${child.first_name} ${child.last_name}`,
          child.parent_id
        );
      }

      loadData();
      loadGraphData();
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
        <AttendanceGraph data={graphData} type="line" />

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
