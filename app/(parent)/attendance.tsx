
import React, { useEffect, useState, useCallback } from 'react';
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
import AttendanceGraph from '@/components/AttendanceGraph';

interface AttendanceWithChild extends Attendance {
  child?: Child;
}

export default function ParentAttendanceScreen() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceWithChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAttendance = useCallback(async () => {
    if (!user) return;

    try {
      // Get all children for this parent
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

      // Get attendance records for these children
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*, children(*)')
        .in('child_id', childIds)
        .order('date', { ascending: false })
        .limit(100);

      if (attendanceError) throw attendanceError;

      const formattedData = attendanceData?.map((record: any) => ({
        ...record,
        child: record.children,
      })) || [];

      setAttendance(formattedData);
    } catch (error) {
      console.error('Error loading attendance:', error);
      Alert.alert('Error', 'Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadAttendance();
    }
  }, [user, loadAttendance]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAttendance();
    setRefreshing(false);
  };

  // Prepare data for the graph
  const graphData = attendance.map((record) => ({
    date: record.date,
    is_present: record.is_present,
    child_name: record.child ? `${record.child.first_name} ${record.child.last_name}` : '',
  }));

  if (loading) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <Text style={commonStyles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance History</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Attendance Graph */}
        <AttendanceGraph data={graphData} />

        {/* Recent Attendance Records */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Records</Text>
        </View>

        {attendance.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="checkmark.circle" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No attendance records yet</Text>
          </View>
        ) : (
          attendance.slice(0, 20).map((record) => (
            <View
              key={record.attendance_id}
              style={[
                styles.attendanceCard,
                record.is_present ? styles.presentCard : styles.absentCard,
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.statusIcon}>
                  <IconSymbol
                    name={record.is_present ? 'checkmark.circle.fill' : 'xmark.circle.fill'}
                    size={32}
                    color={record.is_present ? colors.success : colors.accent}
                  />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.childName}>
                    {record.child?.first_name} {record.child?.last_name}
                  </Text>
                  <Text style={styles.statusText}>
                    {record.is_present ? 'Present' : 'Absent'}
                  </Text>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.dateText}>
                  {new Date(record.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingBottom: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 140,
  },
  recentSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  attendanceCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  presentCard: {
    borderLeftColor: colors.success,
  },
  absentCard: {
    borderLeftColor: colors.accent,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIcon: {
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cardFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dateText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
