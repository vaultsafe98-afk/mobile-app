import { InteractionManager, Platform } from 'react-native';

// Performance monitoring utilities
export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();

  /**
   * Start performance timer
   */
  static startTimer(label: string): void {
    this.timers.set(label, Date.now());
  }

  /**
   * End performance timer and log result
   */
  static endTimer(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      console.warn(`Timer ${label} was not started`);
      return 0;
    }

    const duration = Date.now() - startTime;
    console.log(`⏱️ ${label}: ${duration}ms`);
    this.timers.delete(label);
    return duration;
  }

  /**
   * Measure function execution time
   */
  static async measureAsync<T>(
    label: string,
    fn: () => Promise<T>
  ): Promise<T> {
    this.startTimer(label);
    try {
      const result = await fn();
      this.endTimer(label);
      return result;
    } catch (error) {
      this.endTimer(label);
      throw error;
    }
  }

  /**
   * Measure synchronous function execution time
   */
  static measure<T>(label: string, fn: () => T): T {
    this.startTimer(label);
    try {
      const result = fn();
      this.endTimer(label);
      return result;
    } catch (error) {
      this.endTimer(label);
      throw error;
    }
  }
}

// Memory management utilities
export class MemoryManager {
  private static cache: Map<string, any> = new Map();
  private static maxCacheSize = 50;

  /**
   * Set cache item with size limit
   */
  static setCache(key: string, value: any): void {
    if (this.cache.size >= this.maxCacheSize) {
      // Remove oldest item
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  /**
   * Get cache item
   */
  static getCache(key: string): any {
    return this.cache.get(key);
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  static getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Force garbage collection (Android only)
   */
  static forceGC(): void {
    if (Platform.OS === 'android') {
      // @ts-ignore
      if (global.gc) {
        // @ts-ignore
        global.gc();
      }
    }
  }
}

// Image optimization utilities
export class ImageOptimizer {
  /**
   * Get optimized image dimensions
   */
  static getOptimizedDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number = 800,
    maxHeight: number = 600
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;

    let width = originalWidth;
    let height = originalHeight;

    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return {
      width: Math.round(width),
      height: Math.round(height),
    };
  }

  /**
   * Get image quality based on size
   */
  static getImageQuality(fileSize: number): number {
    if (fileSize < 100 * 1024) return 0.9; // < 100KB
    if (fileSize < 500 * 1024) return 0.8; // < 500KB
    if (fileSize < 1024 * 1024) return 0.7; // < 1MB
    return 0.6; // >= 1MB
  }
}

// Bundle optimization utilities
export class BundleOptimizer {
  /**
   * Lazy load component
   */
  static lazyLoad<T extends React.ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>
  ): React.LazyExoticComponent<T> {
    return React.lazy(importFunc);
  }

  /**
   * Preload component
   */
  static async preloadComponent<T extends React.ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>
  ): Promise<T> {
    const module = await importFunc();
    return module.default;
  }
}

// Interaction optimization
export class InteractionOptimizer {
  /**
   * Run after interactions complete
   */
  static runAfterInteractions(callback: () => void): void {
    InteractionManager.runAfterInteractions(callback);
  }

  /**
   * Run after interactions with timeout
   */
  static runAfterInteractionsWithTimeout(
    callback: () => void,
    timeout: number = 5000
  ): void {
    const timeoutId = setTimeout(callback, timeout);
    
    InteractionManager.runAfterInteractions(() => {
      clearTimeout(timeoutId);
      callback();
    });
  }

  /**
   * Batch state updates
   */
  static batchUpdates(updates: (() => void)[]): void {
    // React 18+ automatically batches updates
    updates.forEach(update => update());
  }
}

// Network optimization
export class NetworkOptimizer {
  private static requestCache: Map<string, { data: any; timestamp: number }> = new Map();
  private static cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Cache network request
   */
  static cacheRequest(url: string, data: any): void {
    this.requestCache.set(url, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Get cached request
   */
  static getCachedRequest(url: string): any | null {
    const cached = this.requestCache.get(url);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.cacheTimeout;
    if (isExpired) {
      this.requestCache.delete(url);
      return null;
    }

    return cached.data;
  }

  /**
   * Clear expired cache
   */
  static clearExpiredCache(): void {
    const now = Date.now();
    for (const [url, cached] of this.requestCache.entries()) {
      if (now - cached.timestamp > this.cacheTimeout) {
        this.requestCache.delete(url);
      }
    }
  }
}

// Performance hooks
export const usePerformance = () => {
  const startTimer = (label: string) => PerformanceMonitor.startTimer(label);
  const endTimer = (label: string) => PerformanceMonitor.endTimer(label);
  const measureAsync = PerformanceMonitor.measureAsync;
  const measure = PerformanceMonitor.measure;

  return {
    startTimer,
    endTimer,
    measureAsync,
    measure,
  };
};

// Performance constants
export const PERFORMANCE_CONFIG = {
  // Image optimization
  MAX_IMAGE_WIDTH: 800,
  MAX_IMAGE_HEIGHT: 600,
  IMAGE_QUALITY: 0.8,

  // Cache settings
  MAX_CACHE_SIZE: 50,
  CACHE_TIMEOUT: 5 * 60 * 1000, // 5 minutes

  // Bundle optimization
  LAZY_LOAD_THRESHOLD: 1000, // ms

  // Memory management
  GC_INTERVAL: 30 * 1000, // 30 seconds
  MEMORY_WARNING_THRESHOLD: 100 * 1024 * 1024, // 100MB
};

// Performance monitoring setup
export const setupPerformanceMonitoring = () => {
  // Monitor memory usage
  setInterval(() => {
    MemoryManager.forceGC();
    NetworkOptimizer.clearExpiredCache();
  }, PERFORMANCE_CONFIG.GC_INTERVAL);

  // Log performance metrics
  if (__DEV__) {
    console.log('🚀 Performance monitoring enabled');
    console.log(`📱 Platform: ${Platform.OS}`);
    console.log(`⚡ Cache size: ${MemoryManager.getCacheSize()}`);
  }
};
