export const Fonts = {
  // Font Families
  family: {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semiBold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
    // Plain "Poppins" works with default weight
    base: 'Poppins',
  } as const,

  // Font Sizes
  size: {
    xs: 10,
    sm: 12,
    md: 13,
    body: 15,
    bodyLg: 16,
    section: 18,
    h2: 22,
    h1: 28,
    amountLg: 36,
    hero: 40,
  } as const,

  // Line Heights
  lineHeight: {
    tight: 16,
    normal: 18,
    relaxed: 22,
    section: 24,
    h2: 28,
    h1: 34,
    amountLg: 44,
  } as const,

  // Letter Spacings
  tracking: {
    tight: -0.02,
    normal: -0.01,
    wide: 0.05,
    wider: 0.1,
  } as const,

  // Font Weights
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },
} as const;
