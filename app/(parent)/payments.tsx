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
  ActivityIndicator,
} from 'react-native';
import FileSystem from 'expo-file-system';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { Payment, StripePaymentHistory } from '@/types/database.types';
import { colors, commonStyles } from '@/styles/commonStyles';

export default function ParentPaymentsScreen() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stripeHistory, setStripeHistory] = useState<StripePaymentHistory[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [showStripeHistory, setShowStripeHistory] = useState(false);

  // ---------------- LOAD PAYMENTS ----------------
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

  // ---------------- LOAD STRIPE HISTORY ----------------
  const loadStripeHistory = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingStripe(true);
      const customerPayment = payments.find(p => p.stripe_customer_id);
      if (!customerPayment?.stripe_customer_id) {
        Alert.alert('Info', 'No Stripe payment history available yet.');
        return;
      }

      const { data, error } = await supabase.functions.invoke('stripe-receipts', {
        body: {
          action: 'get_payment_history',
          customer_id: customerPayment.stripe_customer_id,
          limit: 20,
        },
      });

      if (error) {
        console.error('Error loading Stripe history:', error);
        Alert.alert('Error', 'Failed to load Stripe payment history.');
      } else {
        setStripeHistory(data.history || []);
        setShowStripeHistory(true);
      }
    } catch (error) {
      console.error('Error in loadStripeHistory:', error);
      Alert.alert('Error', 'Failed to load Stripe payment history.');
    } finally {
      setLoadingStripe(false);
    }
  }, [user, payments]);

  useEffect(() => {
    if (user) loadPayments();
  }, [user, loadPayments]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    if (showStripeHistory) await loadStripeHistory();
    setRefreshing(false);
  };

  // ---------------- UTILITIES ----------------
  const formatDate = (dateString: string | number) => {
    const date =
      typeof dateString === 'number' ? new Date(dateString * 1000) : new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'ZAR') => {
    const displayAmount =
      currency === 'usd' || currency === 'zar' ? amount / 100 : amount;
    return `R${displayAmount.toFixed(2)}`;
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'succeeded':
        return '#4CAF50';
      case 'pending':
      case 'processing':
        return '#FF9800';
      case 'overdue':
      case 'failed':
        return '#F44336';
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'succeeded':
        return 'checkmark.circle.fill';
      case 'pending':
      case 'processing':
        return 'clock.fill';
      case 'overdue':
      case 'failed':
        return 'exclamationmark.triangle.fill';
      default:
        return 'circle';
    }
  };

  // ---------------- DOWNLOAD FILE ----------------
  const downloadFile = async (url?: string | null, filename?: string) => {
    if (!url) {
      Alert.alert('No Receipt', 'Receipt URL not available.');
      return null;
    }

    try {
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
        Alert.alert('Opened in new tab');
        return null;
      }

      const fileUri = `${(FileSystem as any).documentDirectory}${filename}`;

      Alert.alert('Downloading', 'Downloading receipt...');
      const result = await FileSystem.downloadAsync(url, fileUri);
      return result.uri;
    } catch (error) {
      console.error('Error downloading file:', error);
      Alert.alert('Error', 'Unable to download file. Please try again.');
      return null;
    }
  };

  // ---------------- HANDLE RECEIPTS ----------------
  const handleViewReceipt = async (payment: Payment) => {
    try {
      const receiptUrl = payment.receipt_url ?? '';
      if (!receiptUrl && payment.stripe_charge_id) {
        const { data, error } = await supabase.functions.invoke('stripe-receipts', {
          body: { action: 'get_receipt', charge_id: payment.stripe_charge_id },
        });
        if (error) throw error;
        await WebBrowser.openBrowserAsync(data.receipt_url ?? '');
      } else if (receiptUrl) {
        await WebBrowser.openBrowserAsync(receiptUrl);
      } else {
        Alert.alert('No Receipt', 'Receipt URL not available.');
      }
    } catch (error) {
      console.error('Error viewing receipt:', error);
      Alert.alert('Error', 'Unable to view receipt. Please try again.');
    }
  };

  const handleDownloadReceipt = async (payment: Payment) => {
    const timestamp = new Date().getTime();
    const filename = `receipt_${payment.payment_id}_${timestamp}.pdf`;
    const uri = await downloadFile(payment.receipt_url ?? '', filename);
    if (uri) {
      Alert.alert('Success', 'Receipt downloaded!', [
        { text: 'Open', onPress: () => Linking.openURL(uri) },
        { text: 'OK' },
      ]);
    }
  };

  const handleViewStripeReceipt = async (stripePayment: StripePaymentHistory) => {
    const receiptUrl = stripePayment.receipt_url ?? '';
    if (receiptUrl) await WebBrowser.openBrowserAsync(receiptUrl);
    else Alert.alert('No Receipt', 'No receipt available.');
  };

  const handleDownloadStripeReceipt = async (stripePayment: StripePaymentHistory) => {
    const timestamp = new Date().getTime();
    const filename = `stripe_receipt_${stripePayment.charge_id}_${timestamp}.pdf`;
    const uri = await downloadFile(stripePayment.receipt_url ?? '', filename);
    if (uri) {
      Alert.alert('Success', 'Receipt downloaded!', [
        { text: 'Open', onPress: () => Linking.openURL(uri) },
        { text: 'OK' },
      ]);
    }
  };

  // ---------------- QUICK PAY ----------------
  const handleTuitionPayment = async () => {
    await WebBrowser.openBrowserAsync('https://buy.stripe.com/test_8x24gsf6R10p3NB7HG7g400');
  };

  const handleWeeklyMealPayment = async () => {
    await WebBrowser.openBrowserAsync('https://buy.stripe.com/test_bJe00ccYJdNb2Jx5zy7g401');
  };

  // ---------------- RENDER PAYMENT CARDS ----------------
  const renderPaymentCard = (payment: Payment) => {
    const daysUntilDue = payment.due_date ? getDaysUntilDue(payment.due_date) : null;
    const isOverdue = daysUntilDue !== null && daysUntilDue < 0 && payment.status !== 'paid';
    const isDueSoon =
      daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7 && payment.status !== 'paid';

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
              {payment.receipt_number && (
                <Text style={styles.receiptNumber}>Receipt #: {payment.receipt_number}</Text>
              )}
            </View>
          </View>
          <Text style={styles.paymentAmount}>{formatCurrency(Number(payment.amount), 'zar')}</Text>
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
        </View>

        {payment.status === 'paid' && (
          <View style={styles.receiptActions}>
            <TouchableOpacity style={styles.receiptButton} onPress={() => handleViewReceipt(payment)}>
              <IconSymbol name="eye.fill" size={18} color={colors.primary} />
              <Text style={styles.receiptButtonText}>View</Text>
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

  // ---------------- STRIPE PAYMENT CARD ----------------
  const renderStripePaymentCard = (stripePayment: StripePaymentHistory) => (
    <View key={stripePayment.payment_intent_id} style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentTitleContainer}>
          <IconSymbol
            name={getStatusIcon(stripePayment.status)}
            size={24}
            color={getStatusColor(stripePayment.status)}
          />
          <View style={styles.paymentTitleText}>
            <Text style={styles.paymentType}>{stripePayment.description || 'Payment'}</Text>
          </View>
        </View>
        <Text style={styles.paymentAmount}>
          {formatCurrency(stripePayment.amount, stripePayment.currency)}
        </Text>
      </View>

      <View style={styles.receiptActions}>
        <TouchableOpacity
          style={styles.receiptButton}
          onPress={() => handleViewStripeReceipt(stripePayment)}
        >
          <IconSymbol name="eye.fill" size={18} color={colors.primary} />
          <Text style={styles.receiptButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.receiptButton}
          onPress={() => handleDownloadStripeReceipt(stripePayment)}
        >
          <IconSymbol name="arrow.down.circle.fill" size={18} color={colors.primary} />
          <Text style={styles.receiptButtonText}>Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'overdue');
  const paidPayments = payments.filter(p => p.status === 'paid');

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

          <TouchableOpacity style={styles.quickActionCard} onPress={handleTuitionPayment}>
            <IconSymbol name="school" size={32} color={colors.white} />
            <Text style={styles.quickActionText}>Pay Tuition Fee</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionCard, styles.weeklyMealCard]}
            onPress={handleWeeklyMealPayment}
          >
            <IconSymbol name="fork.knife" size={32} color={colors.white} />
            <Text style={styles.quickActionText}>Pay Weekly Meals</Text>
          </TouchableOpacity>
        </View>

        {/* Stripe Payment History */}
        <View style={styles.stripeHistoryContainer}>
          <TouchableOpacity
            style={styles.stripeHistoryButton}
            onPress={() =>
              showStripeHistory ? setShowStripeHistory(false) : loadStripeHistory()
            }
            disabled={loadingStripe}
          >
            {loadingStripe ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <IconSymbol
                  name={showStripeHistory ? 'chevron.up' : 'chevron.down'}
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.stripeHistoryButtonText}>
                  {showStripeHistory ? 'Hide' : 'View'} Stripe Payment History
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {showStripeHistory && stripeHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💰 Stripe Payment History</Text>
            {stripeHistory.map(renderStripePaymentCard)}
          </View>
        )}

        {pendingPayments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏰ Pending Payments</Text>
            {pendingPayments.map(renderPaymentCard)}
          </View>
        )}

        {paidPayments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Payment History</Text>
            {paidPayments.map(renderPaymentCard)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  header: { padding: 20, paddingTop: 60 },
  headerTitle: { fontSize: 32, fontWeight: '700', color: colors.text, marginBottom: 8 },
  headerSubtitle: { fontSize: 16, color: colors.textSecondary },
  quickActionsContainer: { padding: 20, paddingTop: 0 },
  quickActionCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    marginBottom: 12,
  },
  weeklyMealCard: { backgroundColor: colors.secondary },
  quickActionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginTop: 12,
    textAlign: 'center',
  },
  stripeHistoryContainer: { paddingHorizontal: 20, paddingBottom: 12 },
  stripeHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  stripeHistoryButtonText: { fontSize: 16, fontWeight: '600', color: colors.primary },
  section: { padding: 20, paddingTop: 0 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 8 },
  paymentCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  overdueCard: { borderLeftWidth: 4, borderLeftColor: '#F44336' },
  dueSoonCard: { borderLeftWidth: 4, borderLeftColor: '#FF9800' },
  paymentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  paymentTitleContainer: { flexDirection: 'row', alignItems: 'flex-start', flex: 1, gap: 12 },
  paymentTitleText: { flex: 1 },
  paymentType: { fontSize: 18, fontWeight: '600', color: colors.text },
  paymentDescription: { fontSize: 14, color: colors.textSecondary },
  paymentAmount: { fontSize: 20, fontWeight: '700', color: colors.primary },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 14, color: colors.textSecondary },
  detailValue: { fontSize: 14, fontWeight: '600', color: colors.text },
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
  receiptNumber: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  paymentDetails: {
    gap: 8,
    marginTop: 8,
  },
  receiptButtonText: { fontSize: 14, fontWeight: '600', color: colors.primary },
});
