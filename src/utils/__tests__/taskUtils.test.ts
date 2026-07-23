import { filterAndSortTasks } from '../taskUtils';
import { LocalTask } from '../../types';

describe('filterAndSortTasks', () => {
  const mockTasks: LocalTask[] = [
    {
      id: '1',
      title: 'Buy groceries',
      description: null,
      status: 'open',
      due_date: '2026-08-01T10:00:00Z',
      category_id: 'cat-1',
      created_at: '2026-07-01T10:00:00Z',
    },
    {
      id: '2',
      title: 'Finish report',
      description: 'Q3 report',
      status: 'done',
      due_date: '2026-07-20T10:00:00Z',
      category_id: 'cat-2',
      created_at: '2026-07-02T10:00:00Z',
    },
    {
      id: '3',
      title: 'Call mom',
      description: null,
      status: 'open',
      due_date: null,
      category_id: 'cat-1',
      created_at: '2026-07-03T10:00:00Z',
    },
  ];

  it('should return all tasks when no filters are applied', () => {
    const result = filterAndSortTasks(mockTasks, '', null, null, 'created_at');
    expect(result).toHaveLength(3);
  });

  it('should filter tasks by search query', () => {
    const result = filterAndSortTasks(mockTasks, 'groceries', null, null, 'created_at');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should filter tasks by category', () => {
    const result = filterAndSortTasks(mockTasks, '', 'cat-1', null, 'created_at');
    expect(result).toHaveLength(2);
    expect(result.every(t => t.category_id === 'cat-1')).toBe(true);
  });

  it('should filter tasks by status', () => {
    const result = filterAndSortTasks(mockTasks, '', null, 'done', 'created_at');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('should sort tasks by created_at (newest first)', () => {
    const result = filterAndSortTasks(mockTasks, '', null, null, 'created_at');
    expect(result[0].id).toBe('3');
    expect(result[1].id).toBe('2');
    expect(result[2].id).toBe('1');
  });

  it('should sort tasks by due_date (earliest first, nulls last)', () => {
    const result = filterAndSortTasks(mockTasks, '', null, null, 'due_date');
    expect(result[0].id).toBe('2'); // Jul 20
    expect(result[1].id).toBe('1'); // Aug 01
    expect(result[2].id).toBe('3'); // null due date
  });
});
