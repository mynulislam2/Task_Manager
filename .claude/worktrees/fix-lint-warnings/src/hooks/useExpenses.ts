import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Expense } from '../types';
import { expenseService } from '../services/db/ExpenseService';

export const useExpenses = (userId: string) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      expenseService.getAll(userId).then(data => {
        setExpenses(data);
        setLoading(false);
      });
    }, [userId]),
  );

  return { expenses, loading };
};
