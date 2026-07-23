import { getCategoryStyle } from '../index';

describe('getCategoryStyle', () => {
  it('should return default style for unknown categories', () => {
    const style = getCategoryStyle('Random Stuff');
    expect(['folder-outline', 'bookmark-outline', 'tag-outline', 'label-outline', 'layers-outline', 'shape-outline']).toContain(style.icon);
    expect(style.colors).toHaveProperty('bg');
    expect(style.colors).toHaveProperty('text');
  });

  it('should match work related keywords', () => {
    const style = getCategoryStyle('My Office Job');
    expect(style.icon).toBe('briefcase-outline');
    expect(style.colors).toHaveProperty('bg');
    expect(style.colors).toHaveProperty('text');
  });

  it('should match personal related keywords', () => {
    const style = getCategoryStyle('Personal life');
    expect(style.icon).toBe('account-outline');
    expect(style.colors).toHaveProperty('bg');
    expect(style.colors).toHaveProperty('text');
  });

  it('should match home related keywords', () => {
    const style = getCategoryStyle('House chores');
    expect(style.icon).toBe('home-outline');
    expect(style.colors).toHaveProperty('bg');
    expect(style.colors).toHaveProperty('text');
  });

  it('should match finance related keywords', () => {
    const style = getCategoryStyle('Pay electricity bill');
    expect(style.icon).toBe('cash');
    expect(style.colors).toHaveProperty('bg');
    expect(style.colors).toHaveProperty('text');
  });
});
