
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
import { Payment } from '@/types/database.types';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';

export default function ParentPaymentsScreen() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPayments();
  }, [user]);

  const loadPayments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('parent_id', user.user_id)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error loading payments:', error);
      Alert.alert('Error', 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };

  const handlePayment = (payment: Payment) => {
    Alert.alert(
      'Make Payment',
      `Pay R${payment.amount.toFixed(2)} for ${payment.payment_type}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay Now',
          onPress: () => {
            Alert.alert('Payment', 'Stripe integration required for actual payments');
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'overdue':
        return colors.accent;
      default:
        return colors.textSecondary;
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
        {payments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No payments</Text>
          </View>
        ) : (
          payments.map((payment) => (
            <View key={payment.payment_id} style={commonStyles.cardWhite}>
              <View style={styles.paymentHeader}>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentType}>{payment.payment_type}</Text>
                  <Text style={styles.paymentAmount}>R{payment.amount.toFixed(2)}</Text>
                  <Text style={commonStyles.textSecondary}>
                    Due: {new Date(payment.payment_date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) }]}>
                  <Text style={styles.statusText}>{payment.status.toUpperCase()}</Text>
                </View>
              </View>
              {payment.status === 'pending' && (
                <TouchableOpacity
                  style={[buttonStyles.accent, styles.payButton]}
                  onPress={() => handlePayment(payment)}
                >
                  <Text style={styles.payButtonText}>Pay Now</Text>
                </TouchableOpacity>
              )}
              {payment.receipt_url && (
                <Text style={styles.receiptLink}>📄 Receipt Available</Text>
              )}
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
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentType: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  payButton: {
    marginTop: 12,
  },
  payButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  receiptLink: {
    marginTop: 8,
    fontSize: 14,
    color: colors.primary,
  },
});
