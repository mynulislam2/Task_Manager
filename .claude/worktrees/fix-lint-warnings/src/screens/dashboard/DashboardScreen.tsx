import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { expenseService } from '../../services/db/ExpenseService';
import { incomeService } from '../../services/db/IncomeService';
import { budgetService } from '../../services/db/BudgetService';
import { useAuth } from '../../hooks/useAuth';
import useRecurringAutoGen from '../../hooks/useRecurringAutoGen';
import { formatCurrency } from '../../utils';
import { startOfMonth, endOfMonth } from 'date-fns';
import TransactionRow from '../../components/transaction/TransactionRow';
import { Expense, Income, Budget } from '../../types';
import { HomeStackParamList } from '../../navigation/HomeStackNavigator';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'HomeDashboard'>;

interface TransactionItem {
  id: string;
  title: string;
  amount: number;
  date: string;
  category?: string;
  type: 'expense' | 'income';
}

const DashboardScreen = () => {
  const nav = useNavigation<Nav>();
  const rootNav = useNavigation<any>();
  const { user } = useAuth();
  useRecurringAutoGen(user?.id);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<TransactionItem[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (!user) return;
      if (!isRefresh && expenses.length === 0) setLoading(true);
      const now = new Date();
      const monthStart = startOfMonth(now).toISOString().split('T')[0];
      const monthEnd = endOfMonth(now).toISOString().split('T')[0];

      const [allExpenses, allIncomes, userBudgets] = await Promise.all([
        expenseService.getAll(user.id),
        incomeService.getAll(user.id),
        budgetService.getAll(user.id),
      ]);

      setExpenses(allExpenses);

      const monthExpenses = allExpenses.filter(
        (e: Expense) => e.date >= monthStart && e.date <= monthEnd,
      );
      const monthIncomes = allIncomes.filter(
        (i: Income) => i.date >= monthStart && i.date <= monthEnd,
      );

      setTotalExpense(monthExpenses.reduce((s: number, e: Expense) => s + e.amount, 0));
      setTotalIncome(monthIncomes.reduce((s: number, i: Income) => s + i.amount, 0));

      const allTransactions: TransactionItem[] = [
        ...allExpenses.map((e: Expense) => ({ ...e, type: 'expense' as const, title: e.title })),
        ...allIncomes.map((i: Income) => ({
          ...i,
          type: 'income' as const,
          title: i.source,
          category: i.source,
        })),
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      setRecentTransactions(allTransactions);
      setBudgets(userBudgets);
      setLoading(false);
      setRefreshing(false);

      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    },
    [user, fadeAnim, expenses.length],
  );

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true);
  }, [loadData]);

  const balance = useMemo(() => totalIncome - totalExpense, [totalIncome, totalExpense]);
  const topCategory = useMemo(() => {
    if (expenses.length === 0) return '—';
    const cats: Record<string, number> = {};
    expenses.forEach(e => {
      cats[e.category] = (cats[e.category] || 0) + e.amount;
    });
    return Object.entries(cats).sort(([, a], [, b]) => b - a)[0][0];
  }, [expenses]);
  const greeting = getGreeting();

  const getBudgetProgress = (budget: Budget) => {
    const spent = expenses
      .filter(e => e.category === budget.category)
      .reduce((s, e) => s + e.amount, 0);
    const percent = budget.limit_amount > 0 ? (spent / budget.limit_amount) * 100 : 0;
    return { spent, percent: Math.min(percent, 100), overBudget: percent > 100 };
  };

  return (
    <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.appName}>FinTrack</Text>
          </View>
          <Pressable onPress={() => rootNav.navigate('Profile')}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AF</Text>
            </View>
          </Pressable>
        </View>

        {/* Welcome Onboarding */}
        {budgets.length === 0 && expenses.length === 0 && totalIncome === 0 && (
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>Welcome to FinTrack! 👋</Text>
            <Text style={styles.welcomeText}>
              Start by adding your first income or expense, then create a budget to track your
              spending.
            </Text>
          </View>
        )}

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceAccent1} />
          <View style={styles.balanceAccent2} />
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={[styles.balanceAmount, { color: Colors.onPrimary }]}>
            {formatCurrency(balance)}
          </Text>
        </View>
        {/* Summary Cards Row */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View
              style={[styles.summaryIcon, { backgroundColor: Colors.secondaryContainer + '20' }]}
            >
              <Icon name="trending-down" size={20} color={Colors.secondary} />
            </View>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryAmount, { color: Colors.secondary }]}>
              {formatCurrency(totalIncome)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: Colors.errorContainer + '40' }]}>
              <Icon name="trending-up" size={20} color={Colors.tertiary} />
            </View>
            <Text style={styles.summaryLabel}>Expense</Text>
            <Text style={[styles.summaryAmount, { color: Colors.tertiary }]}>
              {formatCurrency(totalExpense)}
            </Text>
          </View>
        </View>

        {/* Second Row: Savings & Top Category */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View
              style={[
                styles.summaryIcon,
                { backgroundColor: (balance >= 0 ? Colors.secondary : Colors.warning) + '15' },
              ]}
            >
              <Icon
                name="wallet"
                size={20}
                color={balance >= 0 ? Colors.secondary : Colors.warning}
              />
            </View>
            <Text style={styles.summaryLabel}>Savings</Text>
            <Text
              style={[
                styles.summaryAmount,
                { color: balance >= 0 ? Colors.secondary : Colors.warning },
              ]}
            >
              {formatCurrency(Math.abs(balance))}
            </Text>
            <Text style={styles.summarySub}>{balance >= 0 ? 'Positive' : 'Negative'}</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: Colors.primary + '15' }]}>
              <Icon name="trophy" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.summaryLabel}>Top Category</Text>
            <Text style={[styles.summaryAmount, { color: Colors.onSurface, fontSize: 18 }]}>
              {topCategory}
            </Text>
          </View>
        </View>

        {/* Budget Overview */}
        {budgets.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Monthly Budgets</Text>
            </View>
            <View style={styles.summaryRow}>
              {budgets.slice(0, 2).map(b => {
                const { spent, percent, overBudget } = getBudgetProgress(b);
                return (
                  <LinearGradient
                    colors={['#ffffff', Colors.surfaceContainerLow]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.budgetCard}
                  >
                    <View
                      style={[
                        styles.budgetAccent1,
                        { backgroundColor: (overBudget ? Colors.tertiary : Colors.primary) + '08' },
                      ]}
                    />
                    <Text style={styles.budgetCardCategory}>{b.category}</Text>
                    <View style={styles.budgetProgressBg}>
                      <View
                        style={[
                          styles.budgetProgressFill,
                          {
                            width: `${Math.min(percent, 100)}%`,
                            backgroundColor: overBudget ? Colors.tertiary : Colors.primary,
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.budgetCardRow}>
                      <Text style={styles.budgetCardSpent}>
                        {formatCurrency(spent)}
                        <Text style={styles.budgetCardOf}>
                          {' '}
                          of {formatCurrency(b.limit_amount)}
                        </Text>
                      </Text>
                      <Text
                        style={[
                          styles.budgetBadgePct,
                          { color: overBudget ? Colors.tertiary : Colors.primary },
                        ]}
                      >
                        {Math.round(percent)}%
                      </Text>
                    </View>
                    <Text style={styles.budgetCardRemaining}>
                      {overBudget
                        ? 'Over budget!'
                        : `${formatCurrency(b.limit_amount - spent)} left`}
                    </Text>
                  </LinearGradient>
                );
              })}
            </View>
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Pressable onPress={() => nav.navigate('ViewAllTransactions')}>
              <Text style={styles.viewAll}>View All</Text>
            </Pressable>
          </View>
          <View style={styles.transactionList}>
            {recentTransactions.map((t: TransactionItem) => (
              <TransactionRow
                key={t.id}
                title={t.title}
                amount={t.amount}
                date={t.date}
                category={t.category}
                type={t.type}
                onPress={() => rootNav.navigate('Finance')}
              />
            ))}
            {recentTransactions.length === 0 && (
              <Text style={styles.empty}>No transactions yet</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 120 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 200,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: 56,
    paddingBottom: Spacing.md,
  },
  greeting: {
    fontSize: 14,
    fontFamily: Fonts.family.regular,
    color: Colors.onSurfaceVariant,
    marginBottom: 2,
  },
  appName: { fontSize: 20, fontFamily: Fonts.family.bold, color: Colors.primary },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 14, fontFamily: Fonts.family.bold, color: Colors.onPrimaryContainer },

  // Welcome
  welcomeCard: {
    marginHorizontal: Spacing.containerMargin,
    marginBottom: Spacing.md,
    backgroundColor: Colors.primaryContainer,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  welcomeTitle: {
    fontSize: 18,
    fontFamily: Fonts.family.bold,
    color: Colors.onPrimaryContainer,
    marginBottom: Spacing.sm,
  },
  welcomeText: {
    fontSize: 14,
    fontFamily: Fonts.family.regular,
    color: Colors.onPrimaryContainer,
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  welcomeActions: { flexDirection: 'row' },
  welcomeBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.onPrimaryContainer + '20',
    borderRadius: BorderRadius.lg,
  },
  welcomeBtnText: {
    fontSize: 13,
    fontFamily: Fonts.family.semiBold,
    color: Colors.onPrimaryContainer,
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },

  // Balance Card
  balanceCard: {
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.containerMargin,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  balanceAccent1: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.onPrimary + '15',
  },
  balanceAccent2: {
    position: 'absolute',
    bottom: -50,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.onPrimary + '08',
  },
  balanceLabel: {
    fontSize: 12,
    fontFamily: Fonts.family.semiBold,
    color: Colors.onPrimary + '80',
    textTransform: 'uppercase',
    letterSpacing: 0.15,
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    fontSize: 40,
    fontFamily: Fonts.family.bold,
    letterSpacing: -0.03,
    marginBottom: Spacing.md,
  },
  balanceActions: { flexDirection: 'row', gap: Spacing.sm, width: '100%' },
  balanceAction: {
    flex: 1,
    backgroundColor: Colors.onPrimary + '20',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  balanceActionText: {
    fontSize: 12,
    fontFamily: Fonts.family.semiBold,
    color: Colors.onPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
  balanceActionSecondary: {
    flex: 1,
    backgroundColor: Colors.primaryContainer,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  balanceActionSecondaryText: {
    fontSize: 12,
    fontFamily: Fonts.family.semiBold,
    color: Colors.onPrimaryContainer,
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },

  // Summary
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.containerMargin,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  summaryIconText: { fontSize: 20, fontFamily: Fonts.family.bold },
  summaryLabel: {
    fontSize: 11,
    fontFamily: Fonts.family.medium,
    color: Colors.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.05,
    marginBottom: 2,
  },
  summaryAmount: { fontSize: 22, fontFamily: Fonts.family.bold },
  summarySub: {
    fontSize: 11,
    fontFamily: Fonts.family.regular,
    color: Colors.outline,
    marginTop: 2,
  },

  // Section
  section: { paddingHorizontal: Spacing.containerMargin, marginBottom: Spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: 16, fontFamily: Fonts.family.semiBold, color: Colors.onSurface },
  sectionAction: { fontSize: 20, color: Colors.outline },

  // Budget
  budgetCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  budgetAccent1: {
    position: 'absolute',
    top: -20,
    right: -15,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  budgetCardCategory: {
    fontSize: 12,
    fontFamily: Fonts.family.semiBold,
    color: Colors.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.05,
    marginBottom: Spacing.sm,
  },
  budgetProgressBg: {
    height: 8,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  budgetProgressFill: { height: 8, borderRadius: 4 },
  budgetCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 2,
  },
  budgetCardSpent: { fontSize: 20, fontFamily: Fonts.family.bold, color: Colors.onSurface },
  budgetCardOf: { fontSize: 13, fontFamily: Fonts.family.regular, color: Colors.onSurfaceVariant },
  budgetBadgePct: { fontSize: 13, fontFamily: Fonts.family.semiBold },
  budgetCardRemaining: {
    fontSize: 11,
    fontFamily: Fonts.family.regular,
    color: Colors.onSurfaceVariant,
  },

  // Transactions
  transactionList: { borderRadius: BorderRadius.lg },
  viewAll: {
    fontSize: 13,
    fontFamily: Fonts.family.semiBold,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
  empty: {
    fontSize: 14,
    fontFamily: Fonts.family.regular,
    color: Colors.outline,
    textAlign: 'center',
    paddingVertical: Spacing.xl * 2,
  },
});

export default DashboardScreen;
