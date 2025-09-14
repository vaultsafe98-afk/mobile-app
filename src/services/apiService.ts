import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiConfig } from '../config/api';

// API Configuration
const config = getApiConfig();
const API_BASE_URL = config.BASE_URL;
const API_TIMEOUT = config.TIMEOUT;

// API Response Types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
    depositAmount: number;
    profitAmount: number;
    totalAmount: number;
    status: string;
    role: string;
    createdAt: string;
  };
}

interface WalletBalance {
  deposit: number;
  profit: number;
  total: number;
  lastUpdated: string;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'profit';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  description?: string;
  platform?: string;
  walletAddress?: string;
  imageUrl?: string;
  adminNotes?: string;
}

interface Notification {
  id: string;
  message: string;
  type: 'deposit' | 'withdrawal' | 'profit' | 'general';
  status: 'read' | 'unread';
  actionUrl?: string;
  date: string;
}

class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = API_TIMEOUT;
  }

  // Get authentication token from storage
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Set authentication token in storage
  private async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  // Remove authentication token from storage
  private async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  }

  // Make HTTP request
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      
      const config: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Authentication APIs
  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data?.token) {
      await this.setAuthToken(response.data.token);
    }

    return response;
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data?.token) {
      await this.setAuthToken(response.data.token);
    }

    return response;
  }

  async verifyToken(): Promise<ApiResponse<{ user: AuthResponse['user'] }>> {
    return this.request<{ user: AuthResponse['user'] }>('/auth/verify', {
      method: 'POST',
    });
  }

  async logout(): Promise<void> {
    await this.removeAuthToken();
  }

  // User Profile APIs
  async getUserProfile(): Promise<ApiResponse<AuthResponse['user']>> {
    return this.request<AuthResponse['user']>('/user/profile');
  }

  async updateUserProfile(updates: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  }): Promise<ApiResponse<AuthResponse['user']>> {
    return this.request<AuthResponse['user']>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async uploadProfileImage(imageUri: string): Promise<ApiResponse<{ profileImage: string }>> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);

    return this.request<{ profileImage: string }>('/user/profile-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
  }

  // Wallet APIs
  async getWalletBalance(): Promise<ApiResponse<WalletBalance>> {
    return this.request<WalletBalance>('/wallet');
  }

  async getTransactions(page: number = 1, limit: number = 20): Promise<ApiResponse<{
    transactions: Transaction[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }>> {
    return this.request<{
      transactions: Transaction[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
      };
    }>(`/wallet/transactions?page=${page}&limit=${limit}`);
  }

  async getDepositTransactions(page: number = 1, limit: number = 10): Promise<ApiResponse<{
    deposits: Transaction[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }>> {
    return this.request<{
      deposits: Transaction[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
      };
    }>(`/wallet/transactions/deposits?page=${page}&limit=${limit}`);
  }

  async getWithdrawalTransactions(page: number = 1, limit: number = 10): Promise<ApiResponse<{
    withdrawals: Transaction[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }>> {
    return this.request<{
      withdrawals: Transaction[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
      };
    }>(`/wallet/transactions/withdrawals?page=${page}&limit=${limit}`);
  }

  async getProfitTransactions(page: number = 1, limit: number = 10): Promise<ApiResponse<{
    profits: Transaction[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }>> {
    return this.request<{
      profits: Transaction[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
      };
    }>(`/wallet/transactions/profits?page=${page}&limit=${limit}`);
  }

  // Deposit APIs
  async submitDepositRequest(amount: number, imageUri: string): Promise<ApiResponse<{
    deposit: {
      id: string;
      amount: number;
      status: string;
      screenshotUrl: string;
      createdAt: string;
    };
  }>> {
    const formData = new FormData();
    formData.append('amount', amount.toString());
    formData.append('screenshot', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'deposit_proof.jpg',
    } as any);

    return this.request<{
      deposit: {
        id: string;
        amount: number;
        status: string;
        screenshotUrl: string;
        createdAt: string;
      };
    }>('/deposit/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
  }

  async getDepositHistory(page: number = 1, limit: number = 10): Promise<ApiResponse<{
    deposits: Transaction[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }>> {
    return this.request<{
      deposits: Transaction[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
      };
    }>(`/deposit/history?page=${page}&limit=${limit}`);
  }

  // Withdrawal APIs
  async submitWithdrawalRequest(data: {
    amount: number;
    platform: string;
    walletAddress: string;
  }): Promise<ApiResponse<{
    withdrawal: {
      id: string;
      amount: number;
      platform: string;
      walletAddress: string;
      status: string;
      createdAt: string;
    };
  }>> {
    return this.request<{
      withdrawal: {
        id: string;
        amount: number;
        platform: string;
        walletAddress: string;
        status: string;
        createdAt: string;
      };
    }>('/withdraw/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWithdrawalHistory(page: number = 1, limit: number = 10): Promise<ApiResponse<{
    withdrawals: Transaction[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }>> {
    return this.request<{
      withdrawals: Transaction[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
      };
    }>(`/withdraw/history?page=${page}&limit=${limit}`);
  }

  // Notification APIs
  async getNotifications(page: number = 1, limit: number = 20, status?: 'read' | 'unread'): Promise<ApiResponse<{
    notifications: Notification[];
    unreadCount: number;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    });

    return this.request<{
      notifications: Notification[];
      unreadCount: number;
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
      };
    }>(`/notifications?${params}`);
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<{ message: string }>> {
    console.log('API Service - Mark as read - ID:', notificationId, 'Length:', notificationId?.length);
    return this.request<{ message: string }>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/notifications/read-all', {
      method: 'PUT',
    });
  }

  async getUnreadCount(): Promise<ApiResponse<{ unreadCount: number }>> {
    return this.request<{ unreadCount: number }>('/notifications/unread-count');
  }

  // Auth APIs
  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{
    status: string;
    timestamp: string;
    uptime: number;
  }>> {
    return this.request<{
      status: string;
      timestamp: string;
      uptime: number;
    }>('/health');
  }
}

export const apiService = new ApiService();
export type { ApiResponse, AuthResponse, WalletBalance, Transaction, Notification };
