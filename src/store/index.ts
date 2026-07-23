import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from './tasksSlice';
import categoriesReducer from './categoriesSlice';
import { cacheMiddleware } from './cacheMiddleware';

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    categories: categoriesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(cacheMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
