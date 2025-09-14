import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { theme } from '../theme';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { markNotificationAsRead, removeNotification } from '../store/slices/notificationSlice';

const { width } = Dimensions.get('window');

interface NotificationBannerProps {
  onPress?: () => void;
}

export default function NotificationBanner({ onPress }: NotificationBannerProps) {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useAppSelector(state => state.notifications);
  
  const latestNotification = notifications[0];
  const [slideAnim] = React.useState(new Animated.Value(-100));
  const [opacityAnim] = React.useState(new Animated.Value(0));

  useEffect(() => {
    if (latestNotification && latestNotification.status === 'unread') {
      // Slide in animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after 5 seconds
      const timer = setTimeout(() => {
        hideNotification();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [latestNotification]);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (latestNotification) {
        dispatch(markNotificationAsRead(latestNotification.id));
      }
    });
  };

  const handlePress = () => {
    if (latestNotification) {
      dispatch(markNotificationAsRead(latestNotification.id));
      onPress?.();
    }
  };

  if (!latestNotification || latestNotification.status === 'read') {
    return null;
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return '💰';
      case 'withdrawal':
        return '💸';
      case 'profit':
        return '📈';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return theme.colors.status.success;
      case 'withdrawal':
        return theme.colors.neon.blue;
      case 'profit':
        return theme.colors.neon.green;
      default:
        return theme.colors.neon.purple;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.banner,
          { borderLeftColor: getNotificationColor(latestNotification.type) },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.content}>
          <Text style={styles.icon}>
            {getNotificationIcon(latestNotification.type)}
          </Text>
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {latestNotification.title}
            </Text>
            <Text style={styles.message} numberOfLines={2}>
              {latestNotification.message}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={hideNotification}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
        
        {unreadCount > 1 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>+{unreadCount - 1}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: theme.spacing.md,
  },
  banner: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: theme.colors.shadow.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  icon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  message: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  closeText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.status.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
});
