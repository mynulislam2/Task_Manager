import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import TransactionList from '../../components/transaction/TransactionList';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { FinanceStackParamList } from '../../navigation/FinanceStackNavigator';
import { expenseService } from '../../services/db/ExpenseService';
import { incomeService } from '../../services/db/IncomeService';
import { setExpenses, setLoading as setExpenseLoading } from '../../store/expenseSlice';
import { setIncomes, setLoading as setIncomeLoading } from '../../store/incomeSlice';
import { RootState } from '../../store';
import { useAuth } from '../../hooks/useAuth';
import { handleError } from '../../utils/errorHandler';
import { budgetService } from '../../services/db/BudgetService';
import { Budget } from '../../types';

type Nav = NativeStackNavigationProp<FinanceStackParamList, 'FinanceHome'>;

type SegmentType = 'expenses' | 'income' | 'budgets';

const SEGMENTS: { key: SegmentType; label: string }[] = [
  { key: 'expenses', label: 'Expenses' },
  { key: 'income', label: 'Income' },
  { key: 'budgets', label: 'Budgets' },
];

const CATEGORIES = [
  'All',
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Health',
  'Entertainment',
  'Other',
];

const ExpenseListScreen = () => {
  const nav = useNavigation<Nav>();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { items: expenses, loading: expensesLoading } = useSelector((s: RootState) => s.expenses);
  const { items: incomes, loading: incomesLoading } = useSelector((s: RootState) => s.incomes);

  const [segment, setSegment] = useState<SegmentType>('expenses');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetsLoading, setBudgetsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const fetchAll = useCallback(async () => {
    if (!user) return;
    dispatch(setExpenseLoading(true));
    dispatch(setIncomeLoading(true));
    setBudgetsLoading(true);
    try {
      const [e, i, b] = await Promise.all([
        expenseService.getAll(user.id),
        incomeService.getAll(user.id),
        budgetService.getAll(user.id),
      ]);
      dispatch(setExpenses(e));
      dispatch(setIncomes(i));
      setBudgets(b);
    } catch (err) {
      handleError(err);
    } finally {
      dispatch(setExpenseLoading(false));
      dispatch(setIncomeLoading(false));
      setBudgetsLoading(false);
    }
  }, [user, dispatch]);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  }, [fetchAll]);

  const switchSegment = (key: SegmentType) => {
    setSegment(key);
    setSearch('');
    setCategoryFilter('All');
    Animated.spring(slideAnim, {
      toValue: SEGMENTS.findIndex(s => s.key === key),
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  };

  const handleAdd = () => {
    const screen =
      segment === 'expenses' ? 'AddExpense' : segment === 'income' ? 'AddIncome' : 'CreateBudget';
    nav.navigate(screen as any);
  };

  const filteredExpenses = useMemo(() => {
    let data = expenses;
    if (search) data = data.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));
    if (categoryFilter !== 'All') data = data.filter(e => e.category === categoryFilter);
    return data;
  }, [expenses, search, categoryFilter]);

  const filteredIncomes = useMemo(() => {
    let data = incomes;
    if (search) data = data.filter(i => i.source.toLowerCase().includes(search.toLowerCase()));
    return data;
  }, [incomes, search]);

  const isLoading =
    segment === 'expenses'
      ? expensesLoading
      : segment === 'income'
      ? incomesLoading
      : budgetsLoading;

  const renderSegmentContent = () => {
    if (segment === 'expenses') {
      return (
        <TransactionList
          data={filteredExpenses.map(e => ({
            id: e.id,
            title: e.title,
            subtitle: e.category,
            amount: e.amount,
            date: e.date,
            category: e.category,
            type: 'expense' as const,
            onPress: () => nav.navigate('ExpenseDetails', { expenseId: e.id }),
          }))}
          loading={isLoading}
          refreshing={refreshing}
          onRefresh={onRefresh}
          emptyText="No expenses yet"
        />
      );
    }
    if (segment === 'income') {
      return (
        <TransactionList
          data={filteredIncomes.map(i => ({
            id: i.id,
            title: i.source,
            subtitle: 'Income',
            amount: i.amount,
            date: i.date,
            category: i.source,
            type: 'income' as const,
            onPress: () => nav.navigate('IncomeDetail', { incomeId: i.id }),
          }))}
          loading={isLoading}
          refreshing={refreshing}
          onRefresh={onRefresh}
          emptyText="No income yet"
        />
      );
    }
    return (
      <TransactionList
        data={budgets.map(b => ({
          id: b.id,
          title: b.category,
          subtitle: `Limit: $${b.limit_amount} • ${b.month}`,
          amount: b.limit_amount,
          date: b.month + '-01',
          category: b.category,
          type: 'expense' as const,
          onPress: () => nav.navigate('CreateBudget', { budgetId: b.id }),
        }))}
        loading={isLoading}
        refreshing={refreshing}
        onRefresh={onRefresh}
        emptyText="No budgets yet"
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Finance</Text>
        <Pressable onPress={handleAdd} style={styles.addBtn}>
          <Icon name="add" size={24} color={Colors.primary} />
        </Pressable>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentContainer}>
        <View style={styles.segmentBg}>
          {SEGMENTS.map((s, _idx) => (
            <Pressable
              key={s.key}
              onPress={() => switchSegment(s.key)}
              style={[styles.segmentTab, segment === s.key && styles.segmentTabActive]}
            >
              <Text style={[styles.segmentText, segment === s.key && styles.segmentTextActive]}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={18} color={Colors.outline} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${segment}...`}
          placeholderTextColor={Colors.outline + '60'}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category Filter (expenses only) */}
      {segment === 'expenses' && (
        <View style={styles.filterRow}>
          {CATEGORIES.map(c => (
            <Pressable
              key={c}
              onPress={() => setCategoryFilter(c)}
              style={[styles.filterChip, categoryFilter === c && styles.filterChipActive]}
            >
              <Text
                style={[styles.filterChipText, categoryFilter === c && styles.filterChipTextActive]}
              >
                {c}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* List */}
      <View style={styles.listContainer}>{renderSegmentContent()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.family.bold,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryContainer + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: { fontSize: 22, color: Colors.primary, fontFamily: Fonts.family.bold },
  segmentContainer: {
    paddingHorizontal: Spacing.containerMargin,
    marginBottom: Spacing.md,
  },
  segmentBg: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainer,
    borderRadius: BorderRadius.xl,
    padding: 3,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  segmentTabActive: {
    backgroundColor: Colors.primary,
  },
  segmentText: {
    fontSize: 13,
    fontFamily: Fonts.family.semiBold,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.05,
  },
  segmentTextActive: {
    color: Colors.onPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.containerMargin,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchIcon: { fontSize: 16, marginRight: Spacing.sm },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.family.regular,
    color: Colors.onSurface,
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.containerMargin,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainerHigh + '50',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: Fonts.family.medium,
    color: Colors.onSurfaceVariant,
  },
  filterChipTextActive: {
    color: Colors.onPrimary,
  },
  listContainer: { flex: 1, paddingHorizontal: Spacing.containerMargin },
  fab: {
    position: 'absolute',
    bottom: 96,
    right: Spacing.containerMargin,
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: { fontSize: 28, color: Colors.onPrimary, fontFamily: Fonts.family.bold, marginTop: -2 },
});

export default ExpenseListScreen;
