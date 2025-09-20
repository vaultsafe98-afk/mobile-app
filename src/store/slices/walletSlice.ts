import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/apiService';

export interface WalletBalance {
  deposit: number;
  total: number;
  lastUpdated: string;
}

interface WalletState {
  balance: WalletBalance;
  isLoading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  balance: {
    deposit: 0,
    total: 0,
    lastUpdated: new Date().toISOString(),
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
      state.balance.total = state.balance.deposit;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetWallet: (state) => {
      state.balance = { deposit: 0, total: 0, lastUpdated: new Date().toISOString() };
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
  setLoading,
  setError,
  resetWallet,
} = walletSlice.actions;

export default walletSlice.reducer;
