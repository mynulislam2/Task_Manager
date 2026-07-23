import { httpService } from '../http/HttpService';
import { API_URLS } from '../urls';
import { Expense } from '../../types';

export const expenseService = {
  getAll: async (userId: string) => {
    const { data } = await httpService.get<Expense[]>(
      `${API_URLS.EXPENSES}?user_id=eq.${userId}&order=date.desc`,
    );
    return data ?? [];
  },

  getById: async (id: string) => {
    const { data } = await httpService.get<Expense[]>(
      `${API_URLS.EXPENSES}?id=eq.${id}`,
    );
    return data?.[0] ?? null;
  },

  create: async (expense: Omit<Expense, 'id' | 'created_at'>) => {
    const res = await httpService.post<Expense | Expense[]>(API_URLS.EXPENSES, expense);
    if (Array.isArray(res.data)) return res.data[0];
    return res.data ?? ({} as Expense);
  },

  update: async (id: string, updates: Partial<Expense>) => {
    const res = await httpService.put<Expense | Expense[]>(
      `${API_URLS.EXPENSES}?id=eq.${id}`, updates,
    );
    if (Array.isArray(res.data)) return res.data[0];
    return res.data ?? ({} as Expense);
  },

  delete: async (id: string) => {
    await httpService.delete(`${API_URLS.EXPENSES}?id=eq.${id}`);
  },
};