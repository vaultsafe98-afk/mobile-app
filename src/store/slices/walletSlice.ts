import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/apiService';

export interface WalletBalance {
  deposit: number;
  profit: number;
  total: number;
  lastUpdated: string;
}

export interface ProfitCalculation {
  dailyRate: number; // 1% = 0.01
  lastCalculated: string;
  nextCalculation: string;
}

interface WalletState {
  balance: WalletBalance;
  profitCalculation: ProfitCalculation;
  isLoading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  balance: {
    deposit: 0,
    profit: 0,
    total: 0,
    lastUpdated: new Date().toISOString(),
  },
  profitCalculation: {
    dailyRate: 0.01, // 1% daily
    lastCalculated: new Date().toISOString(),
    nextCalculation: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  isLoading: false,
  error: null,
};

// Async thunks for API calls
export const fetchWalletBalance = createAsyncThunk(
  'wallet/fetchBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getWalletBalance();
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Failed to fetch wallet balance');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch wallet balance');
    }
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setBalance: (state, action: PayloadAction<WalletBalance>) => {
      state.balance = action.payload;
    },
    updateDeposit: (state, action: PayloadAction<number>) => {
      state.balance.deposit += action.payload;
      state.balance.total = state.balance.deposit + state.balance.profit;
    },
    updateProfit: (state, action: PayloadAction<number>) => {
      state.balance.profit += action.payload;
      state.balance.total = state.balance.deposit + state.balance.profit;
    },
    calculateDailyProfit: (state) => {
      const now = new Date();
      const lastCalculated = new Date(state.profitCalculation.lastCalculated);
      const daysSinceLastCalculation = Math.floor(
        (now.getTime() - lastCalculated.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastCalculation >= 1) {
        const dailyProfit = state.balance.deposit * state.profitCalculation.dailyRate;
        state.balance.profit += dailyProfit;
        state.balance.total = state.balance.deposit + state.balance.profit;
        state.profitCalculation.lastCalculated = now.toISOString();
        state.profitCalculation.nextCalculation = new Date(
          now.getTime() + 24 * 60 * 60 * 1000
        ).toISOString();
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetWallet: (state) => {
      state.balance = { deposit: 0, profit: 0, total: 0, lastUpdated: new Date().toISOString() };
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch wallet balance
    builder
      .addCase(fetchWalletBalance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle the response format from backend
        const response = action.payload as any;
        state.balance = {
          deposit: response.balance?.deposit || 0,
          profit: response.balance?.profit || 0,
          total: response.balance?.total || 0,
          lastUpdated: response.lastUpdated || new Date().toISOString(),
        };
        state.error = null;
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setBalance,
  updateDeposit,
  updateProfit,
  calculateDailyProfit,
  setLoading,
  setError,
  resetWallet,
} = walletSlice.actions;

export default walletSlice.reducer;
