import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { theme } from '../theme';
import SafeVaultLogo from '../components/SafeVaultLogo';

const { width } = Dimensions.get('window');

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  delay?: number;
}

interface FeatureProps {
  icon: string;
  title: string;
  description: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, delay = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim, delay]);

  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </Animated.View>
  );
};

const FeatureCard: React.FC<FeatureProps> = ({ icon, title, description, delay = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim, delay]);

  return (
    <Animated.View
      style={[
        styles.featureCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.featureIcon}>
        <Text style={styles.featureIconText}>{icon}</Text>
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </Animated.View>
  );
};

export default function AboutScreen() {
  const [animationStarted, setAnimationStarted] = useState(false);
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    // Start header animation immediately
    Animated.parallel([
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(headerSlideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setAnimationStarted(true);
    });
  }, [headerFadeAnim, headerSlideAnim]);

  const securityStats = [
    {
      title: 'Wallets Checked',
      value: '100K+',
      subtitle: 'Daily Security Scans',
      icon: '🛡️',
    },
    {
      title: 'Accuracy Rate',
      value: '99.9%',
      subtitle: 'Threat Detection',
      icon: '🎯',
    },
    {
      title: 'Checking Time',
      value: '<3s',
      subtitle: 'Lightning Fast',
      icon: '⚡',
    },
    {
      title: 'Protection',
      value: '24/7',
      subtitle: 'Always Monitoring',
      icon: '🔒',
    },
    {
      title: 'Uptime',
      value: '99.99%',
      subtitle: 'System Reliability',
      icon: '📊',
    },
    {
      title: 'Security Audits',
      value: '50+',
      subtitle: 'Professional Reviews',
      icon: '🔍',
    },
  ];

  const features = [
    {
      icon: '🔗',
      title: 'Blockchain Analysis',
      description: 'Advanced blockchain scanning for complete security check and transaction verification.',
    },
    {
      icon: '🚨',
      title: 'Real-time Detection',
      description: 'Threat detection updated live with blockchain networks for instant security alerts.',
    },
    {
      icon: '🛡️',
      title: 'Multi-Layer Security',
      description: 'Enterprise-grade security with multiple layers of protection for your crypto assets.',
    },
    {
      icon: '🔐',
      title: 'Private Key Protection',
      description: 'Your private keys never leave your device. Complete control over your crypto assets.',
    },
    {
      icon: '💎',
      title: 'Multi-Currency Support',
      description: 'Support for Bitcoin, Ethereum, USDT, BNB, Solana, Cardano, Polygon and more.',
    },
    {
      icon: '📱',
      title: 'Mobile First Design',
      description: 'Optimized for mobile devices with intuitive interface and smooth user experience.',
    },
    {
      icon: '🌐',
      title: 'Global Network',
      description: 'Connected to major blockchain networks worldwide for comprehensive coverage.',
    },
    {
      icon: '📈',
      title: 'Real-time Analytics',
      description: 'Live portfolio tracking with real-time price updates and performance analytics.',
    },
  ];

  const trustStats = [
    { label: 'Satisfied Users', value: '500K+' },
    { label: 'Countries Supported', value: '150+' },
    { label: 'Transactions Secured', value: '$2.5B+' },
    { label: 'Years of Experience', value: '5+' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background.primary} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerFadeAnim,
              transform: [{ translateY: headerSlideAnim }],
            },
          ]}
        >
          <SafeVaultLogo size="large" showText={true} />
          <Text style={styles.headerTitle}>Secure. Fast. Reliable.</Text>
          <Text style={styles.headerSubtitle}>
            The most trusted cryptocurrency wallet with enterprise-grade security
          </Text>
        </Animated.View>

        {/* Security Statistics Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Excellence</Text>
          <View style={styles.statsGrid}>
            {securityStats.map((stat, index) => (
              <StatCard
                key={index}
                {...stat}
                delay={animationStarted ? index * 100 : 0}
              />
            ))}
          </View>
        </View>

        {/* Trust Indicators */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trusted Worldwide</Text>
          <View style={styles.trustGrid}>
            {trustStats.map((stat, index) => (
              <View key={index} style={styles.trustCard}>
                <Text style={styles.trustValue}>{stat.value}</Text>
                <Text style={styles.trustLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose SafeVault?</Text>
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                {...feature}
                delay={animationStarted ? index * 80 : 0}
              />
            ))}
          </View>
        </View>

        {/* Security Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Certifications</Text>
          <View style={styles.badgesContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeIcon}>🏆</Text>
              <Text style={styles.badgeText}>SOC 2 Certified</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeIcon}>🔐</Text>
              <Text style={styles.badgeText}>ISO 27001</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeIcon}>✅</Text>
              <Text style={styles.badgeText}>Audited by CertiK</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeIcon}>🛡️</Text>
              <Text style={styles.badgeText}>Bug Bounty Program</Text>
            </View>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Need Help?</Text>
            <Text style={styles.contactDescription}>
              Our 24/7 support team is here to help you with any questions.
            </Text>
            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 SafeVault. All rights reserved.</Text>
          <Text style={styles.footerSubtext}>
            Making cryptocurrency safe and accessible for everyone
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing['3xl'],
    paddingHorizontal: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing['3xl'],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize['xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - theme.spacing.lg * 2 - theme.spacing.md) / 2,
    backgroundColor: theme.colors.background.card,
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neon.green,
    marginBottom: theme.spacing.xs,
  },
  statTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  statSubtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  trustGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  trustCard: {
    width: (width - theme.spacing.lg * 2 - theme.spacing.md) / 2,
    backgroundColor: theme.colors.background.card,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.neon.purple,
  },
  trustValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neon.purple,
    marginBottom: theme.spacing.xs,
  },
  trustLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  featuresContainer: {
    gap: theme.spacing.md,
  },
  featureCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 12,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.neon.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  featureIconText: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  featureDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badge: {
    width: (width - theme.spacing.lg * 2 - theme.spacing.md) / 2,
    backgroundColor: theme.colors.background.card,
    borderRadius: 12,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.neon.blue,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.xs,
  },
  badgeText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  contactSection: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 16,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  contactTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  contactDescription: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  contactButton: {
    backgroundColor: theme.colors.button.primary,
    borderRadius: 12,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },
  contactButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.background.primary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  footerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  footerSubtext: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
});