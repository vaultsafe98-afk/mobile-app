import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 12 Pro)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

// Device type detection
export const isTablet = () => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH * pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT * pixelDensity;
  
  return (
    (adjustedWidth >= 1000 && adjustedHeight >= 1000) ||
    (adjustedWidth >= 1000 || adjustedHeight >= 1000)
  );
};

export const isSmallDevice = () => {
  return SCREEN_WIDTH < 375;
};

export const isLargeDevice = () => {
  return SCREEN_WIDTH > 414;
};

// Responsive scaling functions
export const scaleWidth = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

export const scaleHeight = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

export const scaleSize = (size: number): number => {
  const scale = Math.min(SCREEN_WIDTH / BASE_WIDTH, SCREEN_HEIGHT / BASE_HEIGHT);
  return Math.ceil(PixelRatio.roundToNearestPixel(size * scale));
};

export const scaleFont = (size: number): number => {
  const scale = Math.min(SCREEN_WIDTH / BASE_WIDTH, SCREEN_HEIGHT / BASE_HEIGHT);
  const newSize = size * scale;
  
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};

// Responsive breakpoints
export const breakpoints = {
  small: 375,
  medium: 414,
  large: 768,
  xlarge: 1024,
};

// Media query helpers
export const isSmallScreen = () => SCREEN_WIDTH < breakpoints.small;
export const isMediumScreen = () => SCREEN_WIDTH >= breakpoints.small && SCREEN_WIDTH < breakpoints.medium;
export const isLargeScreen = () => SCREEN_WIDTH >= breakpoints.medium && SCREEN_WIDTH < breakpoints.large;
export const isXLargeScreen = () => SCREEN_WIDTH >= breakpoints.large;

// Responsive spacing
export const getResponsiveSpacing = (baseSpacing: number) => {
  if (isSmallDevice()) {
    return baseSpacing * 0.8;
  } else if (isTablet()) {
    return baseSpacing * 1.5;
  } else if (isLargeDevice()) {
    return baseSpacing * 1.2;
  }
  return baseSpacing;
};

// Responsive font sizes
export const getResponsiveFontSize = (baseSize: number) => {
  if (isSmallDevice()) {
    return scaleFont(baseSize * 0.9);
  } else if (isTablet()) {
    return scaleFont(baseSize * 1.3);
  } else if (isLargeDevice()) {
    return scaleFont(baseSize * 1.1);
  }
  return scaleFont(baseSize);
};

// Responsive dimensions
export const getResponsiveDimensions = () => {
  const isTabletDevice = isTablet();
  const isSmallDeviceScreen = isSmallDevice();
  
  return {
    screenWidth: SCREEN_WIDTH,
    screenHeight: SCREEN_HEIGHT,
    isTablet: isTabletDevice,
    isSmallDevice: isSmallDeviceScreen,
    isLargeDevice: isLargeDevice(),
    scaleWidth,
    scaleHeight,
    scaleSize,
    scaleFont,
    getResponsiveSpacing,
    getResponsiveFontSize,
  };
};

// Grid system for responsive layouts
export const getGridColumns = () => {
  if (isTablet()) {
    return 3;
  } else if (isLargeDevice()) {
    return 2;
  }
  return 1;
};

export const getGridSpacing = () => {
  if (isTablet()) {
    return 24;
  } else if (isLargeDevice()) {
    return 16;
  }
  return 12;
};

// Responsive image dimensions
export const getResponsiveImageSize = (baseWidth: number, baseHeight: number) => {
  const aspectRatio = baseHeight / baseWidth;
  const responsiveWidth = scaleWidth(baseWidth);
  const responsiveHeight = responsiveWidth * aspectRatio;
  
  return {
    width: responsiveWidth,
    height: responsiveHeight,
  };
};

// Safe area helpers
export const getSafeAreaInsets = () => {
  const isIPhoneX = Platform.OS === 'ios' && (SCREEN_HEIGHT >= 812 || SCREEN_WIDTH >= 812);
  
  return {
    top: isIPhoneX ? 44 : 20,
    bottom: isIPhoneX ? 34 : 0,
    left: 0,
    right: 0,
  };
};

// Responsive component props
export const getResponsiveProps = (props: any) => {
  const dimensions = getResponsiveDimensions();
  
  return {
    ...props,
    ...dimensions,
    // Add any additional responsive props here
  };
};
