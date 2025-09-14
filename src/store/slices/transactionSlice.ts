import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService, Transaction } from '../../services/apiService';
import { generateObjectId } from '../../utils/objectId';

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'profit';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  description?: string;
  platform?: string;
  walletAddress?: string;
  imageUrl?: string;
  adminNotes?: string;
}

interface TransactionState {
  deposits: Transaction[];
  withdrawals: Transaction[];
  profits: Transaction[];
  allTransactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  } | null;
}

const initialState: TransactionState = {
  deposits: [],
  withdrawals: [],
  profits: [],
  allTransactions: [],
  isLoading: false,
  error: null,
  pagination: null,
};

// Async thunks for API calls
export const fetchAllTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getTransactions(params.page || 1, params.limit || 20);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Failed to fetch transactions');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch transactions');
    }
  }
);

export const fetchDepositTransactions = createAsyncThunk(
  'transactions/fetchDeposits',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getDepositTransactions(params.page || 1, params.limit || 10);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Failed to fetch deposit transactions');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch deposit transactions');
    }
  }
);

export const fetchWithdrawalTransactions = createAsyncThunk(
  'transactions/fetchWithdrawals',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getWithdrawalTransactions(params.page || 1, params.limit || 10);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Failed to fetch withdrawal transactions');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch withdrawal transactions');
    }
  }
);

export const fetchProfitTransactions = createAsyncThunk(
  'transactions/fetchProfits',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getProfitTransactions(params.page || 1, params.limit || 10);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Failed to fetch profit transactions');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch profit transactions');
    }
  }
);

export const submitDepositRequest = createAsyncThunk(
  'transactions/submitDeposit',
  async (data: { amount: number; imageUri: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.submitDepositRequest(data.amount, data.imageUri);
      if (response.success && response.data) {
        return response.data.deposit;
      } else {
        return rejectWithValue(response.error || 'Failed to submit deposit request');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to submit deposit request');
    }
  }
);

export const submitWithdrawalRequest = createAsyncThunk(
  'transactions/submitWithdrawal',
  async (data: { amount: number; platform: string; walletAddress: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.submitWithdrawalRequest(data);
      if (response.success && response.data) {
        return response.data.withdrawal;
      } else {
        return rejectWithValue(response.error || 'Failed to submit withdrawal request');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to submit withdrawal request');
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
          addDeposit: (state, action: PayloadAction<Omit<Transaction, 'id' | 'date' | 'status'>>) => {
            const newDeposit: Transaction = {
              ...action.payload,
              id: generateObjectId(),
              date: new Date().toISOString(),
              status: 'pending',
            };
            state.deposits.unshift(newDeposit);
          },
          addWithdrawal: (state, action: PayloadAction<Omit<Transaction, 'id' | 'date' | 'status'>>) => {
            const newWithdrawal: Transaction = {
              ...action.payload,
              id: generateObjectId(),
              date: new Date().toISOString(),
              status: 'pending',
            };
            state.withdrawals.unshift(newWithdrawal);
          },
          addProfit: (state, action: PayloadAction<Omit<Transaction, 'id' | 'date' | 'status'>>) => {
            const newProfit: Transaction = {
              ...action.payload,
              id: generateObjectId(),
              date: new Date().toISOString(),
              status: 'approved',
            };
            state.profits.unshift(newProfit);
          },
    updateTransactionStatus: (
      state,
      action: PayloadAction<{ id: string; type: 'deposit' | 'withdrawal'; status: 'approved' | 'rejected' }>
    ) => {
      const { id, type, status } = action.payload;
      const transactions = type === 'deposit' ? state.deposits : state.withdrawals;
      const transaction = transactions.find(t => t.id === id);
      if (transaction) {
        transaction.status = status;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearTransactions: (state) => {
      state.deposits = [];
      state.withdrawals = [];
      state.profits = [];
      state.allTransactions = [];
      state.isLoading = false;
      state.error = null;
      state.pagination = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all transactions
    builder
      .addCase(fetchAllTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allTransactions = action.payload.transactions;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchAllTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch deposit transactions
    builder
      .addCase(fetchDepositTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDepositTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.deposits = action.payload.deposits;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchDepositTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch withdrawal transactions
    builder
      .addCase(fetchWithdrawalTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWithdrawalTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.withdrawals = action.payload.withdrawals;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchWithdrawalTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch profit transactions
    builder
      .addCase(fetchProfitTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfitTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profits = action.payload.profits;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchProfitTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Submit deposit request
    builder
      .addCase(submitDepositRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitDepositRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        const newDeposit: Transaction = {
          id: action.payload.id,
          type: 'deposit',
          amount: action.payload.amount,
          status: action.payload.status as 'pending' | 'approved' | 'rejected',
          date: action.payload.createdAt,
          description: 'Deposit Request',
          imageUrl: action.payload.screenshotUrl,
        };
        state.deposits.unshift(newDeposit);
        state.error = null;
      })
      .addCase(submitDepositRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Submit withdrawal request
    builder
      .addCase(submitWithdrawalRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitWithdrawalRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        const newWithdrawal: Transaction = {
          id: action.payload.id,
          type: 'withdrawal',
          amount: action.payload.amount,
          status: action.payload.status as 'pending' | 'approved' | 'rejected',
          date: action.payload.createdAt,
          description: `Withdrawal to ${action.payload.platform}`,
          platform: action.payload.platform,
          walletAddress: action.payload.walletAddress,
        };
        state.withdrawals.unshift(newWithdrawal);
        state.error = null;
      })
      .addCase(submitWithdrawalRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  addDeposit,
  addWithdrawal,
  addProfit,
  updateTransactionStatus,
  setLoading,
  setError,
  clearTransactions,
} = transactionSlice.actions;

export default transactionSlice.reducer;
