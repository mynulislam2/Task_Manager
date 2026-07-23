import { useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { supabase } from '../lib/supabase';
import {
  fetchTasksStart,
  fetchTasksSuccess,
  fetchTasksFailure,
  addTask,
  updateTask,
  deleteTask,
  toggleStar,
} from '../store/tasksSlice';
import { LocalTask, TaskStatus } from '../types';
import { filterAndSortTasks } from '../utils/taskUtils';

export function useTasks() {
  const dispatch = useDispatch();
  const { items, loading, error, lastRefreshed } = useSelector((state: RootState) => state.tasks);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | null>(null);
  const [sortBy, setSortBy] = useState<'due_date' | 'created_at'>('created_at');
  
  const refreshTasks = useCallback(async () => {
    dispatch(fetchTasksStart());
    try {
      const { data, error: sbError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (sbError) throw sbError;
      
      dispatch(fetchTasksSuccess(data || []));
    } catch (err: any) {
      dispatch(fetchTasksFailure(err.message));
    }
  }, [dispatch]);
  
  // Create, Update, Delete
  const createNewTask = async (taskData: Partial<LocalTask>) => {
    try {
      const { data, error: sbError } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();
        
      if (sbError) throw sbError;
      dispatch(addTask({ ...data, starred: false }));
    } catch (err: any) {
      console.error('Failed to create task', err);
      throw err;
    }
  };

  const editTask = async (id: string, updates: Partial<LocalTask>) => {
    try {
      const { data, error: sbError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (sbError) throw sbError;
      
      const existingTask = items.find(t => t.id === id);
      dispatch(updateTask({ ...data, starred: existingTask?.starred || false }));
    } catch (err: any) {
      console.error('Failed to update task', err);
      throw err;
    }
  };

  const removeTask = async (id: string) => {
    try {
      const { error: sbError } = await supabase.from('tasks').delete().eq('id', id);
      if (sbError) throw sbError;
      dispatch(deleteTask(id));
    } catch (err: any) {
      console.error('Failed to delete task', err);
      throw err;
    }
  };

  const toggleTaskStar = (id: string) => {
    dispatch(toggleStar(id));
  };

  // Separation of rendering from filtering/sorting (Requirement 4.4)
  const filteredAndSortedTasks = useMemo(() => {
    return filterAndSortTasks(items, searchQuery, filterCategory, filterStatus, sortBy);
  }, [items, searchQuery, filterCategory, filterStatus, sortBy]);

  return {
    tasks: filteredAndSortedTasks,
    loading,
    error,
    lastRefreshed,
    refreshTasks,
    createNewTask,
    editTask,
    removeTask,
    toggleTaskStar,
    // Filters & Sorting state
    setSearchQuery,
    filterCategory,
    setFilterCategory,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
  };
}
