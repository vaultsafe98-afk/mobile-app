import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { theme } from '../theme';

interface BlockedUserScreenProps {
  onContactSupport?: () => void;
}

export default function BlockedUserScreen({ onContactSupport }: BlockedUserScreenProps) {
  const handleContactSupport = () => {
    if (onContactSupport) {
      onContactSupport();
    } else {
      Alert.alert(
        'Contact Support',
        'Please contact our support team at support@safevault.com or call +1-800-SAFE-VAULT for assistance.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🚫</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Account Blocked</Text>

        {/* Description */}
        <Text style={styles.description}>
          Your SafeVault account has been temporarily blocked. This may be due to:
        </Text>

        {/* Reasons */}
        <View style={styles.reasonsContainer}>
          <Text style={styles.reasonItem}>• Suspicious activity detected</Text>
          <Text style={styles.reasonItem}>• Policy violation</Text>
          <Text style={styles.reasonItem}>• Security concerns</Text>
          <Text style={styles.reasonItem}>• Administrative action</Text>
        </View>

        {/* Contact Support Button */}
        <TouchableOpacity style={styles.contactButton} onPress={handleContactSupport}>
          <Text style={styles.contactButtonText}>Contact Support</Text>
        </TouchableOpacity>

        {/* Additional Info */}
        <Text style={styles.additionalInfo}>
          Our support team is available 24/7 to help resolve this issue. Please provide your account email when contacting support.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  iconContainer: {
    marginBottom: theme.spacing.xl,
  },
  icon: {
    fontSize: 80,
    textAlign: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  description: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 24,
  },
  reasonsContainer: {
    alignSelf: 'stretch',
    marginBottom: theme.spacing.xl,
  },
  reasonItem: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    paddingLeft: theme.spacing.md,
  },
  contactButton: {
    backgroundColor: theme.colors.button.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderRadius: 12,
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
  contactButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.background.primary,
    textAlign: 'center',
  },
  additionalInfo: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
