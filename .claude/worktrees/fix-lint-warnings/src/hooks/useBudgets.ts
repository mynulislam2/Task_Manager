import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Budget } from '../types';
import { budgetService } from '../services/db/BudgetService';

export const useBudgets = (userId: string) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      budgetService.getAll(userId).then(data => {
        setBudgets(data);
        setLoading(false);
      });
    }, [userId]),
  );

  return { budgets, loading };
};
