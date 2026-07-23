export const Colors = {
  // Brand
  primary: '#003ec7',
  primaryContainer: '#0052ff',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#dfe3ff',
  primaryFixed: '#dde1ff',
  primaryFixedDim: '#b7c4ff',
  inversePrimary: '#b7c4ff',

  // Secondary (Income)
  secondary: '#006e2f',
  secondaryContainer: '#6bff8f',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#007432',

  // Tertiary (Expense)
  tertiary: '#952200',
  tertiaryContainer: '#bf3003',
  onTertiary: '#ffffff',
  onTertiaryContainer: '#ffddd5',

  // Error
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',

  // Warning
  warning: '#D97706',
  warningLight: '#FEF3C7',

  // Surfaces
  surface: '#fbf8ff',
  surfaceDim: '#d9d9e7',
  surfaceBright: '#fbf8ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f3f2ff',
  surfaceContainer: '#ededfb',
  surfaceContainerHigh: '#e7e7f5',
  surfaceContainerHighest: '#e1e1ef',
  onSurface: '#191b25',
  onSurfaceVariant: '#434656',
  inverseSurface: '#2e303a',
  inverseOnSurface: '#f0effe',

  // Background
  background: '#fbf8ff',
  onBackground: '#191b25',

  // Outline
  outline: '#737688',
  outlineVariant: '#c3c5d9',

  // Semantic aliases (for readability)
  income: '#006e2f',
  incomeLight: '#6bff8f20',
  expense: '#ba1a1a',
  expenseLight: '#ffdad6',
  text: '#191b25',
  textSecondary: '#434656',
  muted: '#737688',
  border: '#e1e1ef',
  white: '#ffffff',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Surface tint
  surfaceTint: '#004ced',
} as const;

export type ColorKey = keyof typeof Colors;
