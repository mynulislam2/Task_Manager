import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Fonts } from '../../constants/fonts';
import { formatCurrency } from '../../utils';
import { format } from 'date-fns';

interface TransactionRowProps {
  title: string;
  subtitle?: string;
  amount: number;
  date: string;
  category?: string;
  type: 'expense' | 'income';
  onPress?: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  Food: 'restaurant-outline',
  Transport: 'car-outline',
  Shopping: 'cart-outline',
  Bills: 'document-text-outline',
  Health: 'medkit-outline',
  Entertainment: 'film-outline',
  Recurring: 'repeat-outline',
  Salary: 'cash-outline',
  Bonus: 'gift-outline',
  Freelance: 'laptop-outline',
  Business: 'briefcase-outline',
  Investment: 'trending-up-outline',
  Gift: 'gift-outline',
  Other: 'ellipsis-horizontal-circle-outline',
};

const CATEGORY_COLORS: Record<string, string> = {
  Food: Colors.tertiaryContainer,
  Transport: Colors.primary,
  Shopping: Colors.secondary,
  Bills: Colors.outline,
  Health: Colors.error,
  Entertainment: Colors.tertiary,
  Recurring: Colors.primary,
  Salary: Colors.secondary,
  Bonus: Colors.warning,
  Freelance: Colors.primary,
  Business: Colors.primaryContainer,
  Investment: Colors.primaryFixedDim,
  Gift: Colors.tertiary,
  Other: Colors.outlineVariant,
};

const TransactionRow: React.FC<TransactionRowProps> = ({
  title,
  subtitle,
  amount,
  date,
  category,
  type,
  onPress,
}) => {
  const isExpense = type === 'expense';
  const iconName = category
    ? CATEGORY_ICONS[category] || 'ellipsis-horizontal-circle-outline'
    : 'ellipsis-horizontal-circle-outline';
  const iconBg = category
    ? CATEGORY_COLORS[category] || Colors.surfaceContainer
    : Colors.surfaceContainer;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.iconContainer, { backgroundColor: iconBg + '20' }]}>
        <Icon name={iconName} size={22} color={iconBg} />
      </View>
      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle || category || ''} • {format(new Date(date), 'MMM dd')}
        </Text>
      </View>
      <Text style={[styles.amount, { color: isExpense ? Colors.tertiary : Colors.secondary }]}>
        {isExpense ? '-' : '+'}
        {formatCurrency(amount)}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  pressed: { opacity: 0.7 },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  icon: { fontSize: 22 },
  details: { flex: 1 },
  title: {
    fontSize: 15,
    fontFamily: Fonts.family.semiBold,
    color: Colors.onSurface,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: Fonts.family.regular,
    color: Colors.outline,
  },
  amount: {
    fontSize: 15,
    fontFamily: Fonts.family.bold,
    marginLeft: Spacing.sm,
  },
});

export { CATEGORY_ICONS, CATEGORY_COLORS };
export default TransactionRow;
