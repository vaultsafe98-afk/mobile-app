import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { theme } from '../theme';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { submitWithdrawalRequest } from '../store/slices/transactionSlice';
import { addNotification } from '../store/slices/notificationSlice';
import { fetchWalletBalance } from '../store/slices/walletSlice';
import { useFocusRefresh } from '../hooks/useFocusRefresh';

export default function WithdrawScreen() {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector(state => state.transactions);
  const { balance, isLoading: walletLoading } = useAppSelector(state => state.wallet);
  const [formData, setFormData] = useState({
    amount: '',
    platform: '',
    walletAddress: '',
  });
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch wallet balance on component mount
  useEffect(() => {
    loadData();
  }, [dispatch]);

  // Load data function
  const loadData = async () => {
    dispatch(fetchWalletBalance());
  };

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Refresh data when screen comes into focus (disabled temporarily)
  // useFocusRefresh({
  //   onFocus: loadData,
  //   refreshOnFocus: true,
  // });

  const platforms = [
    { id: 'binance', name: 'Binance', icon: '🟡' },
    { id: 'trustwallet', name: 'Trust Wallet', icon: '🔵' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePlatformSelect = (platform: any) => {
    setFormData(prev => ({ ...prev, platform: platform.name }));
    setShowPlatformModal(false);
  };

  const handleSubmitWithdrawal = async () => {
    const { amount, platform, walletAddress } = formData;

    if (!amount || !platform || !walletAddress) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amountNum > (balance.total || 0)) {
      Alert.alert('Error', 'Insufficient balance. Available balance: $' + (balance.total || 0).toFixed(2));
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await dispatch(submitWithdrawalRequest({
        amount: amountNum,
        platform,
        walletAddress,
      }));

      if (submitWithdrawalRequest.fulfilled.match(result)) {
        // Add notification
        dispatch(addNotification({
          message: `Your withdrawal request of $${amount} to ${platform} has been submitted for review`,
          type: 'withdrawal',
        }));

        Alert.alert('Success', 'Withdrawal request submitted successfully!');
        setFormData({ amount: '', platform: '', walletAddress: '' });
      } else if (submitWithdrawalRequest.rejected.match(result)) {
        Alert.alert('Error', result.payload as string);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMaxAmount = () => {
    return balance.total || 0;
  };

  const setMaxAmount = () => {
    setFormData(prev => ({ ...prev, amount: getMaxAmount().toString() }));
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.neon.green}
          colors={[theme.colors.neon.green]}
        />
      }
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Withdraw USDT</Text>
          <Text style={styles.subtitle}>Withdraw from your SafeVault to external wallet</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          {walletLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.neon.green} />
              <Text style={styles.loadingText}>Loading balance...</Text>
            </View>
          ) : (
            <Text style={styles.balanceAmount}>
              ${getMaxAmount().toFixed(2)} USDT
            </Text>
          )}
        </View>

        {/* Amount Input */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Amount (USDT)</Text>
          <View style={styles.amountContainer}>
            <TextInput
              style={styles.amountInput}
              value={formData.amount}
              onChangeText={(value) => handleInputChange('amount', value)}
              placeholder="0.00"
              placeholderTextColor={theme.colors.text.tertiary}
              keyboardType="numeric"
            />
            <TouchableOpacity 
              style={[styles.maxButton, walletLoading && styles.maxButtonDisabled]} 
              onPress={setMaxAmount}
              disabled={walletLoading}
            >
              <Text style={styles.maxButtonText}>MAX</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Platform Selection */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Platform</Text>
          <TouchableOpacity
            style={styles.platformSelector}
            onPress={() => setShowPlatformModal(true)}
          >
            <Text style={[styles.platformText, !formData.platform && styles.placeholderText]}>
              {formData.platform || 'Select platform'}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Wallet Address Input */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Wallet Address</Text>
          <TextInput
            style={styles.walletInput}
            value={formData.walletAddress}
            onChangeText={(value) => handleInputChange('walletAddress', value)}
            placeholder="Enter your wallet address"
            placeholderTextColor={theme.colors.text.tertiary}
            multiline
          />
        </View>

        {/* Withdrawal Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Withdrawal Information:</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Amount:</Text>
            <Text style={styles.infoValue}>{formData.amount || '0.00'} USDT</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Platform:</Text>
            <Text style={styles.infoValue}>{formData.platform || 'Not selected'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fee:</Text>
            <Text style={styles.infoValue}>2.5 USDT</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>You'll receive:</Text>
            <Text style={[styles.infoValue, styles.receiveAmount]}>
              {formData.amount ? (parseFloat(formData.amount) - 2.5).toFixed(2) : '0.00'} USDT
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmitWithdrawal}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Withdrawal Request'}
          </Text>
        </TouchableOpacity>

        {/* Status Info */}
        <View style={styles.statusInfo}>
          <Text style={styles.statusTitle}>Withdrawal Status:</Text>
          <Text style={styles.statusText}>Pending → Approved/Rejected (Admin Action)</Text>
        </View>
      </View>

      {/* Platform Selection Modal */}
      <Modal
        visible={showPlatformModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPlatformModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Platform</Text>
            {platforms.map((platform) => (
              <TouchableOpacity
                key={platform.id}
                style={styles.platformOption}
                onPress={() => handlePlatformSelect(platform)}
              >
                <Text style={styles.platformIcon}>{platform.icon}</Text>
                <Text style={styles.platformName}>{platform.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPlatformModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
  },
  balanceCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  balanceLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  balanceAmount: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neon.green,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
  },
  inputCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginRight: theme.spacing.md,
  },
  maxButton: {
    backgroundColor: theme.colors.neon.purple,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 6,
  },
  maxButtonDisabled: {
    backgroundColor: theme.colors.button.disabled,
    opacity: 0.5,
  },
  maxButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  platformSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  platformText: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
  },
  placeholderText: {
    color: theme.colors.text.tertiary,
  },
  dropdownArrow: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  walletInput: {
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  infoCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  infoTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  receiveAmount: {
    color: theme.colors.neon.green,
    fontWeight: theme.typography.fontWeight.bold,
  },
  submitButton: {
    backgroundColor: theme.colors.button.primary,
    borderRadius: 12,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    shadowColor: theme.colors.shadow.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.button.disabled,
  },
  submitButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.background.primary,
  },
  statusInfo: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 12,
    padding: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.neon.blue,
  },
  statusTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  statusText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 16,
    padding: theme.spacing.lg,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  platformOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  platformIcon: {
    fontSize: theme.typography.fontSize.xl,
    marginRight: theme.spacing.md,
  },
  platformName: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
  },
  modalCloseButton: {
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neon.blue,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
