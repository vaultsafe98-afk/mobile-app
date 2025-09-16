import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  Share,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { theme } from '../theme';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchWalletBalance } from '../store/slices/walletSlice';
import { fetchAllTransactions } from '../store/slices/transactionSlice';
import { useFocusRefresh } from '../hooks/useFocusRefresh';

export default function WalletScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const dispatch = useAppDispatch();
  const { balance, isLoading: walletLoading, error: walletError } = useAppSelector(state => state.wallet);
  const { allTransactions, isLoading: transactionLoading, error: transactionError } = useAppSelector(state => state.transactions);
  const [activeTab, setActiveTab] = useState('deposits');
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(0);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [dispatch]);

  // Load data function
  const loadData = async () => {
    dispatch(fetchWalletBalance());
    dispatch(fetchAllTransactions({ page: 1, limit: 50 }));
    setLastRefresh(Date.now());
  };

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Refresh data when screen comes into focus (disabled temporarily to fix rate limiting)
  // useFocusRefresh({
  //   onFocus: () => {
  //     // Only refresh if data is stale (older than 30 seconds)
  //     const now = Date.now();
  //     if (lastRefresh === 0 || (now - lastRefresh) > 30000) {
  //       loadData();
  //     }
  //   },
  //   refreshOnFocus: true,
  // });

  // Filter transactions by type
  const transactions = {
    deposits: allTransactions.filter(t => t.type === 'deposit'),
    withdrawals: allTransactions.filter(t => t.type === 'withdrawal'),
  };

  const tabs = [
    { id: 'deposits', label: 'Deposits' },
    { id: 'withdrawals', label: 'Withdrawals' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return theme.colors.status.success;
      case 'pending':
        return theme.colors.status.warning;
      case 'rejected':
        return theme.colors.status.error;
      default:
        return theme.colors.text.secondary;
    }
  };

  const renderTransactionItem = ({ item }: any) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
        <Text style={styles.transactionAmount}>
          ${(item.amount || 0).toFixed(2)}
        </Text>
      </View>
      {item.status && (
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📊</Text>
      <Text style={styles.emptyStateText}>No transactions found</Text>
      <Text style={styles.emptyStateSubtext}>
        Your {activeTab} will appear here
      </Text>
    </View>
  );


  const handleViewAnalytics = () => {
    Alert.alert(
      'Analytics',
      'Analytics feature coming soon! This will show detailed charts and insights about your trading performance.',
      [{ text: 'OK' }]
    );
  };

  const handleExportReport = async () => {
    try {
      // Generate report data
      const reportData = generateReportData();
      
      // Share the report
      await Share.share({
        message: reportData,
        title: 'SafeVault Transaction Report',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export report. Please try again.');
    }
  };


  const generateReportData = () => {
    const currentDate = new Date().toLocaleDateString();
    const totalDeposits = allTransactions
      .filter(t => t.type === 'deposit' && t.status === 'approved')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const totalWithdrawals = allTransactions
      .filter(t => t.type === 'withdrawal' && t.status === 'approved')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const totalProfits = allTransactions
      .filter(t => t.type === 'profit')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return `SafeVault Transaction Report
Generated: ${currentDate}

WALLET BALANCE:
- Deposit Amount: $${(balance.deposit || 0).toFixed(2)}
- Profit Amount: $${(balance.profit || 0).toFixed(2)}
- Total Balance: $${(balance.total || 0).toFixed(2)}

TRANSACTION SUMMARY:
- Total Deposits: $${totalDeposits.toFixed(2)}
- Total Withdrawals: $${totalWithdrawals.toFixed(2)}
- Total Profits: $${totalProfits.toFixed(2)}

RECENT TRANSACTIONS:
${allTransactions.slice(0, 10).map(t => 
  `- ${t.type.toUpperCase()}: $${(t.amount || 0).toFixed(2)} (${t.status}) - ${t.date}`
).join('\n')}

---
Generated by SafeVault Mobile App`;
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.neon.green}
          colors={[theme.colors.neon.green]}
        />
      }
    >
      <View style={styles.content}>
        {/* Balance Cards */}
        <View style={styles.balanceSection}>
          <Text style={styles.sectionTitle}>SafeVault Balance</Text>
          
          {walletLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading balance...</Text>
            </View>
          ) : walletError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {walletError}</Text>
            </View>
          ) : (
            <>
              <View style={styles.balanceCards}>
                <View style={styles.balanceCard}>
                  <Text style={styles.balanceLabel}>Deposit Amount</Text>
                  <Text style={styles.balanceValue}>${(balance.deposit || 0).toFixed(2)}</Text>
                </View>
                
                <View style={styles.balanceCard}>
                  <Text style={styles.balanceLabel}>Profit Amount</Text>
                  <Text style={[styles.balanceValue, styles.profitValue]}>
                    +${(balance.profit || 0).toFixed(2)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.totalBalanceCard}>
                <Text style={styles.totalBalanceLabel}>Total Balance</Text>
                <Text style={styles.totalBalanceValue}>${(balance.total || 0).toFixed(2)}</Text>
              </View>
            </>
          )}
        </View>

        {/* Transaction History */}
        <View style={styles.transactionSection}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          
          {/* Tabs */}
          <View style={styles.tabContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  activeTab === tab.id && styles.activeTab,
                ]}
                onPress={() => setActiveTab(tab.id)}
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

          {/* Content based on active tab */}
          <View style={styles.transactionList}>
            <FlatList
              data={transactions[activeTab as keyof typeof transactions]}
              renderItem={renderTransactionItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={renderEmptyState}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleViewAnalytics}>
            <Text style={styles.actionIcon}>📈</Text>
            <Text style={styles.actionText}>View Analytics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleExportReport}>
            <Text style={styles.actionIcon}>📄</Text>
            <Text style={styles.actionText}>Export Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  balanceSection: {
    marginBottom: theme.spacing['3xl'],
  },
  balanceCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: theme.colors.background.card,
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  balanceLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  balanceValue: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  profitValue: {
    color: theme.colors.neon.green,
  },
  totalBalanceCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 16,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.neon.green,
  },
  totalBalanceLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  totalBalanceValue: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neon.green,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing['2xl'],
  },
  loadingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  transactionSection: {
    marginBottom: theme.spacing['3xl'],
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.card,
    borderRadius: 12,
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: theme.colors.neon.purple,
  },
  tabText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  activeTabText: {
    color: theme.colors.text.primary,
  },
  transactionList: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 16,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  transactionAmount: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 6,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing['3xl'],
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.lg,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 12,
    padding: theme.spacing.lg,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.sm,
  },
  actionText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    color: '#ff6b6b',
    textAlign: 'center',
  },
});
