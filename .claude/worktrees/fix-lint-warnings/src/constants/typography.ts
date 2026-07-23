import { TextStyle } from 'react-native';
import { Fonts } from './fonts';

export const Typography: Record<string, TextStyle> = {
  amountLg: {
    fontFamily: Fonts.family.base,
    fontWeight: '700',
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.02,
  },
  h1: {
    fontFamily: Fonts.family.base,
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.01,
  },
  h2: {
    fontFamily: Fonts.family.base,
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.01,
  },
  sectionTitle: {
    fontFamily: Fonts.family.base,
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 24,
  },
  body: {
    fontFamily: Fonts.family.base,
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    fontFamily: Fonts.family.base,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
  },
  labelBold: {
    fontFamily: Fonts.family.base,
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.05,
  },
} as const;

export type TypographyKey = keyof typeof Typography;
