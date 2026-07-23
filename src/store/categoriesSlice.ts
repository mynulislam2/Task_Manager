import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Category, CategoriesState } from '../types';

const initialState: CategoriesState = {
  items: [],
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setInitialCache(state, action: PayloadAction<Category[]>) {
      state.items = action.payload;
    },
    fetchCategoriesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCategoriesSuccess(state, action: PayloadAction<Category[]>) {
      state.loading = false;
      state.items = action.payload;
      state.error = null;
    },
    fetchCategoriesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    addCategory(state, action: PayloadAction<Category>) {
      state.items.push(action.payload);
    },
  },
});

export const {
  setInitialCache,
  fetchCategoriesStart,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
  addCategory,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;
