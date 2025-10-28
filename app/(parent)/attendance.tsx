
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
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { Attendance, Child } from '@/types/database.types';

interface AttendanceWithChild extends Attendance {
  child?: Child;
}

export default function ParentAttendanceScreen() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceWithChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadAttendance();
    }
  }, [user]);

  const loadAttendance = async () => {
    if (!user) return;

    try {
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('child_id')
        .eq('parent_id', user.user_id);

      if (childrenError) throw childrenError;

      const childIds = childrenData?.map((c) => c.child_id) || [];

      if (childIds.length === 0) {
        setAttendance([]);
        setLoading(false);
        return;
      }

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select(`
          *,
          children:child_id (
            first_name,
            last_name
          )
        `)
        .in('child_id', childIds)
        .order('date', { ascending: false })
        .limit(30);

      if (attendanceError) throw attendanceError;

      const formattedData = attendanceData?.map((record: any) => ({
        ...record,
        child: record.children,
      })) || [];

      setAttendance(formattedData);
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
            <Text style={styles.emptyText}>No attendance records yet</Text>
          </View>
        ) : (
          attendance.map((record) => (
            <View
              key={record.attendance_id}
              style={[
                commonStyles.cardWhite,
                record.is_present ? styles.presentCard : styles.absentCard,
              ]}
            >
              <View style={styles.recordHeader}>
                <View style={styles.recordInfo}>
                  <Text style={styles.childName}>
                    {record.child?.first_name} {record.child?.last_name}
                  </Text>
                  <Text style={commonStyles.textSecondary}>
                    {new Date(record.date).toLocaleDateString()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    record.is_present ? styles.presentBadge : styles.absentBadge,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {record.is_present ? '✓ Present' : '✗ Absent'}
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
  presentCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  absentCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  presentBadge: {
    backgroundColor: colors.success,
  },
  absentBadge: {
    backgroundColor: colors.accent,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
});
