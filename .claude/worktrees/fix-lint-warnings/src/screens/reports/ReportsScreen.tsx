import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { expenseService } from '../../services/db/ExpenseService';
import { incomeService } from '../../services/db/IncomeService';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils';
import { Expense, Income } from '../../types';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns';

type PeriodType = 'monthly' | 'yearly';

const ReportsScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('monthly');

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      const load = async () => {
        setLoading(true);
        const [e, i] = await Promise.all([
          expenseService.getAll(user.id),
          incomeService.getAll(user.id),
        ]);
        setExpenses(e);
        setIncomes(i);
        setLoading(false);
      };
      load();
    }, [user]),
  );

  const periodData = useMemo(() => {
    const now = new Date();
    if (selectedPeriod === 'monthly') {
      const start = startOfMonth(now).toISOString().split('T')[0];
      const end = endOfMonth(now).toISOString().split('T')[0];
      const periodExpenses = expenses.filter(e => e.date >= start && e.date <= end);
      const periodIncomes = incomes.filter(i => i.date >= start && i.date <= end);
      return { expenses: periodExpenses, incomes: periodIncomes, label: format(now, 'MMMM yyyy') };
    }
    const start = startOfYear(now).toISOString().split('T')[0];
    const end = endOfYear(now).toISOString().split('T')[0];
    const periodExpenses = expenses.filter(e => e.date >= start && e.date <= end);
    const periodIncomes = incomes.filter(i => i.date >= start && i.date <= end);
    return { expenses: periodExpenses, incomes: periodIncomes, label: format(now, 'yyyy') };
  }, [expenses, incomes, selectedPeriod]);

  const totalIncome = periodData.incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpense = periodData.expenses.reduce((s, e) => s + e.amount, 0);
  const savings = totalIncome - totalExpense;

  const categoryBreakdown = periodData.expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryBreakdown).sort(([, a], [, b]) => b - a);
  const topCategory = sortedCategories[0]?.[0] || '—';

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Period Toggle */}
      <View style={styles.periodPicker}>
        <Pressable
          onPress={() => setSelectedPeriod('monthly')}
          style={[styles.periodTab, selectedPeriod === 'monthly' && styles.periodTabActive]}
        >
          <Text
            style={[
              styles.periodTabText,
              selectedPeriod === 'monthly' && styles.periodTabTextActive,
            ]}
          >
            Monthly
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setSelectedPeriod('yearly')}
          style={[styles.periodTab, selectedPeriod === 'yearly' && styles.periodTabActive]}
        >
          <Text
            style={[
              styles.periodTabText,
              selectedPeriod === 'yearly' && styles.periodTabTextActive,
            ]}
          >
            Yearly
          </Text>
        </Pressable>
      </View>

      <Text style={styles.periodLabel}>{periodData.label}</Text>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <View style={[styles.metricIconBg, { backgroundColor: Colors.secondary + '15' }]}>
            <Icon name="trending-down" size={20} color={Colors.secondary} />
          </View>
          <Text style={styles.metricLabel}>Total Income</Text>
          <Text style={styles.metricValue}>{formatCurrency(totalIncome)}</Text>
          <Text style={styles.metricCount}>{periodData.incomes.length} entries</Text>
        </View>
        <View style={styles.metricCard}>
          <View style={[styles.metricIconBg, { backgroundColor: Colors.tertiary + '15' }]}>
            <Icon name="trending-up" size={20} color={Colors.tertiary} />
          </View>
          <Text style={styles.metricLabel}>Total Expense</Text>
          <Text style={styles.metricValue}>{formatCurrency(totalExpense)}</Text>
          <Text style={styles.metricCount}>{periodData.expenses.length} entries</Text>
        </View>
        <View style={styles.metricCard}>
          <View
            style={[
              styles.metricIconBg,
              { backgroundColor: savings >= 0 ? Colors.secondary + '15' : Colors.warning + '15' },
            ]}
          >
            <Icon
              name="wallet"
              size={20}
              color={savings >= 0 ? Colors.secondary : Colors.warning}
            />
          </View>
          <Text style={styles.metricLabel}>Savings</Text>
          <Text
            style={[
              styles.metricValue,
              { color: savings >= 0 ? Colors.secondary : Colors.warning },
            ]}
          >
            {formatCurrency(savings)}
          </Text>
          <Text style={styles.metricCount}>{savings >= 0 ? 'Positive' : 'Negative'}</Text>
        </View>
        <View style={styles.metricCard}>
          <View style={[styles.metricIconBg, { backgroundColor: Colors.primary + '15' }]}>
            <Icon name="trophy" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.metricLabel}>Top Category</Text>
          <Text style={styles.metricValueTop}>{topCategory}</Text>
          {sortedCategories[0] && (
            <Text style={styles.metricCount}>{formatCurrency(sortedCategories[0][1])}</Text>
          )}
        </View>
      </View>

      {/* Expense Breakdown */}
      {sortedCategories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expense Breakdown</Text>
          {sortedCategories.map(([cat, amount]) => (
            <View key={cat} style={styles.breakdownRow}>
              <Text style={styles.breakdownCategory}>{cat}</Text>
              <View style={styles.breakdownBarBg}>
                <View
                  style={[styles.breakdownBar, { width: `${(amount / totalExpense) * 100}%` }]}
                />
              </View>
              <Text style={styles.breakdownAmount}>{formatCurrency(amount)}</Text>
            </View>
          ))}
        </View>
      )}

      {periodData.expenses.length === 0 && periodData.incomes.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data for this period</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    padding: Spacing.containerMargin,
    paddingTop: 56,
    backgroundColor: Colors.background,
    flexGrow: 1,
    paddingBottom: 120,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontFamily: Fonts.family.regular,
    color: Colors.outline,
  },

  // Period
  periodPicker: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainer,
    borderRadius: BorderRadius.xl,
    padding: 3,
    marginBottom: Spacing.sm,
  },
  periodTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  periodTabActive: { backgroundColor: Colors.primary },
  periodTabText: { fontSize: 13, fontFamily: Fonts.family.medium, color: Colors.onSurfaceVariant },
  periodTabTextActive: { color: Colors.onPrimary },
  periodLabel: {
    fontSize: 16,
    fontFamily: Fonts.family.semiBold,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },

  // Metrics
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  metricCard: {
    width: '48%',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
  },
  metricIconBg: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  metricLabel: {
    fontSize: 11,
    fontFamily: Fonts.family.regular,
    color: Colors.outline,
    marginBottom: 2,
  },
  metricValue: { fontSize: 18, fontFamily: Fonts.family.bold, color: Colors.onSurface },
  metricValueTop: { fontSize: 18, fontFamily: Fonts.family.bold, color: Colors.onSurface },
  metricCount: {
    fontSize: 11,
    fontFamily: Fonts.family.regular,
    color: Colors.outline,
    marginTop: 2,
  },

  // Breakdown
  section: { marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.family.semiBold,
    color: Colors.onSurface,
    marginBottom: Spacing.sm,
  },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  breakdownCategory: {
    width: 70,
    fontSize: 12,
    fontFamily: Fonts.family.medium,
    color: Colors.onSurface,
  },
  breakdownBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 3,
    marginHorizontal: Spacing.sm,
  },
  breakdownBar: { height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  breakdownAmount: {
    width: 70,
    fontSize: 11,
    fontFamily: Fonts.family.semiBold,
    color: Colors.onSurface,
    textAlign: 'right',
  },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xl * 2 },
  emptyText: { fontSize: 14, fontFamily: Fonts.family.regular, color: Colors.outline },
});

export default ReportsScreen;
