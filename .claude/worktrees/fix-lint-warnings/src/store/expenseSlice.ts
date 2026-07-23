import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Expense } from '../types';

interface ExpenseState {
  items: Expense[];
  loading: boolean;
}

const initialState: ExpenseState = {
  items: [],
  loading: false,
};

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setExpenses(state, action: PayloadAction<Expense[]>) {
      state.items = action.payload;
    },
    addExpense(state, action: PayloadAction<Expense>) {
      state.items.unshift(action.payload);
    },
    updateExpense(state, action: PayloadAction<Expense>) {
      const idx = state.items.findIndex(e => e.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    removeExpense(state, action: PayloadAction<string>) {
      state.items = state.items.filter(e => e.id !== action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setExpenses, addExpense, updateExpense, removeExpense, setLoading } =
  expenseSlice.actions;
export default expenseSlice.reducer;