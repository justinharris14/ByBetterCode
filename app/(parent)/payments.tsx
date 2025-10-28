
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { Payment } from '@/types/database.types';
import { colors, commonStyles } from '@/styles/commonStyles';

export default function ParentPaymentsScreen() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPayments = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('parent_id', user.user_id)
        .order('due_date', { ascending: false });

      if (error) {
        console.error('Error loading payments:', error);
        Alert.alert('Error', 'Failed to load payments. Please try again.');
      } else {
        setPayments(data || []);
      }
    } catch (error) {
      console.error('Error in loadPayments:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadPayments();
    }
  }, [user, loadPayments]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `R${amount.toFixed(2)}`;
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'overdue':
        return '#F44336';
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return 'checkmark.circle.fill';
      case 'pending':
        return 'clock.fill';
      case 'overdue':
        return 'exclamationmark.triangle.fill';
      default:
        return 'circle';
    }
  };

  const handleViewReceipt = async (payment: Payment) => {
    if (!payment.receipt_url) {
      Alert.alert('No Receipt', 'No receipt is available for this payment yet.');
      return;
    }

    try {
      await WebBrowser.openBrowserAsync(payment.receipt_url);
    } catch (error) {
      console.error('Error opening receipt:', error);
      Alert.alert('Error', 'Unable to open receipt. Please try again.');
    }
  };

  const handleDownloadReceipt = async (payment: Payment) => {
    if (!payment.receipt_url) {
      Alert.alert('No Receipt', 'No receipt is available for this payment yet.');
      return;
    }

    try {
      // For web, just open the receipt URL
      if (Platform.OS === 'web') {
        window.open(payment.receipt_url, '_blank');
        return;
      }

      // For mobile, download the file
      const filename = `receipt_${payment.payment_id}.pdf`;
      const fileUri = (FileSystem.documentDirectory || '') + filename;

      Alert.alert('Downloading', 'Downloading receipt...');

      const downloadResult = await FileSystem.downloadAsync(
        payment.receipt_url,
        fileUri
      );

      if (downloadResult.status === 200) {
        Alert.alert(
          'Success',
          'Receipt downloaded successfully!',
          [
            {
              text: 'Open',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL(downloadResult.uri);
                } else {
                  // On Android, you might need to use a file viewer
                  Linking.openURL(downloadResult.uri);
                }
              },
            },
            { text: 'OK' },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to download receipt. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      Alert.alert('Error', 'Unable to download receipt. Please try again.');
    }
  };

  const handleMakePayment = async () => {
    const tuitionUrl = 'https://buy.stripe.com/test_8x24gsf6R10p3NB7HG7g400';

    try {
      await WebBrowser.openBrowserAsync(tuitionUrl);
    } catch (error) {
      console.error('Error opening payment page:', error);
      Alert.alert('Error', 'Unable to open payment page. Please try again.');
    }
  };

  const renderPaymentCard = (payment: Payment) => {
    const daysUntilDue = payment.due_date ? getDaysUntilDue(payment.due_date) : null;
    const isOverdue = daysUntilDue !== null && daysUntilDue < 0 && payment.status !== 'paid';
    const isDueSoon = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7 && payment.status !== 'paid';

    return (
      <View
        key={payment.payment_id}
        style={[
          styles.paymentCard,
          isOverdue && styles.overdueCard,
          isDueSoon && styles.dueSoonCard,
        ]}
      >
        <View style={styles.paymentHeader}>
          <View style={styles.paymentTitleContainer}>
            <IconSymbol
              name={getStatusIcon(payment.status)}
              size={24}
              color={getStatusColor(payment.status)}
            />
            <View style={styles.paymentTitleText}>
              <Text style={styles.paymentType}>{payment.payment_type}</Text>
              {payment.description && (
                <Text style={styles.paymentDescription}>{payment.description}</Text>
              )}
            </View>
          </View>
          <Text style={styles.paymentAmount}>{formatCurrency(Number(payment.amount))}</Text>
        </View>

        <View style={styles.paymentDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={[styles.detailValue, { color: getStatusColor(payment.status) }]}>
              {payment.status.toUpperCase()}
            </Text>
          </View>

          {payment.due_date && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Due Date:</Text>
              <Text style={styles.detailValue}>{formatDate(payment.due_date)}</Text>
            </View>
          )}

          {payment.payment_date && payment.status === 'paid' && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Paid On:</Text>
              <Text style={styles.detailValue}>{formatDate(payment.payment_date)}</Text>
            </View>
          )}

          {daysUntilDue !== null && payment.status !== 'paid' && (
            <View style={styles.reminderContainer}>
              <IconSymbol name="bell.fill" size={16} color={isOverdue ? '#F44336' : '#FF9800'} />
              <Text style={[styles.reminderText, isOverdue && styles.overdueText]}>
                {isOverdue
                  ? `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`
                  : daysUntilDue === 0
                  ? 'Due today!'
                  : `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`}
              </Text>
            </View>
          )}
        </View>

        {payment.status === 'paid' && payment.receipt_url && (
          <View style={styles.receiptActions}>
            <TouchableOpacity
              style={styles.receiptButton}
              onPress={() => handleViewReceipt(payment)}
            >
              <IconSymbol name="eye.fill" size={18} color={colors.primary} />
              <Text style={styles.receiptButtonText}>View Receipt</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.receiptButton}
              onPress={() => handleDownloadReceipt(payment)}
            >
              <IconSymbol name="arrow.down.circle.fill" size={18} color={colors.primary} />
              <Text style={styles.receiptButtonText}>Download</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const pendingPayments = payments.filter((p) => p.status === 'pending' || p.status === 'overdue');
  const paidPayments = payments.filter((p) => p.status === 'paid');

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>💳 Payments</Text>
          <Text style={styles.headerSubtitle}>Manage your payment history and receipts</Text>
        </View>

        {/* Quick Payment Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Payment</Text>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={handleMakePayment}
          >
            <IconSymbol name="graduationcap.fill" size={32} color={colors.white} />
            <Text style={styles.quickActionText}>Pay Tuition Fee</Text>
          </TouchableOpacity>
        </View>

        {/* Pending/Overdue Payments */}
        {pendingPayments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏰ Pending Payments</Text>
            {pendingPayments.map(renderPaymentCard)}
          </View>
        )}

        {/* Paid Payments */}
        {paidPayments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Payment History</Text>
            {paidPayments.map(renderPaymentCard)}
          </View>
        )}

        {payments.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💰</Text>
            <Text style={styles.emptyText}>No payments yet</Text>
            <Text style={styles.emptySubtext}>
              Your payment history will appear here
            </Text>
          </View>
        )}

        {/* Add bottom padding to prevent content from being hidden by tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  quickActionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  quickActionCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginTop: 12,
    textAlign: 'center',
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  paymentCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  dueSoonCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  paymentTitleText: {
    flex: 1,
  },
  paymentType: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  paymentDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  paymentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  reminderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
  },
  overdueText: {
    color: '#F44336',
  },
  receiptActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  receiptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
  },
  receiptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
