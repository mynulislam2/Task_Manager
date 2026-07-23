import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchTasksSuccess,
  addTask,
  updateTask,
  deleteTask,
  toggleStar,
} from './tasksSlice';
import {
  fetchCategoriesSuccess,
  addCategory,
} from './categoriesSlice';
import type { RootState } from './index';

export const cacheMiddleware = createListenerMiddleware();

const CACHE_KEY_TASKS = 'offline_tasks_cache';
const CACHE_KEY_CATEGORIES = 'offline_categories_cache';
const CACHE_KEY_LAST_REFRESHED = 'offline_last_refreshed';

// Listen to task changes
cacheMiddleware.startListening({
  matcher: isAnyOf(fetchTasksSuccess, addTask, updateTask, deleteTask, toggleStar),
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    try {
      await AsyncStorage.setItem(CACHE_KEY_TASKS, JSON.stringify(state.tasks.items));
      if (state.tasks.lastRefreshed) {
        await AsyncStorage.setItem(CACHE_KEY_LAST_REFRESHED, state.tasks.lastRefreshed.toString());
      }
    } catch (e) {
      console.error('Failed to cache tasks', e);
    }
  },
});

// Listen to category changes
cacheMiddleware.startListening({
  matcher: isAnyOf(fetchCategoriesSuccess, addCategory),
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    try {
      await AsyncStorage.setItem(CACHE_KEY_CATEGORIES, JSON.stringify(state.categories.items));
    } catch (e) {
      console.error('Failed to cache categories', e);
    }
  },
});

export const loadInitialCache = async (dispatch: any) => {
  try {
    const [tasksJson, categoriesJson, lastRefreshedStr] = await Promise.all([
      AsyncStorage.getItem(CACHE_KEY_TASKS),
      AsyncStorage.getItem(CACHE_KEY_CATEGORIES),
      AsyncStorage.getItem(CACHE_KEY_LAST_REFRESHED),
    ]);

    if (tasksJson) {
      const items = JSON.parse(tasksJson);
      const lastRefreshed = lastRefreshedStr ? parseInt(lastRefreshedStr, 10) : null;
      dispatch({ type: 'tasks/setInitialCache', payload: { items, lastRefreshed } });
    }
    
    if (categoriesJson) {
      const items = JSON.parse(categoriesJson);
      dispatch({ type: 'categories/setInitialCache', payload: items });
    }
  } catch (e) {
    console.error('Failed to load initial cache', e);
  }
};
