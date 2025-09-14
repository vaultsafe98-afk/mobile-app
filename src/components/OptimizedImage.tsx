import React, { useState, useCallback } from 'react';
import {
  Image,
  View,
  StyleSheet,
  ActivityIndicator,
  ImageProps,
} from 'react-native';
import { ImageOptimizer } from '../utils/performance';

interface OptimizedImageProps extends ImageProps {
  source: { uri: string };
  fallbackSource?: any;
  showLoader?: boolean;
  maxWidth?: number;
  maxHeight?: number;
}

export default function OptimizedImage({
  source,
  fallbackSource,
  showLoader = true,
  maxWidth = 800,
  maxHeight = 600,
  style,
  ...props
}: OptimizedImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  const getOptimizedDimensions = useCallback(() => {
    if (style && typeof style === 'object' && 'width' in style && 'height' in style) {
      return ImageOptimizer.getOptimizedDimensions(
        style.width as number,
        style.height as number,
        maxWidth,
        maxHeight
      );
    }
    return { width: maxWidth, height: maxHeight };
  }, [style, maxWidth, maxHeight]);

  const optimizedDimensions = getOptimizedDimensions();

  return (
    <View style={[styles.container, style]}>
      {loading && showLoader && (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color="#00ff88" />
        </View>
      )}
      
      <Image
        {...props}
        source={error && fallbackSource ? fallbackSource : source}
        style={[
          styles.image,
          {
            width: optimizedDimensions.width,
            height: optimizedDimensions.height,
          },
        ]}
        onLoad={handleLoad}
        onError={handleError}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    borderRadius: 8,
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});
