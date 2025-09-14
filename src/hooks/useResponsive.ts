import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { getResponsiveDimensions } from '../utils/responsive';

export const useResponsive = () => {
  const [dimensions, setDimensions] = useState(getResponsiveDimensions());

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(getResponsiveDimensions());
    });

    return () => subscription?.remove();
  }, []);

  return dimensions;
};

export const useResponsiveStyle = (baseStyle: any, responsiveStyle?: any) => {
  const responsive = useResponsive();
  
  if (!responsiveStyle) {
    return baseStyle;
  }

  // Apply responsive styles based on device type
  let style = { ...baseStyle };

  if (responsive.isSmallDevice && responsiveStyle.small) {
    style = { ...style, ...responsiveStyle.small };
  }

  if (responsive.isTablet && responsiveStyle.tablet) {
    style = { ...style, ...responsiveStyle.tablet };
  }

  if (responsive.isLargeDevice && responsiveStyle.large) {
    style = { ...style, ...responsiveStyle.large };
  }

  return style;
};

export const useResponsiveValue = <T>(values: {
  small?: T;
  medium?: T;
  large?: T;
  tablet?: T;
  default: T;
}) => {
  const responsive = useResponsive();

  if (responsive.isSmallDevice && values.small !== undefined) {
    return values.small;
  }

  if (responsive.isTablet && values.tablet !== undefined) {
    return values.tablet;
  }

  if (responsive.isLargeDevice && values.large !== undefined) {
    return values.large;
  }

  if (values.medium !== undefined) {
    return values.medium;
  }

  return values.default;
};
