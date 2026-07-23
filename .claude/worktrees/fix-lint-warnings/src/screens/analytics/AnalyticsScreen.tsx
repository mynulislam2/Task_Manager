import React, { useCallback, useState } from 'react';
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
type InsightsTab = 'analytics' | 'reports';

const TABS: { key: InsightsTab; label: string }[] = [
  { key: 'analytics', label: 'Analytics' },
  { key: 'reports', label: 'Reports' },
];

const COLORS_MAP = [
  '#003ec7', '#006e2f', '#D97706', '#bf3003',
  '#7C3AED', '#0891B2', '#DB2777', '#65A30D',
];

const AnalyticsScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [activeTab, setActiveTab] = useState<InsightsTab>('analytics');
  const [selectedChart, setSelectedChart] = useState<'category' | 'trend' | 'compare'>('category');

  useFocusEffect(useCallback(() => {
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
  }, [user]));

  // Analytics calculations
  const categoryTotals = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const totalExpense = Object.values(categoryTotals).reduce((s, v) => s + v, 0);
  const sortedCategories = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);

  const monthlyData = Array.from({ length: 6 }, (_, idx) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - idx));
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthExpenses = expenses.filter(e => e.date.startsWith(monthKey));
    const monthIncomes = incomes.filter(inc => inc.date.startsWith(monthKey));
    return {
      month: d.toLocaleString('default', { month: 'short' }),
      expense: monthExpenses.reduce((s, e) => s + e.amount, 0),
      income: monthIncomes.reduce((s, inc) => s + inc.amount, 0),
    };
  });

  const maxVal = Math.max(...monthlyData.map(d => Math.max(d.expense, d.income)), 1);
  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const savings = totalIncome - totalExpense;

  // Budget calculations
  const renderAnalytics = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      {/* Period Toggle */}
      <View style={styles.chartToggle}>
        {(['category', 'trend', 'compare'] as const).map(tab => (
          <Pressable
            key={tab}
            onPress={() => setSelectedChart(tab)}
            style={[styles.chartToggleTab, selectedChart === tab && styles.chartToggleTabActive]}
          >
            <Text style={[styles.chartToggleText, selectedChart === tab && styles.chartToggleTextActive]}>
              {tab === 'category' ? 'Allocation' : tab === 'trend' ? 'Trend' : 'Compare'}
            </Text>
          </Pressable>
        ))}
      </View>

      {selectedChart === 'category' && (
        <View style={styles.chartCard}>
          {/* Donut Visualization */}
          <View style={styles.donutContainer}>
            <View style={styles.donutOuter}>
              {sortedCategories.map(([cat, amount], idx) => {
                const percent = amount / totalExpense;
                const pct = Math.round(percent * 100);
                return (
                  <View key={cat} style={styles.donutRow}>
                    <View style={[styles.donutDot, { backgroundColor: COLORS_MAP[idx % COLORS_MAP.length] }]} />
                    <Text style={styles.donutLabel}>{cat}</Text>
                    <Text style={styles.donutValue}>{formatCurrency(amount)}</Text>
                    <Text style={styles.donutPercent}>({pct}%)</Text>
                  </View>
                );
              })}
              {sortedCategories.length === 0 && (
                <Text style={styles.noData}>No expense data yet</Text>
              )}
            </View>
          </View>
        </View>
      )}

      {selectedChart === 'trend' && (
        <View style={styles.chartCard}>
          {monthlyData.every(d => d.expense === 0 && d.income === 0) ? (
            <Text style={styles.noData}>No transaction data yet</Text>
          ) : (
            <View style={styles.barChartContainer}>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDotSmall, { backgroundColor: Colors.secondary }]} />
                  <Text style={styles.legendText}>Income</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDotSmall, { backgroundColor: Colors.tertiary }]} />
                  <Text style={styles.legendText}>Expense</Text>
                </View>
              </View>
              <View style={styles.barChartGrid}>
                {monthlyData.map((d, idx) => {
                  const expenseHeight = (d.expense / maxVal) * 120;
                  const incomeHeight = (d.income / maxVal) * 120;
                  return (
                    <View key={idx} style={styles.barColumn}>
                      <View style={styles.barGroup}>
                        <View style={[styles.bar, { height: Math.max(incomeHeight, 2), backgroundColor: Colors.secondary }]} />
                        <View style={[styles.bar, { height: Math.max(expenseHeight, 2), backgroundColor: Colors.tertiary }]} />
                      </View>
                      <Text style={styles.barLabel}>{d.month}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      )}

      {selectedChart === 'compare' && (
        <View style={styles.chartCard}>
          {totalIncome === 0 && totalExpense === 0 ? (
            <Text style={styles.noData}>No data to compare</Text>
          ) : (
            <View style={styles.compareContainer}>
              <View style={styles.compareRow}>
                <Text style={styles.compareLabel}>Income</Text>
                <View style={styles.compareBarBg}>
                  <View style={[styles.compareBar, { width: `${(totalIncome / Math.max(totalIncome, totalExpense, 1)) * 100}%`, backgroundColor: Colors.secondary }]} />
                </View>
                <Text style={[styles.compareValue, { color: Colors.secondary }]}>{formatCurrency(totalIncome)}</Text>
              </View>
              <View style={styles.compareRow}>
                <Text style={styles.compareLabel}>Expense</Text>
                <View style={styles.compareBarBg}>
                  <View style={[styles.compareBar, { width: `${(totalExpense / Math.max(totalIncome, totalExpense, 1)) * 100}%`, backgroundColor: Colors.tertiary }]} />
                </View>
                <Text style={[styles.compareValue, { color: Colors.tertiary }]}>{formatCurrency(totalExpense)}</Text>
              </View>
              <View style={styles.compareDivider} />
              <View style={styles.compareRow}>
                <Text style={styles.compareLabel}>Savings</Text>
                <View style={styles.compareBarBg}>
                  <View style={[styles.compareBar, { width: `${(Math.abs(savings) / Math.max(totalIncome, totalExpense, 1)) * 100}%`, backgroundColor: savings >= 0 ? Colors.primary : Colors.warning }]} />
                </View>
                <Text style={[styles.compareValue, { color: savings >= 0 ? Colors.secondary : Colors.tertiary }]}>{formatCurrency(savings)}</Text>
              </View>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );

  const renderReports = () => {
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthExpenses = expenses.filter(e => e.date.startsWith(monthStr));
    const monthIncomes = incomes.filter(i => i.date.startsWith(monthStr));
    const monthTotalExpense = monthExpenses.reduce((s, e) => s + e.amount, 0);
    const monthTotalIncome = monthIncomes.reduce((s, i) => s + i.amount, 0);
    const monthSavings = monthTotalIncome - monthTotalExpense;

    const categoryBreakdown = monthExpenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});
    const sortedBreakdown = Object.entries(categoryBreakdown).sort(([, a], [, b]) => b - a);
    const topCategory = sortedBreakdown[0]?.[0] || '—';

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
        <Text style={styles.periodLabel}>{now.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>

        {/* Metric Cards */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIconBg, { backgroundColor: Colors.secondary + '15' }]}>
              <Icon name="trending-down" size={20} color={Colors.secondary} />
            </View>
            <Text style={styles.metricLabel}>Income</Text>
            <Text style={styles.metricValue}>{formatCurrency(monthTotalIncome)}</Text>
            <Text style={styles.metricCount}>{monthIncomes.length} entries</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={[styles.metricIconBg, { backgroundColor: Colors.tertiary + '15' }]}>
              <Icon name="trending-up" size={20} color={Colors.tertiary} />
            </View>
            <Text style={styles.metricLabel}>Expense</Text>
            <Text style={styles.metricValue}>{formatCurrency(monthTotalExpense)}</Text>
            <Text style={styles.metricCount}>{monthExpenses.length} entries</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={[styles.metricIconBg, { backgroundColor: monthSavings >= 0 ? Colors.secondary + '15' : Colors.warning + '15' }]}>
              <Icon name="wallet" size={20} color={monthSavings >= 0 ? Colors.secondary : Colors.warning} />
            </View>
            <Text style={styles.metricLabel}>Savings</Text>
            <Text style={[styles.metricValue, { color: monthSavings >= 0 ? Colors.secondary : Colors.warning }]}>{formatCurrency(monthSavings)}</Text>
            <Text style={styles.metricCount}>{monthSavings >= 0 ? 'Positive' : 'Negative'}</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={[styles.metricIconBg, { backgroundColor: Colors.primary + '15' }]}>
              <Icon name="trophy" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.metricLabel}>Top Category</Text>
            <Text style={styles.metricValueTop}>{topCategory}</Text>
            {sortedBreakdown[0] && <Text style={styles.metricCount}>{formatCurrency(sortedBreakdown[0][1])}</Text>}
          </View>
        </View>

        {/* Expense Breakdown */}
        {sortedBreakdown.length > 0 && (
          <View style={styles.breakdownSection}>
            <Text style={styles.breakdownTitle}>Expense Breakdown</Text>
            {sortedBreakdown.map(([cat, amount]) => (
              <View key={cat} style={styles.breakdownRow}>
                <Text style={styles.breakdownCategory}>{cat}</Text>
                <View style={styles.breakdownBarBg}>
                  <View style={[styles.breakdownBar, { width: `${(amount / monthTotalExpense) * 100}%` }]} />
                </View>
                <Text style={styles.breakdownAmount}>{formatCurrency(amount)}</Text>
              </View>
            ))}
          </View>
        )}

        {monthExpenses.length === 0 && monthIncomes.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptySubtitle}>No data for this period</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>Reports</Text>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBarContainer}>
        {TABS.map(tab => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tabBarItem, activeTab === tab.key && styles.tabBarItemActive]}
          >
            <Text style={[styles.tabBarText, activeTab === tab.key && styles.tabBarTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'reports' && renderReports()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  loadingText: { fontSize: 15, fontFamily: Fonts.family.regular, color: Colors.outline },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: 56,
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
  },
  headerCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: 56,
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.family.bold,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },

  // Tab bar
  tabBarContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.containerMargin,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: BorderRadius.xl,
    padding: 3,
    marginBottom: Spacing.md,
  },
  tabBarItem: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  tabBarItemActive: { backgroundColor: Colors.primary },
  tabBarText: {
    fontSize: 13,
    fontFamily: Fonts.family.semiBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.05,
  },
  tabBarTextActive: { color: Colors.onPrimary },

  // Content
  content: { flex: 1 },
  tabContent: { padding: Spacing.containerMargin, paddingBottom: 120 },

  // Chart toggle
  chartToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.xl,
    padding: 2,
    marginBottom: Spacing.md,
  },
  chartToggleTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  chartToggleTabActive: { backgroundColor: Colors.surfaceContainerLowest },
  chartToggleText: { fontSize: 12, fontFamily: Fonts.family.medium, color: Colors.onSurfaceVariant },
  chartToggleTextActive: { fontSize: 12, fontFamily: Fonts.family.semiBold, color: Colors.onSurface },

  // Chart card
  chartCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  noData: { fontSize: 14, fontFamily: Fonts.family.regular, color: Colors.outline, textAlign: 'center', paddingVertical: Spacing.xl },

  // Donut
  donutContainer: { paddingVertical: Spacing.sm },
  donutOuter: { gap: Spacing.sm },
  donutRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.xs },
  donutDot: { width: 10, height: 10, borderRadius: 5, marginRight: Spacing.sm },
  donutLabel: { flex: 1, fontSize: 14, fontFamily: Fonts.family.regular, color: Colors.onSurface },
  donutValue: { fontSize: 14, fontFamily: Fonts.family.semiBold, color: Colors.onSurface, marginRight: Spacing.sm },
  donutPercent: { fontSize: 12, fontFamily: Fonts.family.regular, color: Colors.outline },

  // Bar chart
  barChartContainer: {},
  legendRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  legendDotSmall: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, fontFamily: Fonts.family.regular, color: Colors.onSurfaceVariant },
  barChartGrid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160 },
  barColumn: { alignItems: 'center', flex: 1 },
  barGroup: { flexDirection: 'row', gap: 3, alignItems: 'flex-end', height: 130 },
  bar: { width: 10, borderRadius: 4 },
  barLabel: { fontSize: 10, fontFamily: Fonts.family.medium, color: Colors.outline, marginTop: Spacing.sm },

  // Compare
  compareContainer: { gap: Spacing.md },
  compareRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  compareLabel: { width: 60, fontSize: 13, fontFamily: Fonts.family.medium, color: Colors.onSurfaceVariant },
  compareBarBg: { flex: 1, height: 24, backgroundColor: Colors.surfaceContainer, borderRadius: BorderRadius.sm, overflow: 'hidden' },
  compareBar: { height: 24, borderRadius: BorderRadius.sm },
  compareValue: { width: 80, fontSize: 13, fontFamily: Fonts.family.bold, textAlign: 'right' },
  compareDivider: { height: 1, backgroundColor: Colors.outlineVariant },

  // Reports
  periodLabel: {
    fontSize: 16, fontFamily: Fonts.family.semiBold, color: Colors.onSurfaceVariant,
    textAlign: 'center', marginBottom: Spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md,
  },
  metricCard: {
    width: '48%', backgroundColor: Colors.surfaceContainerLowest, borderRadius: BorderRadius.xl,
    padding: Spacing.md,
  },
  metricIconBg: { width: 36, height: 36, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm },
  metricLabel: { fontSize: 11, fontFamily: Fonts.family.regular, color: Colors.outline, marginBottom: 2 },
  metricValue: { fontSize: 18, fontFamily: Fonts.family.bold, color: Colors.onSurface },
  metricValueTop: { fontSize: 18, fontFamily: Fonts.family.bold, color: Colors.onSurface },
  metricCount: { fontSize: 11, fontFamily: Fonts.family.regular, color: Colors.outline, marginTop: 2 },

  // Breakdown
  breakdownSection: { marginTop: Spacing.sm },
  breakdownTitle: { fontSize: 16, fontFamily: Fonts.family.semiBold, color: Colors.onSurface, marginBottom: Spacing.sm },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  breakdownCategory: { width: 70, fontSize: 12, fontFamily: Fonts.family.medium, color: Colors.onSurface },
  breakdownBarBg: { flex: 1, height: 6, backgroundColor: Colors.surfaceContainer, borderRadius: 3, marginHorizontal: Spacing.sm },
  breakdownBar: { height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  breakdownAmount: { width: 70, fontSize: 11, fontFamily: Fonts.family.semiBold, color: Colors.onSurface, textAlign: 'right' },

  // Empty
  emptyContainer: { alignItems: 'center', paddingVertical: 64 },
  emptyTitle: { fontSize: 18, fontFamily: Fonts.family.bold, color: Colors.onSurface, marginBottom: Spacing.sm },
  emptySubtitle: { fontSize: 14, fontFamily: Fonts.family.regular, color: Colors.outline, textAlign: 'center' },
});

export default AnalyticsScreen;
