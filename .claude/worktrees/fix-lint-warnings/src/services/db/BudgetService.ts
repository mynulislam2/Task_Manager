import { httpService } from '../http/HttpService';
import { API_URLS } from '../urls';
import { Budget } from '../../types';

export const budgetService = {
  getById: async (id: string) => {
    const { data } = await httpService.get<Budget[]>(
      `${API_URLS.BUDGETS}?id=eq.${id}`,
    );
    return data?.[0] ?? null;
  },

  getAll: async (userId: string) => {
    const { data } = await httpService.get<Budget[]>(
      `${API_URLS.BUDGETS}?user_id=eq.${userId}&order=month.desc`,
    );
    return data ?? [];
  },

  create: async (budget: Omit<Budget, 'id' | 'created_at'>) => {
    const res = await httpService.post<Budget | Budget[]>(API_URLS.BUDGETS, budget);
    if (Array.isArray(res.data)) return res.data[0];
    return res.data ?? ({} as Budget);
  },

  update: async (id: string, updates: Partial<Budget>) => {
    const res = await httpService.put<Budget | Budget[]>(
      `${API_URLS.BUDGETS}?id=eq.${id}`, updates,
    );
    if (Array.isArray(res.data)) return res.data[0];
    return res.data ?? ({} as Budget);
  },

  delete: async (id: string) => {
    await httpService.delete(`${API_URLS.BUDGETS}?id=eq.${id}`);
  },
};