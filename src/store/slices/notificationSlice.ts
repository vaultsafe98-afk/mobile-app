import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService, Notification } from '../../services/apiService';
import { generateObjectId } from '../../utils/objectId';

export interface Notification {
  _id: string;  // Use _id instead of id
  message: string;
  type: 'deposit' | 'withdrawal' | 'profit' | 'general';
  status: 'unread' | 'read';
  actionUrl?: string;
  date: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  } | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  pagination: null,
};

// Async thunks for API calls
export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (params: { page?: number; limit?: number; status?: 'read' | 'unread' } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getNotifications(params.page || 1, params.limit || 20, params.status);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Failed to fetch notifications');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch notifications');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.markNotificationAsRead(notificationId);
      if (response.success) {
        return notificationId;
      } else {
        return rejectWithValue(response.error || 'Failed to mark notification as read');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to mark notification as read');
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.markAllNotificationsAsRead();
      if (response.success) {
        return true;
      } else {
        return rejectWithValue(response.error || 'Failed to mark all notifications as read');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to mark all notifications as read');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getUnreadCount();
      if (response.success && response.data) {
        return response.data.unreadCount;
      } else {
        return rejectWithValue(response.error || 'Failed to fetch unread count');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch unread count');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'date' | 'status'>>) => {
      const newNotification: Notification = {
        ...action.payload,
        id: generateObjectId(),
        date: new Date().toISOString(),
        status: 'unread',
      };
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n._id === action.payload);
      if (notification) {
        if (notification.status === 'unread') {
          state.unreadCount -= 1;
        }
        state.notifications = state.notifications.filter(n => n._id !== action.payload);
      }
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => n.status === 'unread').length;
    },
    appendNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = [...state.notifications, ...action.payload];
      state.unreadCount = state.notifications.filter(n => n.status === 'unread').length;
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Mark notification as read
    builder
      .addCase(markNotificationAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        const notification = state.notifications.find(n => n._id === action.payload);
        if (notification && notification.status === 'unread') {
          notification.status = 'read';
          state.unreadCount -= 1;
        }
        state.error = null;
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Mark all notifications as read
    builder
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.isLoading = false;
        state.notifications.forEach(notification => {
          if (notification.status === 'unread') {
            notification.status = 'read';
          }
        });
        state.unreadCount = 0;
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch unread count
    builder
      .addCase(fetchUnreadCount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.unreadCount = action.payload;
        state.error = null;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  addNotification,
  removeNotification,
  clearAllNotifications,
  setLoading,
  setError,
  setNotifications,
  appendNotifications,
} = notificationSlice.actions;

// Export async thunks for direct use
export { markNotificationAsRead, markAllNotificationsAsRead };

export default notificationSlice.reducer;
