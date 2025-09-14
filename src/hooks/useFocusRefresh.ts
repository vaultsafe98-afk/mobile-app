import { useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

interface UseFocusRefreshOptions {
  onFocus?: () => void;
  onBlur?: () => void;
  refreshOnFocus?: boolean;
}

export const useFocusRefresh = (options: UseFocusRefreshOptions = {}) => {
  const { onFocus, onBlur, refreshOnFocus = true } = options;

  useFocusEffect(
    useCallback(() => {
      if (refreshOnFocus && onFocus) {
        onFocus();
      }
      
      return () => {
        if (onBlur) {
          onBlur();
        }
      };
    }, [onFocus, onBlur, refreshOnFocus])
  );
};

export default useFocusRefresh;
