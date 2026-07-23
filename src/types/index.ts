export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export type TaskStatus = 'open' | 'in_progress' | 'in_review' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  category_id: string | null;
  created_at: string;
}

// Our Redux slice will store the local 'starred' flag separately or merged into the task.
// We will merge it into the Redux Task object:
export interface LocalTask extends Task {
  starred?: boolean; // local-only field
}

export interface TasksState {
  items: LocalTask[];
  loading: boolean;
  error: string | null;
  lastRefreshed: number | null; // timestamp
}

export interface CategoriesState {
  items: Category[];
  loading: boolean;
  error: string | null;
}