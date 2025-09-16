import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { theme } from '../theme';

interface SafeVaultLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  style?: any;
}

export default function SafeVaultLogo({ size = 'medium', showText = true, style }: SafeVaultLogoProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          containerSize: 40,
          iconSize: 20,
          textSize: theme.typography.fontSize.sm,
        };
      case 'large':
        return {
          containerSize: 120,
          iconSize: 60,
          textSize: theme.typography.fontSize['2xl'],
        };
      default: // medium
        return {
          containerSize: 80,
          iconSize: 40,
          textSize: theme.typography.fontSize.lg,
        };
    }
  };

  const { containerSize, iconSize, textSize } = getSizeStyles();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.logoContainer,
          {
            width: containerSize,
            height: containerSize,
            borderRadius: containerSize / 2,
          },
        ]}
      >
        <Image
          source={require('../../safevault-logo.jpeg')}
          style={[
            styles.logoImage,
            {
              width: containerSize - 6, // Account for border
              height: containerSize - 6,
              borderRadius: (containerSize - 6) / 2,
            },
          ]}
          resizeMode="cover"
        />
      </View>
      {showText && (
        <Text
          style={[
            styles.logoText,
            {
              fontSize: textSize,
            },
          ]}
        >
          SafeVault
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.neon.purple,
    shadowColor: theme.colors.shadow.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: theme.colors.background.card,
  },
  logoImage: {
    borderWidth: 0,
  },
  logoText: {
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.sm,
  },
});
