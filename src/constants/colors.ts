export const Colors = {
  // Brand
  primary: '#4F46E5', // Indigo
  primaryLight: '#EEF2FF',
  
  // Surfaces
  background: '#F4F4F5',
  card: '#FFFFFF',
  
  // Text
  textMain: '#18181B',
  textMuted: '#71717A',
  
  // Semantic
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  
  // Borders
  border: '#E4E4E7',

  // Material 3 / Custom additions for common components
  surfaceContainerLow: '#F7F7F8',
  surfaceContainerHigh: '#E5E5E8',
  surfaceContainerLowest: '#FFFFFF',
  onSurfaceVariant: '#49454F',
  onSurface: '#1C1B1F',
  surface: '#FEFBFF',
  overlay: 'rgba(0, 0, 0, 0.4)',
  outlineVariant: '#CAC4D0',
  secondary: '#625B71',
  primaryContainer: '#E0E7FF',
  onPrimaryContainer: '#3730A3',
  onPrimary: '#FFFFFF',
  errorContainer: '#FEE2E2',
  onErrorContainer: '#991B1B',
  outline: '#79747E',
  white: '#FFFFFF',
} as const;

export type ColorKey = keyof typeof Colors;
