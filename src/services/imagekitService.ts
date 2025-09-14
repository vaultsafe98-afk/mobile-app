import { apiService } from './apiService';

// ImageKit Configuration
const IMAGEKIT_CONFIG = {
  urlEndpoint: 'https://ik.imagekit.io/placeholder', // Will be replaced with real endpoint
  publicKey: 'public_placeholder', // Will be replaced with real public key
};

class ImageKitService {
  private urlEndpoint: string;
  private publicKey: string;

  constructor() {
    this.urlEndpoint = IMAGEKIT_CONFIG.urlEndpoint;
    this.publicKey = IMAGEKIT_CONFIG.publicKey;
  }

  /**
   * Upload image to ImageKit via backend
   * @param imageUri - Local image URI
   * @param fileName - Name for the file
   * @returns Promise with ImageKit URL
   */
  async uploadImage(imageUri: string, fileName: string): Promise<string> {
    try {
      console.log('ImageKit upload:', { imageUri, fileName });
      
      // Convert image to base64
      const base64Image = await this.convertImageToBase64(imageUri);
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: fileName,
      } as any);
      formData.append('fileName', fileName);
      formData.append('folder', 'deposit-proofs');

      // For now, use mock implementation
      // In production, this would call the backend ImageKit upload endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUrl = `https://ik.imagekit.io/mock-id/deposit-proofs/${fileName}`;
      console.log('Mock ImageKit upload successful:', mockUrl);
      
      return mockUrl;
    } catch (error) {
      console.error('Error uploading image to ImageKit:', error);
      throw new Error('Failed to upload image. Please try again.');
    }
  }

  /**
   * Convert image URI to base64
   * @param imageUri - Local image URI
   * @returns Promise with base64 string
   */
  private async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          // Remove data:image/jpeg;base64, prefix
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to process image. Please try again.');
    }
  }

  /**
   * Get optimized image URL with transformations
   * @param originalUrl - Original ImageKit URL
   * @param options - Transformation options
   * @returns Optimized URL
   */
  getOptimizedUrl(originalUrl: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpeg' | 'png';
    crop?: 'maintain_ratio' | 'force' | 'at_max';
  } = {}): string {
    try {
      const {
        width,
        height,
        quality = 80,
        format = 'auto',
        crop = 'maintain_ratio'
      } = options;

      let transformationString = '';
      
      if (width) transformationString += `w-${width}`;
      if (height) transformationString += `,h-${height}`;
      if (quality) transformationString += `,q-${quality}`;
      if (format) transformationString += `,f-${format}`;
      if (crop) transformationString += `,c-${crop}`;

      if (transformationString) {
        const separator = originalUrl.includes('?') ? '&' : '?';
        return `${originalUrl}${separator}tr=${transformationString}`;
      }

      return originalUrl;
    } catch (error) {
      console.error('Error generating optimized URL:', error);
      return originalUrl;
    }
  }

  /**
   * Get thumbnail URL
   * @param originalUrl - Original ImageKit URL
   * @param size - Thumbnail size (default: 200)
   * @returns Thumbnail URL
   */
  getThumbnailUrl(originalUrl: string, size: number = 200): string {
    return this.getOptimizedUrl(originalUrl, {
      width: size,
      height: size,
      quality: 70,
      format: 'auto',
      crop: 'maintain_ratio'
    });
  }

  /**
   * Get mobile-optimized URL
   * @param originalUrl - Original ImageKit URL
   * @param maxWidth - Maximum width (default: 800)
   * @returns Mobile-optimized URL
   */
  getMobileUrl(originalUrl: string, maxWidth: number = 800): string {
    return this.getOptimizedUrl(originalUrl, {
      width: maxWidth,
      quality: 75,
      format: 'auto',
      crop: 'maintain_ratio'
    });
  }

  /**
   * Get authentication parameters for client-side uploads
   * @returns Promise with auth parameters
   */
  async getAuthenticationParameters(): Promise<{
    token: string;
    signature: string;
    expire: number;
    publicKey: string;
  }> {
    try {
      // For now, return mock parameters
      // In production, this would call the backend auth endpoint
      return {
        token: 'mock-token',
        signature: 'mock-signature',
        expire: Date.now() + 3600000, // 1 hour
        publicKey: this.publicKey
      };
    } catch (error) {
      console.error('Error getting authentication parameters:', error);
      throw new Error('Failed to get authentication parameters');
    }
  }

  /**
   * Delete image from ImageKit
   * @param fileId - ImageKit file ID
   * @returns Promise with deletion result
   */
  async deleteImage(fileId: string): Promise<boolean> {
    try {
      // Mock implementation for development
      console.log('Mock ImageKit delete:', fileId);
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (error) {
      console.error('Error deleting image from ImageKit:', error);
      return false;
    }
  }

  /**
   * Generate unique filename for upload
   * @param userId - User ID
   * @param originalName - Original filename
   * @returns Unique filename
   */
  generateFileName(userId: string, originalName: string): string {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop() || 'jpg';
    return `${userId}_${timestamp}.${extension}`;
  }

  /**
   * Get ImageKit URL endpoint
   * @returns URL endpoint
   */
  getUrlEndpoint(): string {
    return this.urlEndpoint;
  }

  /**
   * Get public key
   * @returns Public key
   */
  getPublicKey(): string {
    return this.publicKey;
  }
}

export const imagekitService = new ImageKitService();
