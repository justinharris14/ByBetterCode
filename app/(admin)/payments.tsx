
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  RefreshControl,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { Payment, User } from '@/types/database.types';

export default function AdminPaymentsScreen() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [parents, setParents] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  // Form fields
  const [selectedParentId, setSelectedParentId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [status, setStatus] = useState<'pending' | 'paid' | 'overdue'>('pending');
  const [dueDate, setDueDate] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [description, setDescription] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [stripePaymentIntentId, setStripePaymentIntentId] = useState('');
  const [stripeChargeId, setStripeChargeId] = useState('');
  const [stripeCustomerId, setStripeCustomerId] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [showParentPicker, setShowParentPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('due_date', { ascending: false });

      if (paymentsError) throw paymentsError;
      setPayments(paymentsData || []);

      // Load parents
      const { data: parentsData, error: parentsError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'parent')
        .eq('is_active', true)
        .order('first_name');

      if (parentsError) throw parentsError;
      setParents(parentsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openAddModal = () => {
    setEditingPayment(null);
    setSelectedParentId('');
    setAmount('');
    setPaymentType('');
    setStatus('pending');
    setDueDate('');
    setPaymentDate('');
    setDescription('');
    setReceiptUrl('');
    setStripePaymentIntentId('');
    setStripeChargeId('');
    setStripeCustomerId('');
    setReceiptNumber('');
    setModalVisible(true);
  };

  const openEditModal = (payment: Payment) => {
    setEditingPayment(payment);
    setSelectedParentId(payment.parent_id);
    setAmount(payment.amount.toString());
    setPaymentType(payment.payment_type);
    setStatus(payment.status);
    setDueDate(payment.due_date || '');
    setPaymentDate(payment.payment_date || '');
    setDescription(payment.description || '');
    setReceiptUrl(payment.receipt_url || '');
    setStripePaymentIntentId(payment.stripe_payment_intent_id || '');
    setStripeChargeId(payment.stripe_charge_id || '');
    setStripeCustomerId(payment.stripe_customer_id || '');
    setReceiptNumber(payment.receipt_number || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!selectedParentId || !amount || !paymentType || !dueDate) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      const paymentData = {
        parent_id: selectedParentId,
        amount: parseFloat(amount),
        payment_type: paymentType,
        status,
        due_date: dueDate,
        payment_date: paymentDate || null,
        description: description || null,
        receipt_url: receiptUrl || null,
        stripe_payment_intent_id: stripePaymentIntentId || null,
        stripe_charge_id: stripeChargeId || null,
        stripe_customer_id: stripeCustomerId || null,
        receipt_number: receiptNumber || null,
      };

      if (editingPayment) {
        const { error } = await supabase
          .from('payments')
          .update(paymentData)
          .eq('payment_id', editingPayment.payment_id);

        if (error) throw error;
        Alert.alert('Success', 'Payment updated successfully!');
      } else {
        const { error } = await supabase.from('payments').insert([paymentData]);

        if (error) throw error;
        Alert.alert('Success', 'Payment created successfully!');
      }

      setModalVisible(false);
      loadData();
    } catch (error) {
      console.error('Error saving payment:', error);
      Alert.alert('Error', 'Failed to save payment. Please try again.');
    }
  };

  const handleDelete = (payment: Payment) => {
    Alert.alert(
      'Delete Payment',
      'Are you sure you want to delete this payment record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('payments')
                .delete()
                .eq('payment_id', payment.payment_id);

              if (error) throw error;
              Alert.alert('Success', 'Payment deleted successfully!');
              loadData();
            } catch (error) {
              console.error('Error deleting payment:', error);
              Alert.alert('Error', 'Failed to delete payment. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getParentName = (parentId: string) => {
    const parent = parents.find((p) => p.user_id === parentId);
    return parent ? `${parent.first_name} ${parent.last_name}` : 'Unknown';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
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

  const selectParent = (parentId: string) => {
    setSelectedParentId(parentId);
    setShowParentPicker(false);
  };

  const selectStatus = (newStatus: 'pending' | 'paid' | 'overdue') => {
    setStatus(newStatus);
    setShowStatusPicker(false);
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>💳 Payments Management</Text>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <IconSymbol name="plus.circle.fill" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {payments.filter((p) => p.status === 'paid').length}
            </Text>
            <Text style={styles.statLabel}>Paid</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {payments.filter((p) => p.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {payments.filter((p) => p.status === 'overdue').length}
            </Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
        </View>

        {payments.map((payment) => (
          <View key={payment.payment_id} style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentType}>{payment.payment_type}</Text>
                <Text style={styles.parentName}>{getParentName(payment.parent_id)}</Text>
                {payment.description && (
                  <Text style={styles.paymentDescription}>{payment.description}</Text>
                )}
                {payment.receipt_number && (
                  <Text style={styles.receiptNumber}>Receipt #: {payment.receipt_number}</Text>
                )}
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
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Due Date:</Text>
                <Text style={styles.detailValue}>{formatDate(payment.due_date || '')}</Text>
              </View>
              {payment.payment_date && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Paid On:</Text>
                  <Text style={styles.detailValue}>{formatDate(payment.payment_date)}</Text>
                </View>
              )}
              {payment.receipt_url && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Receipt:</Text>
                  <Text style={[styles.detailValue, { color: colors.primary }]}>Available</Text>
                </View>
              )}
              {payment.stripe_charge_id && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Stripe Charge:</Text>
                  <Text style={[styles.detailValue, styles.smallText]} numberOfLines={1}>
                    {payment.stripe_charge_id}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openEditModal(payment)}
              >
                <IconSymbol name="pencil" size={18} color={colors.primary} />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(payment)}
              >
                <IconSymbol name="trash" size={18} color={colors.error} />
                <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {payments.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💰</Text>
            <Text style={styles.emptyText}>No payments yet</Text>
            <Text style={styles.emptySubtext}>Add your first payment record</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingPayment ? 'Edit Payment' : 'Add Payment'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.label}>Parent *</Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => setShowParentPicker(!showParentPicker)}
              >
                <Text style={styles.pickerText}>
                  {selectedParentId ? getParentName(selectedParentId) : 'Select Parent'}
                </Text>
                <IconSymbol name="chevron.down" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              {showParentPicker && (
                <View style={styles.pickerOptions}>
                  {parents.map((parent) => (
                    <TouchableOpacity
                      key={parent.user_id}
                      style={styles.pickerOption}
                      onPress={() => selectParent(parent.user_id)}
                    >
                      <Text style={styles.pickerOptionText}>
                        {parent.first_name} {parent.last_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.label}>Payment Type *</Text>
              <TextInput
                style={commonStyles.input}
                value={paymentType}
                onChangeText={setPaymentType}
                placeholder="e.g., Tuition, Meal Plan, Activity Fee"
              />

              <Text style={styles.label}>Amount (R) *</Text>
              <TextInput
                style={commonStyles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={commonStyles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Optional description"
                multiline
              />

              <Text style={styles.label}>Status *</Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => setShowStatusPicker(!showStatusPicker)}
              >
                <Text style={styles.pickerText}>{status.toUpperCase()}</Text>
                <IconSymbol name="chevron.down" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              {showStatusPicker && (
                <View style={styles.pickerOptions}>
                  <TouchableOpacity
                    style={styles.pickerOption}
                    onPress={() => selectStatus('pending')}
                  >
                    <Text style={styles.pickerOptionText}>PENDING</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.pickerOption}
                    onPress={() => selectStatus('paid')}
                  >
                    <Text style={styles.pickerOptionText}>PAID</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.pickerOption}
                    onPress={() => selectStatus('overdue')}
                  >
                    <Text style={styles.pickerOptionText}>OVERDUE</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.label}>Due Date * (YYYY-MM-DD)</Text>
              <TextInput
                style={commonStyles.input}
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="2025-02-01"
              />

              <Text style={styles.label}>Payment Date (YYYY-MM-DD)</Text>
              <TextInput
                style={commonStyles.input}
                value={paymentDate}
                onChangeText={setPaymentDate}
                placeholder="2025-01-15"
              />

              <Text style={styles.sectionHeader}>Stripe Integration (Optional)</Text>

              <Text style={styles.label}>Stripe Payment Intent ID</Text>
              <TextInput
                style={commonStyles.input}
                value={stripePaymentIntentId}
                onChangeText={setStripePaymentIntentId}
                placeholder="pi_xxxxxxxxxxxxx"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Stripe Charge ID</Text>
              <TextInput
                style={commonStyles.input}
                value={stripeChargeId}
                onChangeText={setStripeChargeId}
                placeholder="ch_xxxxxxxxxxxxx"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Stripe Customer ID</Text>
              <TextInput
                style={commonStyles.input}
                value={stripeCustomerId}
                onChangeText={setStripeCustomerId}
                placeholder="cus_xxxxxxxxxxxxx"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Receipt Number</Text>
              <TextInput
                style={commonStyles.input}
                value={receiptNumber}
                onChangeText={setReceiptNumber}
                placeholder="1234-5678"
              />

              <Text style={styles.label}>Receipt URL</Text>
              <TextInput
                style={commonStyles.input}
                value={receiptUrl}
                onChangeText={setReceiptUrl}
                placeholder="https://example.com/receipt.pdf"
                autoCapitalize="none"
              />

              <TouchableOpacity style={buttonStyles.primary} onPress={handleSave}>
                <Text style={buttonStyles.text}>
                  {editingPayment ? 'Update Payment' : 'Create Payment'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[buttonStyles.outline, { marginTop: 12, marginBottom: 20 }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={buttonStyles.text}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  addButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  paymentCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  parentName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  paymentDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
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
    marginBottom: 12,
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
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  deleteText: {
    color: colors.error,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalScroll: {
    padding: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  pickerText: {
    fontSize: 16,
    color: colors.text,
  },
  pickerOptions: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 12,
    maxHeight: 200,
  },
  pickerOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerOptionText: {
    fontSize: 16,
    color: colors.text,
  },
});
