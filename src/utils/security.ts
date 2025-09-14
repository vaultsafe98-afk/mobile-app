import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

// Security configuration
const SECURITY_CONFIG = {
  encryptionKey: 'your-32-character-secret-key-here', // In production, use environment variables
  storagePrefix: 'crypto_wallet_',
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
};

// Encryption utilities
export class SecurityUtils {
  /**
   * Encrypt sensitive data
   */
  static encrypt(data: string, key?: string): string {
    const encryptionKey = key || SECURITY_CONFIG.encryptionKey;
    return CryptoJS.AES.encrypt(data, encryptionKey).toString();
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encryptedData: string, key?: string): string {
    const encryptionKey = key || SECURITY_CONFIG.encryptionKey;
    const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Hash password with salt
   */
  static hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const generatedSalt = salt || CryptoJS.lib.WordArray.random(128/8).toString();
    const hash = CryptoJS.PBKDF2(password, generatedSalt, {
      keySize: 256/32,
      iterations: 10000
    }).toString();
    
    return { hash, salt: generatedSalt };
  }

  /**
   * Verify password against hash
   */
  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const testHash = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 10000
    }).toString();
    
    return testHash === hash;
  }

  /**
   * Generate secure random string
   */
  static generateSecureToken(length: number = 32): string {
    return CryptoJS.lib.WordArray.random(length).toString();
  }

  /**
   * Generate UUID v4
   */
  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// Secure storage utilities
export class SecureStorage {
  /**
   * Store encrypted data
   */
  static async setItem(key: string, value: any): Promise<void> {
    try {
      const encryptedKey = SECURITY_CONFIG.storagePrefix + key;
      const encryptedValue = SecurityUtils.encrypt(JSON.stringify(value));
      await AsyncStorage.setItem(encryptedKey, encryptedValue);
    } catch (error) {
      console.error('Error storing secure data:', error);
      throw new Error('Failed to store secure data');
    }
  }

  /**
   * Retrieve and decrypt data
   */
  static async getItem(key: string): Promise<any> {
    try {
      const encryptedKey = SECURITY_CONFIG.storagePrefix + key;
      const encryptedValue = await AsyncStorage.getItem(encryptedKey);
      
      if (!encryptedValue) {
        return null;
      }

      const decryptedValue = SecurityUtils.decrypt(encryptedValue);
      return JSON.parse(decryptedValue);
    } catch (error) {
      console.error('Error retrieving secure data:', error);
      return null;
    }
  }

  /**
   * Remove secure data
   */
  static async removeItem(key: string): Promise<void> {
    try {
      const encryptedKey = SECURITY_CONFIG.storagePrefix + key;
      await AsyncStorage.removeItem(encryptedKey);
    } catch (error) {
      console.error('Error removing secure data:', error);
    }
  }

  /**
   * Clear all secure data
   */
  static async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const secureKeys = keys.filter(key => key.startsWith(SECURITY_CONFIG.storagePrefix));
      await AsyncStorage.multiRemove(secureKeys);
    } catch (error) {
      console.error('Error clearing secure data:', error);
    }
  }
}

// Authentication security
export class AuthSecurity {
  private static readonly LOGIN_ATTEMPTS_KEY = 'login_attempts';
  private static readonly LOCKOUT_UNTIL_KEY = 'lockout_until';

  /**
   * Check if account is locked due to too many failed attempts
   */
  static async isAccountLocked(): Promise<boolean> {
    try {
      const lockoutUntil = await SecureStorage.getItem(this.LOCKOUT_UNTIL_KEY);
      if (!lockoutUntil) return false;

      const now = Date.now();
      if (now < lockoutUntil) {
        return true;
      } else {
        // Lockout period has expired
        await SecureStorage.removeItem(this.LOCKOUT_UNTIL_KEY);
        await SecureStorage.removeItem(this.LOGIN_ATTEMPTS_KEY);
        return false;
      }
    } catch (error) {
      console.error('Error checking account lock status:', error);
      return false;
    }
  }

  /**
   * Record failed login attempt
   */
  static async recordFailedAttempt(): Promise<void> {
    try {
      const attempts = await SecureStorage.getItem(this.LOGIN_ATTEMPTS_KEY) || 0;
      const newAttempts = attempts + 1;

      if (newAttempts >= SECURITY_CONFIG.maxLoginAttempts) {
        // Lock account
        const lockoutUntil = Date.now() + SECURITY_CONFIG.lockoutDuration;
        await SecureStorage.setItem(this.LOCKOUT_UNTIL_KEY, lockoutUntil);
        await SecureStorage.setItem(this.LOGIN_ATTEMPTS_KEY, newAttempts);
      } else {
        await SecureStorage.setItem(this.LOGIN_ATTEMPTS_KEY, newAttempts);
      }
    } catch (error) {
      console.error('Error recording failed attempt:', error);
    }
  }

  /**
   * Reset login attempts on successful login
   */
  static async resetFailedAttempts(): Promise<void> {
    try {
      await SecureStorage.removeItem(this.LOGIN_ATTEMPTS_KEY);
      await SecureStorage.removeItem(this.LOCKOUT_UNTIL_KEY);
    } catch (error) {
      console.error('Error resetting failed attempts:', error);
    }
  }

  /**
   * Get remaining lockout time in minutes
   */
  static async getRemainingLockoutTime(): Promise<number> {
    try {
      const lockoutUntil = await SecureStorage.getItem(this.LOCKOUT_UNTIL_KEY);
      if (!lockoutUntil) return 0;

      const now = Date.now();
      const remaining = lockoutUntil - now;
      return Math.max(0, Math.ceil(remaining / (1000 * 60))); // Convert to minutes
    } catch (error) {
      console.error('Error getting remaining lockout time:', error);
      return 0;
    }
  }
}

// Input validation and sanitization
export class InputSecurity {
  /**
   * Sanitize user input
   */
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[;]/g, '') // Remove semicolons
      .substring(0, 1000); // Limit length
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long');
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('Password must contain at least one lowercase letter');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Password must contain at least one uppercase letter');
    } else {
      score += 1;
    }

    if (!/\d/.test(password)) {
      feedback.push('Password must contain at least one number');
    } else {
      score += 1;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      feedback.push('Password must contain at least one special character');
    } else {
      score += 1;
    }

    return {
      isValid: score >= 4,
      score,
      feedback,
    };
  }

  /**
   * Validate wallet address format
   */
  static isValidWalletAddress(address: string, type: 'BTC' | 'ETH' | 'USDT' = 'USDT'): boolean {
    const patterns = {
      BTC: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
      ETH: /^0x[a-fA-F0-9]{40}$/,
      USDT: /^T[A-Za-z1-9]{33}$/,
    };

    return patterns[type].test(address);
  }
}

// API security
export class APISecurity {
  /**
   * Generate secure API headers
   */
  static generateHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Platform': Platform.OS,
      'X-App-Version': '1.0.0', // Replace with actual app version
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Validate API response
   */
  static validateResponse(response: any): boolean {
    // Add response validation logic here
    return response && typeof response === 'object';
  }
}
