import Config from 'react-native-config';

export const API_URLS = {
  BASE_URL: Config.SUPABASE_URL || '',
  EXPENSES: '/rest/v1/expenses',
  INCOMES: '/rest/v1/incomes',
  BUDGETS: '/rest/v1/budgets',
  RECURRING_PAYMENTS: '/rest/v1/recurring_payments',
  PROFILES: '/rest/v1/profiles',
};
