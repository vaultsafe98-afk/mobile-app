import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Handles blocked user scenarios throughout the app
 */
export class BlockedUserHandler {
  /**
   * Check if an error message indicates a blocked account
   */
  static isBlockedUserError(error: string): boolean {
    return error.includes('blocked') || error.includes('ACCOUNT_BLOCKED');
  }

  /**
   * Handle blocked user error with auto-logout
   */
  static async handleBlockedUser(): Promise<void> {
    try {
      // Clear authentication token
      await AsyncStorage.removeItem('authToken');
      
      // Show blocked user alert
      Alert.alert(
        'Account Blocked',
        'Your account has been blocked. Please contact support for more information.',
        [
          {
            text: 'OK',
            onPress: () => {
              // The app will automatically redirect to login screen
              // due to authentication state change
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error handling blocked user:', error);
    }
  }

  /**
   * Process API error and handle blocked users
   */
  static async processApiError(error: string): Promise<boolean> {
    if (this.isBlockedUserError(error)) {
      await this.handleBlockedUser();
      return true; // Indicates this was a blocked user error
    }
    return false; // Not a blocked user error
  }
}
