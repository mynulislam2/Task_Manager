import { LocalTask, TaskStatus } from '../types';

export const filterAndSortTasks = (
  items: LocalTask[],
  searchQuery: string,
  filterCategory: string | null,
  filterStatus: TaskStatus | null,
  sortBy: 'due_date' | 'created_at'
): LocalTask[] => {
  let result = [...items];
  
  // Search
  if (searchQuery) {
    const lowerQuery = searchQuery.toLowerCase();
    result = result.filter(t => t.title.toLowerCase().includes(lowerQuery));
  }
  
  // Filter Category
  if (filterCategory) {
    result = result.filter(t => t.category_id === filterCategory);
  }
  
  // Filter Status
  if (filterStatus) {
    result = result.filter(t => t.status === filterStatus);
  }
  
  // Sort
  result.sort((a, b) => {
    if (sortBy === 'due_date') {
      if (!a.due_date) return 1; // Put tasks without due date at the bottom
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    } else {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });
  
  return result;
};
