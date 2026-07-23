import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LocalTask, TasksState } from '../types';

const initialState: TasksState = {
  items: [],
  loading: false,
  error: null,
  lastRefreshed: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Actions for loading from local cache on app start
    setInitialCache(state, action: PayloadAction<{ items: LocalTask[]; lastRefreshed: number | null }>) {
      state.items = action.payload.items;
      state.lastRefreshed = action.payload.lastRefreshed;
    },
    // Actions for refreshing from backend
    fetchTasksStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchTasksSuccess(state, action: PayloadAction<LocalTask[]>) {
      state.loading = false;
      state.error = null;
      state.lastRefreshed = Date.now();
      
      // Preserve local-only 'starred' field during refresh
      const fetchedTasks = action.payload;
      const currentStarredMap: Record<string, boolean> = {};
      state.items.forEach(t => {
        if (t.starred) currentStarredMap[t.id] = true;
      });
      
      state.items = fetchedTasks.map(t => ({
        ...t,
        starred: currentStarredMap[t.id] || false,
      }));
    },
    fetchTasksFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    
    // CRUD Actions (Optimistic/Success updates)
    addTask(state, action: PayloadAction<LocalTask>) {
      state.items.unshift(action.payload);
    },
    updateTask(state, action: PayloadAction<LocalTask>) {
      const index = state.items.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteTask(state, action: PayloadAction<string>) {
      state.items = state.items.filter(t => t.id !== action.payload);
    },
    toggleStar(state, action: PayloadAction<string>) {
      const index = state.items.findIndex(t => t.id === action.payload);
      if (index !== -1) {
        state.items[index].starred = !state.items[index].starred;
      }
    }
  },
});

export const {
  setInitialCache,
  fetchTasksStart,
  fetchTasksSuccess,
  fetchTasksFailure,
  addTask,
  updateTask,
  deleteTask,
  toggleStar,
} = tasksSlice.actions;

export default tasksSlice.reducer;
