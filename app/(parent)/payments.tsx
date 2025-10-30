
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
import { File, Paths } from 'expo-file-system';
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

  const loadStripeHistory = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingStripe(true);
      
      // Get the user's Stripe customer ID from the first payment
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
    if (user) {
      loadPayments();
    }
  }, [user, loadPayments]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    if (showStripeHistory) {
      await loadStripeHistory();
    }
    setRefreshing(false);
  };

  const formatDate = (dateString: string | number) => {
    const date = typeof dateString === 'number' 
      ? new Date(dateString * 1000) 
      : new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'ZAR') => {
    // Stripe amounts are in cents
    const displayAmount = currency === 'usd' || currency === 'zar' 
      ? amount / 100 
      : amount;
    return `R${displayAmount.toFixed(2)}`;
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

  const handleViewReceipt = async (payment: Payment) => {
    if (!payment.receipt_url && !payment.stripe_charge_id) {
      Alert.alert('No Receipt', 'No receipt is available for this payment yet.');
      return;
    }

    try {
      let receiptUrl = payment.receipt_url;

      // If we have a Stripe charge ID but no receipt URL, fetch it from Stripe
      if (!receiptUrl && payment.stripe_charge_id) {
        const { data, error } = await supabase.functions.invoke('stripe-receipts', {
          body: {
            action: 'get_receipt',
            charge_id: payment.stripe_charge_id,
          },
        });

        if (error) {
          console.error('Error fetching receipt from Stripe:', error);
          Alert.alert('Error', 'Unable to fetch receipt from Stripe.');
          return;
        }

        receiptUrl = data.receipt_url;

        // Update the local payment record with the receipt URL
        if (receiptUrl) {
          await supabase
            .from('payments')
            .update({ receipt_url: receiptUrl, receipt_number: data.receipt_number })
            .eq('payment_id', payment.payment_id);
        }
      }

      if (receiptUrl) {
        console.log('Opening receipt URL:', receiptUrl);
        await WebBrowser.openBrowserAsync(receiptUrl);
      } else {
        Alert.alert('No Receipt', 'Receipt URL not available.');
      }
    } catch (error) {
      console.error('Error opening receipt:', error);
      Alert.alert('Error', 'Unable to open receipt. Please try again.');
    }
  };

  const handleDownloadReceipt = async (payment: Payment) => {
    if (!payment.receipt_url && !payment.stripe_charge_id) {
      Alert.alert('No Receipt', 'No receipt is available for this payment yet.');
      return;
    }

    try {
      let receiptUrl = payment.receipt_url;

      // If we have a Stripe charge ID but no receipt URL, fetch it from Stripe
      if (!receiptUrl && payment.stripe_charge_id) {
        const { data, error } = await supabase.functions.invoke('stripe-receipts', {
          body: {
            action: 'get_receipt',
            charge_id: payment.stripe_charge_id,
          },
        });

        if (error) {
          console.error('Error fetching receipt from Stripe:', error);
          Alert.alert('Error', 'Unable to fetch receipt from Stripe.');
          return;
        }

        receiptUrl = data.receipt_url;
      }

      if (!receiptUrl) {
        Alert.alert('No Receipt', 'Receipt URL not available.');
        return;
      }

      console.log('Downloading receipt from:', receiptUrl);

      // For web, just open the receipt URL in a new tab
      if (Platform.OS === 'web') {
        window.open(receiptUrl, '_blank');
        Alert.alert('Success', 'Receipt opened in a new tab!');
        return;
      }

      // For mobile, download the file using the new expo-file-system v19 API
      const timestamp = new Date().getTime();
      const filename = `receipt_${payment.payment_id}_${timestamp}.pdf`;

      Alert.alert('Downloading', 'Downloading receipt...');

      // Download file to the document directory
      const downloadedFile = await File.downloadFileAsync(
        receiptUrl,
        Paths.document,
        filename
      );

      console.log('Receipt downloaded to:', downloadedFile.uri);

      Alert.alert(
        'Success',
        'Receipt downloaded successfully!',
        [
          {
            text: 'Open',
            onPress: () => {
              Linking.openURL(downloadedFile.uri).catch((err) => {
                console.error('Error opening downloaded file:', err);
                Alert.alert('Error', 'Unable to open the downloaded file.');
              });
            },
          },
          { text: 'OK' },
        ]
      );
    } catch (error) {
      console.error('Error downloading receipt:', error);
      Alert.alert('Error', 'Unable to download receipt. Please try again.');
    }
  };

  const handleViewStripeReceipt = async (stripePayment: StripePaymentHistory) => {
    if (!stripePayment.receipt_url) {
      Alert.alert('No Receipt', 'No receipt is available for this payment.');
      return;
    }

    try {
      await WebBrowser.openBrowserAsync(stripePayment.receipt_url);
    } catch (error) {
      console.error('Error opening Stripe receipt:', error);
      Alert.alert('Error', 'Unable to open receipt. Please try again.');
    }
  };

  const handleDownloadStripeReceipt = async (stripePayment: StripePaymentHistory) => {
    if (!stripePayment.receipt_url) {
      Alert.alert('No Receipt', 'No receipt is available for this payment.');
      return;
    }

    try {
      if (Platform.OS === 'web') {
        window.open(stripePayment.receipt_url, '_blank');
        Alert.alert('Success', 'Receipt opened in a new tab!');
        return;
      }

      const timestamp = new Date().getTime();
      const filename = `stripe_receipt_${stripePayment.charge_id}_${timestamp}.pdf`;

      Alert.alert('Downloading', 'Downloading receipt...');

      const downloadedFile = await File.downloadFileAsync(
        stripePayment.receipt_url,
        Paths.document,
        filename
      );

      Alert.alert(
        'Success',
        'Receipt downloaded successfully!',
        [
          {
            text: 'Open',
            onPress: () => {
              Linking.openURL(downloadedFile.uri).catch((err) => {
                console.error('Error opening downloaded file:', err);
                Alert.alert('Error', 'Unable to open the downloaded file.');
              });
            },
          },
          { text: 'OK' },
        ]
      );
    } catch (error) {
      console.error('Error downloading Stripe receipt:', error);
      Alert.alert('Error', 'Unable to download receipt. Please try again.');
    }
  };

  const handleTuitionPayment = async () => {
    const tuitionUrl = 'https://buy.stripe.com/test_8x24gsf6R10p3NB7HG7g400';

    try {
      await WebBrowser.openBrowserAsync(tuitionUrl);
    } catch (error) {
      console.error('Error opening payment page:', error);
      Alert.alert('Error', 'Unable to open payment page. Please try again.');
    }
  };

  const handleWeeklyMealPayment = async () => {
    const weeklyMealUrl = 'https://buy.stripe.com/test_bJe00ccYJdNb2Jx5zy7g401';

    try {
      await WebBrowser.openBrowserAsync(weeklyMealUrl);
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

        {payment.status === 'paid' && (payment.receipt_url || payment.stripe_charge_id) && (
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

  const renderStripePaymentCard = (stripePayment: StripePaymentHistory) => {
    return (
      <View key={stripePayment.payment_intent_id} style={styles.paymentCard}>
        <View style={styles.paymentHeader}>
          <View style={styles.paymentTitleContainer}>
            <IconSymbol
              name={getStatusIcon(stripePayment.status)}
              size={24}
              color={getStatusColor(stripePayment.status)}
            />
            <View style={styles.paymentTitleText}>
              <Text style={styles.paymentType}>
                {stripePayment.description || 'Payment'}
              </Text>
              {stripePayment.receipt_number && (
                <Text style={styles.receiptNumber}>
                  Receipt #: {stripePayment.receipt_number}
                </Text>
              )}
            </View>
          </View>
          <Text style={styles.paymentAmount}>
            {formatCurrency(stripePayment.amount, stripePayment.currency)}
          </Text>
        </View>

        <View style={styles.paymentDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={[styles.detailValue, { color: getStatusColor(stripePayment.status) }]}>
              {stripePayment.status.toUpperCase()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{formatDate(stripePayment.created)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment ID:</Text>
            <Text style={[styles.detailValue, styles.smallText]} numberOfLines={1}>
              {stripePayment.payment_intent_id}
            </Text>
          </View>
        </View>

        {stripePayment.receipt_url && (
          <View style={styles.receiptActions}>
            <TouchableOpacity
              style={styles.receiptButton}
              onPress={() => handleViewStripeReceipt(stripePayment)}
            >
              <IconSymbol name="eye.fill" size={18} color={colors.primary} />
              <Text style={styles.receiptButtonText}>View Receipt</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.receiptButton}
              onPress={() => handleDownloadStripeReceipt(stripePayment)}
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
            onPress={handleTuitionPayment}
          >
            <IconSymbol name="graduationcap.fill" size={32} color={colors.white} />
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

        {/* Stripe Payment History Button */}
        <View style={styles.stripeHistoryContainer}>
          <TouchableOpacity
            style={styles.stripeHistoryButton}
            onPress={() => {
              if (showStripeHistory) {
                setShowStripeHistory(false);
              } else {
                loadStripeHistory();
              }
            }}
            disabled={loadingStripe}
          >
            {loadingStripe ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <IconSymbol 
                  name={showStripeHistory ? "chevron.up" : "chevron.down"} 
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

        {/* Stripe Payment History */}
        {showStripeHistory && stripeHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💰 Stripe Payment History</Text>
            <Text style={styles.sectionSubtitle}>
              Complete payment history from Stripe
            </Text>
            {stripeHistory.map(renderStripePaymentCard)}
          </View>
        )}

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
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  weeklyMealCard: {
    backgroundColor: colors.secondary,
  },
  quickActionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginTop: 12,
    textAlign: 'center',
  },
  stripeHistoryContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
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
  stripeHistoryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
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
    marginBottom: 2,
  },
  receiptNumber: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
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
  smallText: {
    fontSize: 11,
    maxWidth: 200,
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
