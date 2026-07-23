import { useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { recurringService } from '../services/db/RecurringService';
import { expenseService } from '../services/db/ExpenseService';
import { showToast } from '../utils/toast';

const LAST_RUN_KEY = 'recurring_auto_gen_last_run';

const useRecurringAutoGen = (userId: string | undefined) => {
  const ranRef = useRef(false);

  const run = useCallback(async () => {
    if (!userId || ranRef.current) return;

    // Check if already ran today
    const today = new Date().toISOString().split('T')[0];
    const lastRun = await AsyncStorage.getItem(LAST_RUN_KEY);
    if (lastRun === today) return;

    ranRef.current = true;

    try {
      const duePayments = await recurringService.getDue(userId);
      if (duePayments.length === 0) {
        await AsyncStorage.setItem(LAST_RUN_KEY, today);
        return;
      }

      let count = 0;
      for (const payment of duePayments) {
        // Create expense from recurring payment
        await expenseService.create({
          user_id: userId,
          title: payment.name,
          amount: payment.amount,
          category: payment.category,
          date: today,
        });

        // Update next due date
        const nextDate = recurringService.calculateNextDate(payment.next_date, payment.frequency);
        await recurringService.update(payment.id, { next_date: nextDate });

        count++;
      }

      await AsyncStorage.setItem(LAST_RUN_KEY, today);

      if (count > 0) {
        showToast(`Auto-created ${count} recurring expense${count > 1 ? 's' : ''}`, 'success');
      }
    } catch {
      // Silent fail — will retry on next app open
      ranRef.current = false;
    }
  }, [userId]);

  useEffect(() => {
    run();
  }, [run]);
};

export default useRecurringAutoGen;
