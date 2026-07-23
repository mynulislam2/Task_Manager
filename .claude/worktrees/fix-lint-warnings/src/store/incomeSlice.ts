import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Income } from '../types';

interface IncomeState {
  items: Income[];
  loading: boolean;
}

const initialState: IncomeState = {
  items: [],
  loading: false,
};

const incomeSlice = createSlice({
  name: 'incomes',
  initialState,
  reducers: {
    setIncomes(state, action: PayloadAction<Income[]>) {
      state.items = action.payload;
    },
    addIncome(state, action: PayloadAction<Income>) {
      state.items.unshift(action.payload);
    },
    updateIncome(state, action: PayloadAction<Income>) {
      const idx = state.items.findIndex(i => i.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    removeIncome(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setIncomes, addIncome, updateIncome, removeIncome, setLoading } = incomeSlice.actions;
export default incomeSlice.reducer;
