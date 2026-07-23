import { httpService } from '../http/HttpService';
import { API_URLS } from '../urls';
import { Income } from '../../types';

export const incomeService = {
  getAll: async (userId: string) => {
    const { data } = await httpService.get<Income[]>(
      `${API_URLS.INCOMES}?user_id=eq.${userId}&order=date.desc`,
    );
    return data ?? [];
  },

  getById: async (id: string) => {
    const { data } = await httpService.get<Income[]>(
      `${API_URLS.INCOMES}?id=eq.${id}`,
    );
    return data?.[0] ?? null;
  },

  create: async (income: Omit<Income, 'id' | 'created_at'>) => {
    const res = await httpService.post<Income | Income[]>(API_URLS.INCOMES, income);
    if (Array.isArray(res.data)) return res.data[0];
    return res.data ?? ({} as Income);
  },

  update: async (id: string, updates: Partial<Income>) => {
    const res = await httpService.put<Income | Income[]>(
      `${API_URLS.INCOMES}?id=eq.${id}`, updates,
    );
    if (Array.isArray(res.data)) return res.data[0];
    return res.data ?? ({} as Income);
  },

  delete: async (id: string) => {
    await httpService.delete(`${API_URLS.INCOMES}?id=eq.${id}`);
  },
};