
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Animated,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { Child, Attendance } from '@/types/database.types';
import { useAuth } from '@/contexts/AuthContext';

interface UndoAction {
  type: 'create' | 'update' | 'delete';
  childId: string;
  childName: string;
  previousState?: boolean; // undefined = unmarked, true = present, false = absent
  newState?: boolean;
  recordId?: string;
  timestamp: number;
}

export default function AttendanceScreen() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  
  const undoOpacity = useRef(new Animated.Value(0)).current;
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    // Clear undo action when date changes
    setUndoAction(null);
    setShowUndo(false);
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }
  }, [selectedDate]);

  const showUndoButton = () => {
    setShowUndo(true);
    Animated.timing(undoOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto-hide after 10 seconds
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }
    undoTimeoutRef.current = setTimeout(() => {
      hideUndoButton();
    }, 10000);
  };

  const hideUndoButton = () => {
    Animated.timing(undoOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowUndo(false);
      setUndoAction(null);
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const toggleAttendance = async (childId: string, currentStatus: boolean | undefined) => {
    if (!user) return;

    const dateStr = selectedDate.toISOString().split('T')[0];
    const existingRecord = attendance.find((a) => a.child_id === childId);
    const child = children.find((c) => c.child_id === childId);
    const childName = child ? `${child.first_name} ${child.last_name}` : 'Unknown';

    try {
      // Three-state cycle: Unmarked → Present → Absent → Unmarked
      if (currentStatus === undefined) {
        // Unmarked → Present
        const { data, error } = await supabase.from('attendance').insert([
          {
            child_id: childId,
            date: dateStr,
            is_present: true,
            marked_by: user.user_id,
          },
        ]).select();

        if (error) throw error;
        console.log('Marked as present');

        // Store undo action
        setUndoAction({
          type: 'create',
          childId,
          childName,
          previousState: undefined,
          newState: true,
          recordId: data?.[0]?.attendance_id,
          timestamp: Date.now(),
        });
        showUndoButton();

      } else if (currentStatus === true) {
        // Present → Absent
        if (existingRecord) {
          const { error } = await supabase
            .from('attendance')
            .update({ is_present: false })
            .eq('attendance_id', existingRecord.attendance_id);

          if (error) throw error;
          console.log('Marked as absent');

          // Store undo action
          setUndoAction({
            type: 'update',
            childId,
            childName,
            previousState: true,
            newState: false,
            recordId: existingRecord.attendance_id,
            timestamp: Date.now(),
          });
          showUndoButton();
        }
      } else {
        // Absent → Unmarked (delete record)
        if (existingRecord) {
          Alert.alert(
            'Unmark Attendance',
            'Are you sure you want to unmark this student? This will remove the attendance record.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Unmark',
                style: 'destructive',
                onPress: async () => {
                  try {
                    const { error } = await supabase
                      .from('attendance')
                      .delete()
                      .eq('attendance_id', existingRecord.attendance_id);

                    if (error) throw error;
                    console.log('Attendance unmarked');

                    // Store undo action
                    setUndoAction({
                      type: 'delete',
                      childId,
                      childName,
                      previousState: false,
                      newState: undefined,
                      recordId: existingRecord.attendance_id,
                      timestamp: Date.now(),
                    });
                    showUndoButton();

                    loadData();
                  } catch (error) {
                    console.error('Error unmarking attendance:', error);
                    Alert.alert('Error', 'Failed to unmark attendance');
                  }
                },
              },
            ]
          );
          return; // Exit early to prevent loadData from being called twice
        }
      }

      loadData();
    } catch (error) {
      console.error('Error updating attendance:', error);
      Alert.alert('Error', 'Failed to update attendance');
    }
  };

  const handleUndo = async () => {
    if (!undoAction || !user) return;

    const dateStr = selectedDate.toISOString().split('T')[0];

    try {
      if (undoAction.type === 'create') {
        // Undo create: delete the record
        if (undoAction.recordId) {
          const { error } = await supabase
            .from('attendance')
            .delete()
            .eq('attendance_id', undoAction.recordId);

          if (error) throw error;
          console.log('Undid create action');
        }
      } else if (undoAction.type === 'update') {
        // Undo update: restore previous state
        if (undoAction.recordId && undoAction.previousState !== undefined) {
          const { error } = await supabase
            .from('attendance')
            .update({ is_present: undoAction.previousState })
            .eq('attendance_id', undoAction.recordId);

          if (error) throw error;
          console.log('Undid update action');
        }
      } else if (undoAction.type === 'delete') {
        // Undo delete: recreate the record with previous state
        if (undoAction.previousState !== undefined) {
          const { error } = await supabase.from('attendance').insert([
            {
              child_id: undoAction.childId,
              date: dateStr,
              is_present: undoAction.previousState,
              marked_by: user.user_id,
            },
          ]);

          if (error) throw error;
          console.log('Undid delete action');
        }
      }

      hideUndoButton();
      loadData();
      Alert.alert('Success', `Undid attendance change for ${undoAction.childName}`);
    } catch (error) {
      console.error('Error undoing action:', error);
      Alert.alert('Error', 'Failed to undo action');
    }
  };

  const markAllPresent = async () => {
    if (!user) return;

    Alert.alert(
      'Mark All Present',
      'Are you sure you want to mark all children as present?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            const dateStr = selectedDate.toISOString().split('T')[0];
            try {
              const updates = children.map((child) => {
                const existingRecord = attendance.find((a) => a.child_id === child.child_id);
                if (existingRecord) {
                  return supabase
                    .from('attendance')
                    .update({ is_present: true })
                    .eq('attendance_id', existingRecord.attendance_id);
                } else {
                  return supabase.from('attendance').insert([
                    {
                      child_id: child.child_id,
                      date: dateStr,
                      is_present: true,
                      marked_by: user.user_id,
                    },
                  ]);
                }
              });

              await Promise.all(updates);
              
              // Clear undo action for bulk operations
              setUndoAction(null);
              setShowUndo(false);
              
              loadData();
              Alert.alert('Success', 'All children marked as present');
            } catch (error) {
              console.error('Error marking all present:', error);
              Alert.alert('Error', 'Failed to mark all as present');
            }
          },
        },
      ]
    );
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

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getAttendanceStats = () => {
    const total = children.length;
    const marked = attendance.length;
    const present = attendance.filter((a) => a.is_present).length;
    const absent = attendance.filter((a) => !a.is_present).length;
    const unmarked = total - marked;

    return { total, marked, present, absent, unmarked };
  };

  const getUndoActionDescription = () => {
    if (!undoAction) return '';
    
    const stateToText = (state: boolean | undefined) => {
      if (state === undefined) return 'Unmarked';
      return state ? 'Present' : 'Absent';
    };

    return `${undoAction.childName}: ${stateToText(undoAction.previousState)} → ${stateToText(undoAction.newState)}`;
  };

  const stats = getAttendanceStats();
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  if (loading) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <Text style={commonStyles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      {/* Date Selector */}
      <View style={styles.dateSelector}>
        <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>{selectedDate.toLocaleDateString()}</Text>
          {!isToday && (
            <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateButton}>
          <IconSymbol name="chevron.right" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.present}</Text>
          <Text style={[styles.statLabel, { color: colors.success }]}>Present</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.absent}</Text>
          <Text style={[styles.statLabel, { color: colors.accent }]}>Absent</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.unmarked}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Unmarked</Text>
        </View>
      </View>

      {/* Instructions Banner */}
      <View style={styles.instructionsBanner}>
        <IconSymbol name="info.circle" size={16} color={colors.primary} />
        <Text style={styles.instructionsText}>
          Tap to cycle: Unmarked → Present → Absent → Unmarked
        </Text>
      </View>

      {/* Quick Actions */}
      {children.length > 0 && (
        <View style={styles.quickActions}>
          <TouchableOpacity onPress={markAllPresent} style={styles.quickActionButton}>
            <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
            <Text style={styles.quickActionText}>Mark All Present</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Undo Button */}
      {showUndo && undoAction && (
        <Animated.View style={[styles.undoContainer, { opacity: undoOpacity }]}>
          <View style={styles.undoContent}>
            <View style={styles.undoTextContainer}>
              <IconSymbol name="arrow.uturn.backward" size={18} color={colors.background} />
              <View style={styles.undoTextWrapper}>
                <Text style={styles.undoTitle}>Change made</Text>
                <Text style={styles.undoDescription}>{getUndoActionDescription()}</Text>
              </View>
            </View>
            <View style={styles.undoButtons}>
              <TouchableOpacity onPress={handleUndo} style={styles.undoButton}>
                <Text style={styles.undoButtonText}>UNDO</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={hideUndoButton} style={styles.dismissButton}>
                <IconSymbol name="xmark" size={16} color={colors.background} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Children List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {children.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="person.2.slash" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No children registered</Text>
            <Text style={styles.emptySubtext}>Add children to start tracking attendance</Text>
          </View>
        ) : (
          <>
            {children.map((child) => {
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
                  activeOpacity={0.7}
                >
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>
                      {child.first_name} {child.last_name}
                    </Text>
                    <View style={styles.statusRow}>
                      {status === true && (
                        <>
                          <IconSymbol name="checkmark.circle.fill" size={16} color={colors.success} />
                          <Text style={[styles.statusText, { color: colors.success }]}>Present</Text>
                        </>
                      )}
                      {status === false && (
                        <>
                          <IconSymbol name="xmark.circle.fill" size={16} color={colors.accent} />
                          <Text style={[styles.statusText, { color: colors.accent }]}>Absent</Text>
                        </>
                      )}
                      {status === undefined && (
                        <>
                          <IconSymbol name="circle" size={16} color={colors.textSecondary} />
                          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                            Tap to mark
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusIndicator,
                      status === true && styles.presentIndicator,
                      status === false && styles.absentIndicator,
                    ]}
                  >
                    {status === true && (
                      <IconSymbol name="checkmark" size={16} color={colors.background} />
                    )}
                    {status === false && (
                      <IconSymbol name="xmark" size={16} color={colors.background} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
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
    borderRadius: 8,
  },
  dateInfo: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  todayButton: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.background,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  instructionsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: `${colors.primary}15`,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  instructionsText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  quickActions: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.success,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
    marginLeft: 8,
  },
  undoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    zIndex: 1000,
    elevation: 10,
  },
  undoContent: {
    backgroundColor: colors.text,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  undoTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  undoTextWrapper: {
    flex: 1,
  },
  undoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
    marginBottom: 2,
  },
  undoDescription: {
    fontSize: 12,
    color: colors.background,
    opacity: 0.8,
  },
  undoButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  undoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  undoButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.background,
  },
  dismissButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100, // Extra padding for undo button
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  childCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.border,
  },
  presentCard: {
    borderLeftColor: colors.success,
    backgroundColor: `${colors.success}08`,
  },
  absentCard: {
    borderLeftColor: colors.accent,
    backgroundColor: `${colors.accent}08`,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
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
