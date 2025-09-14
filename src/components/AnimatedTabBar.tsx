import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { theme } from '../theme';
import { AnimationPresets } from '../utils/animations';

const { width } = Dimensions.get('window');

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface AnimatedTabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabPress: (tabId: string) => void;
  style?: any;
}

export default function AnimatedTabBar({
  tabs,
  activeTab,
  onTabPress,
  style,
}: AnimatedTabBarProps) {
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const tabWidth = width / tabs.length;

  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    Animated.timing(indicatorAnim, {
      toValue: activeIndex * tabWidth,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [activeTab, tabs.length]);

  const handleTabPress = (tabId: string) => {
    // Success animation
    AnimationPresets.success().start();
    onTabPress(tabId);
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.indicator,
          {
            width: tabWidth,
            transform: [{ translateX: indicatorAnim }],
          },
        ]}
      />
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, { width: tabWidth }]}
          onPress={() => handleTabPress(tab.id)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.card,
    borderRadius: 12,
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: theme.spacing.xs,
    bottom: theme.spacing.xs,
    backgroundColor: theme.colors.neon.purple,
    borderRadius: 8,
    shadowColor: theme.colors.shadow.secondary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    zIndex: 1,
  },
  tabText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  activeTabText: {
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
