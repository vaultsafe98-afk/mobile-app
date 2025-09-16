// Mock data for authentic crypto wallet experience

export interface CryptoCurrency {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  balance: number;
  value: number;
  icon: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'profit' | 'trade';
  crypto: string;
  amount: number;
  value: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  hash?: string;
  from?: string;
  to?: string;
}

// Popular cryptocurrencies with realistic data
export const mockCryptocurrencies: CryptoCurrency[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 43250.75,
    change24h: 2.34,
    balance: 0.00847,
    value: 366.21,
    icon: '₿',
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    price: 2645.82,
    change24h: -1.56,
    balance: 0.2156,
    value: 570.21,
    icon: 'Ξ',
  },
  {
    id: 'tether',
    symbol: 'USDT',
    name: 'Tether',
    price: 1.00,
    change24h: 0.02,
    balance: 1250.00,
    value: 1250.00,
    icon: '₮',
  },
  {
    id: 'binancecoin',
    symbol: 'BNB',
    name: 'BNB',
    price: 315.67,
    change24h: 3.21,
    balance: 1.456,
    value: 459.61,
    icon: '🟡',
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    price: 98.45,
    change24h: 5.67,
    balance: 3.24,
    value: 318.98,
    icon: '◎',
  },
  {
    id: 'cardano',
    symbol: 'ADA',
    name: 'Cardano',
    price: 0.4567,
    change24h: -2.34,
    balance: 542.78,
    value: 247.84,
    icon: '₳',
  },
  {
    id: 'polygon',
    symbol: 'MATIC',
    name: 'Polygon',
    price: 0.8234,
    change24h: 1.89,
    balance: 156.45,
    value: 128.84,
    icon: '🔷',
  },
];

// Generate random transaction hash
const generateTxHash = (): string => {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

// Generate random wallet address
const generateAddress = (): string => {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
};

// Generate mock transactions
export const generateMockTransactions = (count: number = 20): Transaction[] => {
  const transactions: Transaction[] = [];
  const types: Transaction['type'][] = ['deposit', 'withdrawal', 'profit', 'trade'];
  const statuses: Transaction['status'][] = ['completed', 'completed', 'completed', 'pending', 'failed'];
  
  for (let i = 0; i < count; i++) {
    const crypto = mockCryptocurrencies[Math.floor(Math.random() * mockCryptocurrencies.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const amount = parseFloat((Math.random() * 10).toFixed(6));
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));

    transactions.push({
      id: `tx_${Date.now()}_${i}`,
      type,
      crypto: crypto.symbol,
      amount,
      value: amount * crypto.price,
      status,
      date: date.toISOString(),
      hash: generateTxHash(),
      from: type === 'deposit' ? generateAddress() : undefined,
      to: type === 'withdrawal' ? generateAddress() : undefined,
    });
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Mock profit data
export const mockProfitHistory = [
  { date: '2024-01-15', amount: 12.45, crypto: 'USDT' },
  { date: '2024-01-14', amount: 8.92, crypto: 'USDT' },
  { date: '2024-01-13', amount: 15.67, crypto: 'USDT' },
  { date: '2024-01-12', amount: 11.23, crypto: 'USDT' },
  { date: '2024-01-11', amount: 9.88, crypto: 'USDT' },
  { date: '2024-01-10', amount: 14.56, crypto: 'USDT' },
  { date: '2024-01-09', amount: 13.21, crypto: 'USDT' },
];

// Popular crypto exchanges/platforms
export const mockExchanges = [
  'Binance',
  'Coinbase',
  'Kraken',
  'KuCoin',
  'Gate.io',
  'Bybit',
  'OKX',
  'Huobi',
];

// Mock wallet addresses for different networks
export const mockWalletAddresses = {
  ethereum: '0x742d35Cc6634C0532925a3b8D7389C7fC65C2b3D',
  bitcoin: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  binance: 'bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2',
  solana: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
  polygon: '0x8ba1f109551bD432803012645Hac136c22C501eD',
};

// Calculate total portfolio value
export const calculateTotalValue = (): number => {
  return mockCryptocurrencies.reduce((total, crypto) => total + crypto.value, 0);
};

// Get portfolio change percentage
export const getPortfolioChange = (): number => {
  const totalValue = calculateTotalValue();
  const totalChange = mockCryptocurrencies.reduce((total, crypto) => {
    const changeValue = (crypto.value * crypto.change24h) / 100;
    return total + changeValue;
  }, 0);
  
  return (totalChange / totalValue) * 100;
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format crypto amount
export const formatCrypto = (amount: number, symbol: string): string => {
  return `${amount.toFixed(6)} ${symbol}`;
};

// Format percentage
export const formatPercentage = (percentage: number): string => {
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(2)}%`;
};
