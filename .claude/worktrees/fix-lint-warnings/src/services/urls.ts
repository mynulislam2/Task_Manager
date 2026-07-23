import Config from 'react-native-config';

export const API_URLS = {
  BASE_URL: Config.SUPABASE_URL || '',

  // Auth
  AUTH_SIGNUP: '/auth/v1/signup',
  AUTH_LOGIN: '/auth/v1/token?grant_type=password',
  AUTH_LOGOUT: '/auth/v1/logout',
  AUTH_RESET_PASSWORD: '/auth/v1/recover',
  AUTH_USER: '/auth/v1/user',

  // Database REST
  PROFILES: '/rest/v1/profiles',
  EXPENSES: '/rest/v1/expenses',
  INCOMES: '/rest/v1/incomes',
  BUDGETS: '/rest/v1/budgets',
  RECURRING_PAYMENTS: '/rest/v1/recurring_payments',
} as const;

export const TABLE_NAMES = {
  PROFILES: 'profiles',
  EXPENSES: 'expenses',
  INCOMES: 'incomes',
  BUDGETS: 'budgets',
  RECURRING_PAYMENTS: 'recurring_payments',
} as const;
