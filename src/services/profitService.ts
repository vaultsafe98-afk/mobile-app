import { store } from '../store';
import { calculateDailyProfit, updateProfit } from '../store/slices/walletSlice';
import { addProfit } from '../store/slices/transactionSlice';
import { addNotification } from '../store/slices/notificationSlice';

class ProfitService {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 60 * 1000; // Check every minute

  start() {
    // Calculate profit immediately
    this.calculateAndUpdateProfit();
    
    // Set up interval to check for profit calculation
    this.intervalId = setInterval(() => {
      this.calculateAndUpdateProfit();
    }, this.CHECK_INTERVAL);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private calculateAndUpdateProfit() {
    const state = store.getState();
    const { balance, profitCalculation } = state.wallet;
    
    // Only calculate if there's a deposit amount
    if (balance.deposit <= 0) return;

    const now = new Date();
    const lastCalculated = new Date(profitCalculation.lastCalculated);
    const daysSinceLastCalculation = Math.floor(
      (now.getTime() - lastCalculated.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate profit for each day since last calculation
    if (daysSinceLastCalculation >= 1) {
      const dailyProfit = balance.deposit * profitCalculation.dailyRate;
      const totalProfit = dailyProfit * daysSinceLastCalculation;

      // Update the store
      store.dispatch(calculateDailyProfit());
      
      // Add profit transaction
      store.dispatch(addProfit({
        type: 'profit',
        amount: totalProfit,
        description: `Daily profit (${daysSinceLastCalculation} day${daysSinceLastCalculation > 1 ? 's' : ''})`,
      }));

      // Add notification
      store.dispatch(addNotification({
        title: '💰 Daily Profit Credited',
        message: `You earned $${totalProfit.toFixed(2)} in profit!`,
        type: 'profit',
      }));
    }
  }

  // Manual profit calculation (for testing)
  calculateProfitForPeriod(depositAmount: number, days: number): number {
    return depositAmount * 0.01 * days; // 1% daily
  }

  // Get next profit calculation time
  getNextProfitTime(): Date {
    const state = store.getState();
    return new Date(state.wallet.profitCalculation.nextCalculation);
  }
}

export const profitService = new ProfitService();
