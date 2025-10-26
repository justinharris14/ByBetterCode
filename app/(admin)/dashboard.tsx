
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
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface DashboardStats {
  totalChildren: number;
  totalEvents: number;
  paymentsDue: number;
  attendanceRate: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalChildren: 0,
    totalEvents: 0,
    paymentsDue: 0,
    attendanceRate: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const [childrenRes, eventsRes, paymentsRes, attendanceRes] = await Promise.all([
        supabase.from('children').select('child_id', { count: 'exact', head: true }),
        supabase.from('events').select('event_id', { count: 'exact', head: true }),
        supabase.from('payments').select('payment_id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('attendance').select('is_present'),
      ]);

      const totalPresent = attendanceRes.data?.filter(a => a.is_present).length || 0;
      const totalRecords = attendanceRes.data?.length || 1;
      const attendanceRate = (totalPresent / totalRecords) * 100;

      setStats({
        totalChildren: childrenRes.count || 0,
        totalEvents: eventsRes.count || 0,
        paymentsDue: paymentsRes.count || 0,
        attendanceRate: Math.round(attendanceRate),
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardStats();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            console.error('Sign out error:', error);
          }
        },
      },
    ]);
  };

  const menuItems = [
    { title: 'Children', icon: 'person.2.fill', route: '/(admin)/children', color: colors.primary },
    { title: 'Attendance', icon: 'checkmark.circle.fill', route: '/(admin)/attendance', color: colors.accent },
    { title: 'Events', icon: 'calendar', route: '/(admin)/events', color: colors.secondary },
    { title: 'Announcements', icon: 'megaphone.fill', route: '/(admin)/announcements', color: colors.highlight },
    { title: 'Media', icon: 'photo.fill', route: '/(admin)/media', color: colors.primary },
    { title: 'Payments', icon: 'creditcard.fill', route: '/(admin)/payments', color: colors.accent },
  ];

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user?.first_name} {user?.last_name}</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color={colors.accent} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
            <Text style={styles.statNumber}>{stats.totalChildren}</Text>
            <Text style={styles.statLabel}>Total Children</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.secondary }]}>
            <Text style={styles.statNumber}>{stats.totalEvents}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.accent }]}>
            <Text style={styles.statNumber}>{stats.paymentsDue}</Text>
            <Text style={styles.statLabel}>Payments Due</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.highlight }]}>
            <Text style={styles.statNumber}>{stats.attendanceRate}%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { backgroundColor: item.color }]}
              onPress={() => router.push(item.route as any)}
            >
              <IconSymbol name={item.icon as any} size={32} color={colors.white} />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  signOutButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuItemText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },
});
