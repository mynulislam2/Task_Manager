import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import TransactionRow from './TransactionRow';

interface TransactionItem {
  id: string;
  title: string;
  subtitle?: string;
  amount: number;
  date: string;
  category?: string;
  type: 'expense' | 'income';
  onPress?: () => void;
}

interface TransactionListProps {
  data: TransactionItem[];
  loading?: boolean;
  emptyText?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  data,
  loading,
  emptyText,
  refreshing,
  onRefresh,
}) => {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TransactionRow
          title={item.title}
          subtitle={item.subtitle}
          amount={item.amount}
          date={item.date}
          category={item.category}
          type={item.type}
          onPress={item.onPress}
        />
      )}
      contentContainerStyle={data.length === 0 ? styles.emptyContainer : styles.list}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.emptyText}>{emptyText || 'No data available'}</Text>
        </View>
      }
      showsVerticalScrollIndicator={false}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

const styles = StyleSheet.create({
  list: { paddingBottom: Spacing.md },
  center: { justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.xl * 2 },
  emptyContainer: { flexGrow: 1 },
  emptyText: { fontSize: 14, fontFamily: Fonts.family.regular, color: Colors.outline },
});

export default TransactionList;
