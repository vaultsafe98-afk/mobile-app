import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { theme } from '../theme';
import { AnimationPresets } from '../utils/animations';

interface AnimatedCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  delay?: number;
  onPress?: () => void;
  style?: ViewStyle;
  animated?: boolean;
}

export default function AnimatedCard({
  children,
  delay = 0,
  onPress,
  style,
  animated = true,
  ...props
}: AnimatedCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [animated, delay]);

  const handlePress = () => {
    if (onPress) {
      // Button press animation
      Animated.sequence([
        AnimationPresets.buttonPress(),
        AnimationPresets.buttonRelease(),
      ]).start();
      onPress();
    }
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <Animated.View
      style={[
        {
          opacity: animated ? fadeAnim : 1,
          transform: [
            { translateY: animated ? slideAnim : 0 },
            { scale: animated ? scaleAnim : 1 },
          ],
        },
        style,
      ]}
    >
      <CardComponent
        style={[styles.card, onPress && styles.pressableCard]}
        onPress={onPress ? handlePress : undefined}
        activeOpacity={onPress ? 0.8 : 1}
        {...props}
      >
        {children}
      </CardComponent>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    shadowColor: theme.colors.shadow.card,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pressableCard: {
    // Additional styles for pressable cards
  },
});
