import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Budget } from '../types';

interface BudgetState {
  items: Budget[];
  loading: boolean;
}

const initialState: BudgetState = {
  items: [],
  loading: false,
};

const budgetSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    setBudgets(state, action: PayloadAction<Budget[]>) {
      state.items = action.payload;
    },
    addBudget(state, action: PayloadAction<Budget>) {
      state.items.unshift(action.payload);
    },
    updateBudget(state, action: PayloadAction<Budget>) {
      const idx = state.items.findIndex(b => b.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    removeBudget(state, action: PayloadAction<string>) {
      state.items = state.items.filter(b => b.id !== action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setBudgets, addBudget, updateBudget, removeBudget, setLoading } =
  budgetSlice.actions;
export default budgetSlice.reducer;
