
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Attendance, Child } from '@/types/database.types';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';

interface AttendanceWithChild extends Attendance {
  child?: Child;
}

export default function ParentAttendanceScreen() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceWithChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAttendance();
  }, [user]);

  const loadAttendance = async () => {
    if (!user) return;

    try {
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('child_id')
        .eq('parent_id', user.user_id);

      if (childrenError) throw childrenError;

      const childIds = childrenData?.map(c => c.child_id) || [];

      if (childIds.length === 0) {
        setAttendance([]);
        setLoading(false);
        return;
      }

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select(`
          *,
          children:child_id (*)
        `)
        .in('child_id', childIds)
        .order('date', { ascending: false })
        .limit(50);

      if (attendanceError) throw attendanceError;
      setAttendance(attendanceData || []);
    } catch (error) {
      console.error('Error loading attendance:', error);
      Alert.alert('Error', 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAttendance();
    setRefreshing(false);
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
        {attendance.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No attendance records</Text>
          </View>
        ) : (
          attendance.map((record) => (
            <View key={record.attendance_id} style={commonStyles.cardWhite}>
              <View style={styles.attendanceRow}>
                <View style={styles.attendanceInfo}>
                  <Text style={styles.date}>{new Date(record.date).toLocaleDateString()}</Text>
                  <Text style={commonStyles.textSecondary}>
                    Child ID: {record.child_id}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  record.is_present ? styles.presentBadge : styles.absentBadge
                ]}>
                  <IconSymbol
                    name={record.is_present ? 'checkmark.circle.fill' : 'xmark.circle.fill'}
                    size={24}
                    color={colors.white}
                  />
                  <Text style={styles.statusText}>
                    {record.is_present ? 'Present' : 'Absent'}
                  </Text>
                </View>
              </View>
            </View>
          ))
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
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendanceInfo: {
    flex: 1,
  },
  date: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  presentBadge: {
    backgroundColor: colors.success,
  },
  absentBadge: {
    backgroundColor: colors.accent,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 8,
  },
});
