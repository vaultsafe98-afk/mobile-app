import { Animated } from 'react-native';

export class AnimationUtils {
  /**
   * Fade in animation
   */
  static fadeIn(duration: number = 300): Animated.CompositeAnimation {
    return Animated.timing(new Animated.Value(0), {
      toValue: 1,
      duration,
      useNativeDriver: true,
    });
  }

  /**
   * Fade out animation
   */
  static fadeOut(duration: number = 300): Animated.CompositeAnimation {
    return Animated.timing(new Animated.Value(1), {
      toValue: 0,
      duration,
      useNativeDriver: true,
    });
  }

  /**
   * Slide in from bottom
   */
  static slideInFromBottom(duration: number = 300): Animated.CompositeAnimation {
    return Animated.timing(new Animated.Value(100), {
      toValue: 0,
      duration,
      useNativeDriver: true,
    });
  }

  /**
   * Slide out to bottom
   */
  static slideOutToBottom(duration: number = 300): Animated.CompositeAnimation {
    return Animated.timing(new Animated.Value(0), {
      toValue: 100,
      duration,
      useNativeDriver: true,
    });
  }

  /**
   * Scale animation
   */
  static scale(from: number, to: number, duration: number = 300): Animated.CompositeAnimation {
    return Animated.timing(new Animated.Value(from), {
      toValue: to,
      duration,
      useNativeDriver: true,
    });
  }

  /**
   * Bounce animation
   */
  static bounce(duration: number = 600): Animated.CompositeAnimation {
    return Animated.sequence([
      Animated.timing(new Animated.Value(1), {
        toValue: 1.2,
        duration: duration / 2,
        useNativeDriver: true,
      }),
      Animated.timing(new Animated.Value(1.2), {
        toValue: 1,
        duration: duration / 2,
        useNativeDriver: true,
      }),
    ]);
  }

  /**
   * Pulse animation
   */
  static pulse(duration: number = 1000): Animated.CompositeAnimation {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(new Animated.Value(1), {
          toValue: 1.1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(new Animated.Value(1.1), {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ])
    );
  }

  /**
   * Shake animation
   */
  static shake(duration: number = 500): Animated.CompositeAnimation {
    const shakeValue = new Animated.Value(0);
    return Animated.sequence([
      Animated.timing(shakeValue, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeValue, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeValue, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeValue, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeValue, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]);
  }

  /**
   * Rotate animation
   */
  static rotate(duration: number = 1000): Animated.CompositeAnimation {
    return Animated.loop(
      Animated.timing(new Animated.Value(0), {
        toValue: 1,
        duration,
        useNativeDriver: true,
      })
    );
  }

  /**
   * Stagger animation for multiple elements
   */
  static stagger(
    animations: Animated.CompositeAnimation[],
    delay: number = 100
  ): Animated.CompositeAnimation {
    return Animated.stagger(delay, animations);
  }

  /**
   * Parallel animation for multiple properties
   */
  static parallel(animations: Animated.CompositeAnimation[]): Animated.CompositeAnimation {
    return Animated.parallel(animations);
  }

  /**
   * Sequence animation
   */
  static sequence(animations: Animated.CompositeAnimation[]): Animated.CompositeAnimation {
    return Animated.sequence(animations);
  }
}

// Predefined animation presets
export const AnimationPresets = {
  // Button press animation
  buttonPress: () => AnimationUtils.scale(1, 0.95, 100),
  buttonRelease: () => AnimationUtils.scale(0.95, 1, 100),

  // Card entrance animation
  cardEntrance: () => AnimationUtils.parallel([
    AnimationUtils.fadeIn(400),
    AnimationUtils.slideInFromBottom(400),
  ]),

  // Success animation
  success: () => AnimationUtils.sequence([
    AnimationUtils.bounce(600),
    AnimationUtils.pulse(2000),
  ]),

  // Error animation
  error: () => AnimationUtils.shake(500),

  // Loading animation
  loading: () => AnimationUtils.rotate(1000),

  // Notification entrance
  notificationEntrance: () => AnimationUtils.parallel([
    AnimationUtils.fadeIn(300),
    AnimationUtils.slideInFromBottom(300),
  ]),

  // Tab switch animation
  tabSwitch: () => AnimationUtils.fadeIn(200),

  // Modal entrance
  modalEntrance: () => AnimationUtils.parallel([
    AnimationUtils.fadeIn(300),
    AnimationUtils.scale(0.8, 1, 300),
  ]),
};
