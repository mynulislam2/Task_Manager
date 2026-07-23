import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

let defaultCurrency = 'USD';

export const setDefaultCurrency = (currency: string) => {
  defaultCurrency = currency;
};

export const formatCurrency = (amount: number, currency?: string) => {
  const cur = currency || defaultCurrency;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur }).format(amount);
};

export const getMonthRange = (date: Date) => ({
  start: startOfMonth(date).toISOString(),
  end: endOfMonth(date).toISOString(),
});

export const getYearRange = (date: Date) => ({
  start: startOfYear(date).toISOString(),
  end: endOfYear(date).toISOString(),
});

export const formatDate = (date: string | Date, pattern = 'MMM dd, yyyy') =>
  format(new Date(date), pattern);
