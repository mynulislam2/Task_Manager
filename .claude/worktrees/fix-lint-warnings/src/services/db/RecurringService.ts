import { httpService } from '../http/HttpService';
import { API_URLS } from '../urls';
import { RecurringPayment } from '../../types';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';

export const recurringService = {
  getById: async (id: string, userId: string) => {
    const { data } = await httpService.get<RecurringPayment[]>(
      `${API_URLS.RECURRING_PAYMENTS}?id=eq.${id}&user_id=eq.${userId}`,
    );
    return data?.[0] ?? null;
  },

  getAll: async (userId: string) => {
    const { data } = await httpService.get<RecurringPayment[]>(
      `${API_URLS.RECURRING_PAYMENTS}?user_id=eq.${userId}&order=next_date.asc`,
    );
    return data ?? [];
  },

  create: async (payment: Omit<RecurringPayment, 'id' | 'created_at'>) => {
    const res = await httpService.post<RecurringPayment | RecurringPayment[]>(
      API_URLS.RECURRING_PAYMENTS, payment,
    );
    if (Array.isArray(res.data)) return res.data[0];
    return res.data ?? ({} as RecurringPayment);
  },

  update: async (id: string, updates: Partial<RecurringPayment>) => {
    const res = await httpService.put<RecurringPayment | RecurringPayment[]>(
      `${API_URLS.RECURRING_PAYMENTS}?id=eq.${id}`, updates,
    );
    if (Array.isArray(res.data)) return res.data[0];
    return res.data ?? ({} as RecurringPayment);
  },

  delete: async (id: string) => {
    await httpService.delete(`${API_URLS.RECURRING_PAYMENTS}?id=eq.${id}`);
  },

  getDue: async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await httpService.get<RecurringPayment[]>(
      `${API_URLS.RECURRING_PAYMENTS}?user_id=eq.${userId}&next_date=lte.${today}&is_paused=eq.false`,
    );
    return data ?? [];
  },

  calculateNextDate: (currentDate: string, frequency: string): string => {
    const current = new Date(currentDate);
    const next =
      frequency === 'daily' ? addDays(current, 1)
      : frequency === 'weekly' ? addWeeks(current, 1)
      : frequency === 'monthly' ? addMonths(current, 1)
      : addYears(current, 1);
    return next.toISOString().split('T')[0];
  },
};