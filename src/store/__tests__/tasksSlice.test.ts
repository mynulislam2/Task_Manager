import tasksReducer, {
  setInitialCache,
  addTask,
  updateTask,
  deleteTask,
  toggleStar,
} from '../tasksSlice';
import { TasksState, LocalTask } from '../../types';

describe('tasksSlice reducer', () => {
  const initialState: TasksState = {
    items: [],
    loading: false,
    error: null,
    lastRefreshed: null,
  };

  const mockTask: LocalTask = {
    id: '1',
    title: 'Test Task',
    description: null,
    status: 'open',
    due_date: null,
    category_id: null,
    created_at: '2026-07-23T10:00:00Z',
    starred: false,
  };

  it('should handle setInitialCache', () => {
    const action = setInitialCache({ items: [mockTask], lastRefreshed: 12345 });
    const state = tasksReducer(initialState, action);
    expect(state.items).toHaveLength(1);
    expect(state.lastRefreshed).toBe(12345);
  });

  it('should handle addTask', () => {
    const action = addTask(mockTask);
    const state = tasksReducer(initialState, action);
    expect(state.items[0]).toEqual(mockTask);
  });

  it('should handle updateTask', () => {
    const startingState = { ...initialState, items: [mockTask] };
    const updatedTask = { ...mockTask, title: 'Updated Title' };
    const action = updateTask(updatedTask);
    const state = tasksReducer(startingState, action);
    expect(state.items[0].title).toBe('Updated Title');
  });

  it('should handle deleteTask', () => {
    const startingState = { ...initialState, items: [mockTask] };
    const action = deleteTask('1');
    const state = tasksReducer(startingState, action);
    expect(state.items).toHaveLength(0);
  });

  it('should handle toggleStar', () => {
    const startingState = { ...initialState, items: [mockTask] };
    const action = toggleStar('1');
    const state = tasksReducer(startingState, action);
    expect(state.items[0].starred).toBe(true);
    
    const state2 = tasksReducer(state, action);
    expect(state2.items[0].starred).toBe(false);
  });
});
