export interface Expense {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  payment_method?: string;
  notes?: string;
  recurring_id?: string;
  sms_hash?: string;
  sms_body?: string;
  created_at: string;
}

export interface Income {
  id: string;
  user_id: string;
  source: string;
  amount: number;
  date: string;
  notes?: string;
  sms_hash?: string;
  sms_body?: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  limit_amount: number;
  month: string;
  created_at: string;
}

export interface RecurringPayment {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  next_date: string;
  is_paused: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  currency: string;
  created_at: string;
}