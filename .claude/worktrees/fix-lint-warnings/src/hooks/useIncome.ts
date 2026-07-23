import { useState, useEffect } from 'react';
import { Income } from '../types';
import { incomeService } from '../services/db/IncomeService';

export const useIncome = (userId: string) => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    incomeService.getAll(userId).then(data => {
      setIncomes(data);
      setLoading(false);
    });
  }, [userId]);

  return { incomes, loading };
};
