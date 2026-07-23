import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { HomeStackParamList } from '../../navigation/HomeStackNavigator';
import { expenseService } from '../../services/db/ExpenseService';
import { incomeService } from '../../services/db/IncomeService';
import { useAuth } from '../../hooks/useAuth';
import TransactionList from '../../components/transaction/TransactionList';
import { Expense, Income } from '../../types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'ViewAllTransactions'>;

interface TransactionItem {
  id: string;
  title: string;
  amount: number;
  date: string;
  category?: string;
  type: 'expense' | 'income';
  onPress?: () => void;
}

const ViewAllTransactionsScreen = () => {
  const nav = useNavigation<Nav>();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (!user) return;
      if (!isRefresh) setLoading(true);
      const [allExpenses, allIncomes] = await Promise.all([
        expenseService.getAll(user.id),
        incomeService.getAll(user.id),
      ]);
      const all: TransactionItem[] = [
        ...allExpenses.map((e: Expense) => ({
          id: e.id,
          title: e.title,
          amount: e.amount,
          date: e.date,
          category: e.category,
          type: 'expense' as const,
        })),
        ...allIncomes.map((i: Income) => ({
          id: i.id,
          title: i.source,
          amount: i.amount,
          date: i.date,
          type: 'income' as const,
          category: i.source,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(all);
      setLoading(false);
      setRefreshing(false);
    },
    [user],
  );

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()} style={styles.backBtn}>
          <Icon name="chevron-back" size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>All Transactions</Text>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.listContainer}>
        <TransactionList
          data={transactions}
          loading={loading}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadData(true);
          }}
          emptyText="No transactions yet"
        />
      </View>
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHigh + '50',
  },
  headerTitle: { fontSize: 20, fontFamily: Fonts.family.bold, color: Colors.primary },
  headerSpacer: { width: 40 },
  listContainer: { flex: 1, paddingHorizontal: Spacing.containerMargin },
});

export default ViewAllTransactionsScreen;
