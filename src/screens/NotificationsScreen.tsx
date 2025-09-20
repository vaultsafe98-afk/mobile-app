import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { apiService } from '../services/apiService';
import { markNotificationAsRead, markAllNotificationsAsRead, Notification } from '../store/slices/notificationSlice';
import { useFocusRefresh } from '../hooks/useFocusRefresh';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, isLoading } = useAppSelector(state => state.notifications);
  
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load notifications on component mount
  useEffect(() => {
    loadNotifications();
  }, []);

  // Refresh data when screen comes into focus (disabled temporarily)
  // useFocusRefresh({
  //   onFocus: () => loadNotifications(1, true),
  //   refreshOnFocus: true,
  // });

  const loadNotifications = async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      const response = await apiService.getNotifications(pageNum, 20);
      
      if (response.success && response.data) {
        if (refresh || pageNum === 1) {
          // Replace notifications for refresh or first load
          dispatch({
            type: 'notifications/setNotifications',
            payload: response.data.notifications
          });
        } else {
          // Append notifications for pagination
          dispatch({
            type: 'notifications/appendNotifications',
            payload: response.data.notifications
          });
        }
        
        setHasMore(pageNum < response.data.pagination.totalPages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications(1, true);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      loadNotifications(page + 1);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await apiService.markNotificationAsRead(notificationId);
      if (response.success) {
        dispatch(markNotificationAsRead(notificationId));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await apiService.markAllNotificationsAsRead();
      if (response.success) {
        dispatch(markAllNotificationsAsRead());
        Alert.alert('Success', 'All notifications marked as read');
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return '💰';
      case 'withdrawal':
        return '💸';
      case 'profit':
        return '📈';
      case 'general':
        return 'ℹ️';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return theme.colors.status.success;
      case 'withdrawal':
        return theme.colors.status.warning;
      case 'profit':
        return theme.colors.neon.green;
      case 'general':
        return theme.colors.neon.blue;
      default:
        return theme.colors.neon.purple;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    // Safety check for undefined _id
    if (!item._id) {
      console.warn('Notification with undefined _id:', item);
      return null;
    }
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          item.status === 'unread' && styles.unreadNotification
        ]}
        onPress={() => handleMarkAsRead(item._id)}
      >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationIconContainer}>
            <Text style={styles.notificationIcon}>
              {getNotificationIcon(item.type)}
            </Text>
          </View>
          <View style={styles.notificationTextContainer}>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            <Text style={styles.notificationDate}>
              {formatDate(item.date)}
            </Text>
          </View>
          {item.status === 'unread' && (
            <View style={[styles.unreadDot, { backgroundColor: getNotificationColor(item.type) }]} />
          )}
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🔔</Text>
      <Text style={styles.emptyStateText}>No notifications</Text>
      <Text style={styles.emptyStateSubtext}>
        You'll see important updates and alerts here
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item, index) => item._id || `notification-${index}`}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.neon.green}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      {/* Unread Count Badge */}
      {unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  markAllButton: {
    backgroundColor: theme.colors.neon.purple,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 6,
  },
  markAllText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  listContainer: {
    padding: theme.spacing.lg,
  },
  notificationItem: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 12,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.neon.green,
    backgroundColor: theme.colors.background.tertiary,
  },
  notificationContent: {
    padding: theme.spacing.md,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIconContainer: {
    marginRight: theme.spacing.md,
  },
  notificationIcon: {
    fontSize: theme.typography.fontSize.lg,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    lineHeight: 20,
  },
  notificationDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: theme.spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing['3xl'],
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.lg,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: 60,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.status.error,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  unreadBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
});
