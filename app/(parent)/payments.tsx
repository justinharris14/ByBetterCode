
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Linking,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { Payment } from '@/types/database.types';
import { IconSymbol } from '@/components/IconSymbol';
import * as FileSystem from 'expo-file-system';

export default function ParentPaymentsScreen() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadPayments();
    }
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

  const handlePayment = async (payment: Payment) => {
    if (payment.stripe_payment_url) {
      try {
        const supported = await Linking.canOpenURL(payment.stripe_payment_url);
        if (supported) {
          await Linking.openURL(payment.stripe_payment_url);
        } else {
          Alert.alert('Error', 'Cannot open payment link');
        }
      } catch (error) {
        console.error('Error opening payment link:', error);
        Alert.alert('Error', 'Failed to open payment link');
      }
    } else {
      Alert.alert('Info', 'Payment link not available. Please contact the school.');
    }
  };

  const handleDownloadReceipt = async (payment: Payment) => {
    if (!payment.receipt_url) {
      Alert.alert('Info', 'Receipt not available yet');
      return;
    }

    try {
      Alert.alert(
        'Download Receipt',
        'Receipt is available. You can view it in your browser.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'View',
            onPress: async () => {
              const supported = await Linking.canOpenURL(payment.receipt_url!);
              if (supported) {
                await Linking.openURL(payment.receipt_url!);
              } else {
                Alert.alert('Error', 'Cannot open receipt');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error downloading receipt:', error);
      Alert.alert('Error', 'Failed to download receipt');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'overdue':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return 'checkmark.circle.fill';
      case 'pending':
        return 'clock';
      case 'overdue':
        return 'exclamationmark.triangle.fill';
      default:
        return 'circle';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return `R${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <Text style={commonStyles.text}>Loading...</Text>
      </View>
    );
  }

  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'overdue');
  const paidPayments = payments.filter(p => p.status === 'paid');

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Payments</Text>
          <Text style={styles.subtitle}>
            {pendingPayments.length} pending payment{pendingPayments.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {pendingPayments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Payments</Text>
            {pendingPayments.map((payment) => (
              <View key={payment.payment_id} style={[commonStyles.cardWhite, styles.paymentCard]}>
                <View style={styles.paymentHeader}>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentType}>{payment.payment_type}</Text>
                    <Text style={styles.paymentAmount}>{formatAmount(payment.amount)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) + '20' }]}>
                    <IconSymbol
                      name={getStatusIcon(payment.status)}
                      size={16}
                      color={getStatusColor(payment.status)}
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.paymentDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Payment Date:</Text>
                    <Text style={styles.detailValue}>{formatDate(payment.payment_date)}</Text>
                  </View>
                  {payment.due_date && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Due Date:</Text>
                      <Text style={[styles.detailValue, payment.status === 'overdue' && styles.overdueText]}>
                        {formatDate(payment.due_date)}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[buttonStyles.primary, styles.payButton]}
                  onPress={() => handlePayment(payment)}
                >
                  <IconSymbol name="creditcard" size={20} color={colors.white} />
                  <Text style={styles.payButtonText}>Pay Now</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {paidPayments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment History</Text>
            {paidPayments.map((payment) => (
              <View key={payment.payment_id} style={[commonStyles.cardWhite, styles.paymentCard]}>
                <View style={styles.paymentHeader}>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentType}>{payment.payment_type}</Text>
                    <Text style={styles.paymentAmount}>{formatAmount(payment.amount)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) + '20' }]}>
                    <IconSymbol
                      name={getStatusIcon(payment.status)}
                      size={16}
                      color={getStatusColor(payment.status)}
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                      Paid
                    </Text>
                  </View>
                </View>

                <View style={styles.paymentDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Paid on:</Text>
                    <Text style={styles.detailValue}>{formatDate(payment.payment_date)}</Text>
                  </View>
                </View>

                {payment.receipt_url && (
                  <TouchableOpacity
                    style={[buttonStyles.outline, styles.receiptButton]}
                    onPress={() => handleDownloadReceipt(payment)}
                  >
                    <IconSymbol name="doc.text" size={20} color={colors.primary} />
                    <Text style={styles.receiptButtonText}>View Receipt</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {payments.length === 0 && (
          <View style={styles.emptyState}>
            <IconSymbol name="payment" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No payments yet</Text>
          </View>
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
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  paymentCard: {
    marginBottom: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paymentDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  overdueText: {
    color: colors.error,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  payButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  receiptButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
});
