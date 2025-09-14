import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Clipboard,
  TextInput,
  RefreshControl,
} from 'react-native';
import { theme } from '../theme';
import { useImagePicker } from '../hooks/useImagePicker';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { submitDepositRequest } from '../store/slices/transactionSlice';
import { addNotification } from '../store/slices/notificationSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import { useFocusRefresh } from '../hooks/useFocusRefresh';

export default function DepositScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [amount, setAmount] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    // Reset form or reload any data if needed
    setAmount('');
    clearImage();
    setRefreshing(false);
  };

  // Refresh data when screen comes into focus (smart reset)
  useFocusRefresh({
    onFocus: () => {
      // Only reset form if it's completely empty (user hasn't started entering data)
      if (!amount && !selectedImage) {
        // Form is empty, no need to reset
        return;
      }
      // If user has data, don't reset to avoid losing their input
    },
    refreshOnFocus: true,
  });
  
  const {
    selectedImage,
    isUploading,
    uploadProgress,
    pickImage,
    takePhoto,
    uploadImage,
    clearImage,
  } = useImagePicker();

  // Static USDT wallet address (as per requirements)
  const usdtWalletAddress = 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE';

  const copyToClipboard = () => {
    Clipboard.setString(usdtWalletAddress);
    Alert.alert('Copied', 'USDT wallet address copied to clipboard');
  };

  const handleImageUpload = () => {
    Alert.alert(
      'Select Image',
      'Choose how you want to add your deposit proof',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSubmitDeposit = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid deposit amount');
      return;
    }

    if (!selectedImage) {
      Alert.alert('Error', 'Please upload a screenshot of your transfer');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      // Upload image to S3
      const imageUrl = await uploadImage(user.id);
      
      if (imageUrl) {
        // Submit deposit request to API
        const result = await dispatch(submitDepositRequest({
          amount: parseFloat(amount),
          imageUri: imageUrl,
        }));

        if (submitDepositRequest.fulfilled.match(result)) {
          // Add notification
          dispatch(addNotification({
            message: 'Your deposit request has been submitted for review',
            type: 'deposit',
          }));

          Alert.alert('Success', 'Deposit request submitted successfully!');
          clearImage();
          setAmount('');
        } else if (submitDepositRequest.rejected.match(result)) {
          Alert.alert('Error', result.payload as string);
        }
      }
    } catch (error) {
      console.error('Error submitting deposit:', error);
      Alert.alert('Error', 'Failed to submit deposit request. Please try again.');
    }
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
          <Text style={styles.title}>Deposit USDT</Text>
          <Text style={styles.subtitle}>Send USDT to your SafeVault address</Text>
        </View>

        {/* Wallet Address Card */}
        <View style={styles.walletCard}>
          <Text style={styles.cardTitle}>USDT Wallet Address</Text>
          <View style={styles.addressContainer}>
            <Text style={styles.walletAddress}>{usdtWalletAddress}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.warningText}>
            ⚠️ Only send USDT (TRC-20) to this address. Sending other cryptocurrencies may result in permanent loss.
          </Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How to Deposit:</Text>
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>Copy the USDT wallet address above</Text>
          </View>
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>Send USDT from your external wallet</Text>
          </View>
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>Upload screenshot of the transaction</Text>
          </View>
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>4</Text>
            <Text style={styles.stepText}>Wait for admin approval</Text>
          </View>
        </View>

        {/* Amount Input */}
        <View style={styles.amountCard}>
          <Text style={styles.amountTitle}>Deposit Amount</Text>
          <Text style={styles.amountSubtitle}>Enter the amount you are depositing</Text>
          
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={theme.colors.text.secondary}
              keyboardType="numeric"
              returnKeyType="done"
            />
          </View>
        </View>

        {/* Image Upload */}
        <View style={styles.uploadCard}>
          <Text style={styles.uploadTitle}>Transaction Proof</Text>
          <Text style={styles.uploadSubtitle}>Upload a screenshot of your transfer</Text>
          
          <TouchableOpacity 
            style={styles.uploadButton} 
            onPress={handleImageUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <View style={styles.uploadProgress}>
                <LoadingSpinner size="small" color={theme.colors.neon.blue} />
                <Text style={styles.uploadProgressText}>
                  Uploading... {uploadProgress}%
                </Text>
              </View>
            ) : selectedImage ? (
              <View style={styles.imagePreview}>
                <Text style={styles.imagePreviewText}>✓ Image Selected</Text>
                <TouchableOpacity 
                  style={styles.clearImageButton}
                  onPress={clearImage}
                >
                  <Text style={styles.clearImageText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadIcon}>📷</Text>
                <Text style={styles.uploadText}>Tap to upload screenshot</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, (isUploading || !selectedImage || !amount) && styles.submitButtonDisabled]}
          onPress={handleSubmitDeposit}
          disabled={isUploading || !selectedImage || !amount}
        >
          <Text style={styles.submitButtonText}>
            {isUploading ? 'Uploading...' : 'Submit Deposit Request'}
          </Text>
        </TouchableOpacity>

        {/* Status Info */}
        <View style={styles.statusInfo}>
          <Text style={styles.statusTitle}>Deposit Status:</Text>
          <Text style={styles.statusText}>Pending → Approved/Rejected (Admin Action)</Text>
        </View>
      </View>
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
  walletCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  walletAddress: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontFamily: 'monospace',
  },
  copyButton: {
    backgroundColor: theme.colors.neon.green,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 6,
  },
  copyButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.background.primary,
  },
  warningText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.status.warning,
    lineHeight: 20,
  },
  instructionsCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  instructionsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.neon.purple,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
    lineHeight: 24,
    marginRight: theme.spacing.md,
  },
  stepText: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  amountCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  amountTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  amountSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  currencySymbol: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neon.green,
    marginRight: theme.spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.sm,
  },
  uploadCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  uploadTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  uploadSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: theme.colors.neon.blue,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  uploadText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neon.blue,
    fontWeight: theme.typography.fontWeight.medium,
  },
  imagePreview: {
    alignItems: 'center',
    position: 'relative',
  },
  imagePreviewText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.status.success,
    fontWeight: theme.typography.fontWeight.bold,
  },
  clearImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.status.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearImageText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.bold,
  },
  uploadProgress: {
    alignItems: 'center',
  },
  uploadProgressText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neon.blue,
    marginTop: theme.spacing.sm,
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
});
