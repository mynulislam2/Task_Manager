import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { FinanceStackParamList } from '../../navigation/FinanceStackNavigator';
import { expenseService } from '../../services/db/ExpenseService';
import { removeExpense } from '../../store/expenseSlice';
import { handleError } from '../../utils/errorHandler';
import { showToast } from '../../utils/toast';
import { formatCurrency } from '../../utils';
import { format } from 'date-fns';
import { Expense } from '../../types';

type Nav = NativeStackNavigationProp<FinanceStackParamList, 'ExpenseDetails'>;
type RouteT = RouteProp<FinanceStackParamList, 'ExpenseDetails'>;

const CATEGORY_ICON: Record<string, string> = {
  Food: 'restaurant-outline', Transport: 'car-outline', Shopping: 'cart-outline', Bills: 'document-text-outline',
  Health: 'medkit-outline', Entertainment: 'film-outline', Other: 'ellipsis-horizontal-circle-outline',
};

const ExpenseDetailsScreen = () => {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteT>();
  const dispatch = useDispatch();
  const { expenseId } = route.params;
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    expenseService.getById(expenseId).then(data => { setExpense(data); setLoading(false); });
  }, [expenseId]);

  const handleDelete = async () => {
    try {
      await expenseService.delete(expenseId);
      dispatch(removeExpense(expenseId));
      showToast('Expense deleted', 'success');
      nav.goBack();
    } catch (err) { handleError(err); }
    setShowDeleteModal(false);
  };

  if (loading || !expense) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const iconName = CATEGORY_ICON[expense.category] || 'ellipsis-horizontal-circle-outline';

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()} style={styles.backBtn}>
          <Icon name="chevron-back" size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scroll}>
        <LinearGradient
          colors={[Colors.primaryContainer + '40', Colors.surface]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.heroCard}
        >
          <View style={[styles.heroIcon, { backgroundColor: Colors.primaryContainer + '25' }]}>
            <Icon name={iconName} size={28} color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>{expense.title}</Text>
          <Text style={[styles.heroAmount, { color: Colors.primary }]}>
            -{formatCurrency(expense.amount)}
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>COMPLETED</Text>
          </View>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Transaction Details</Text>

          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Icon name="folder-outline" size={16} color={Colors.primary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Category</Text>
              <Text style={styles.rowValue}>{expense.category}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Icon name="calendar-outline" size={16} color={Colors.primary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Date</Text>
              <Text style={styles.rowValue}>{format(new Date(expense.date), 'MMM dd, yyyy')}</Text>
            </View>
          </View>

          {expense.payment_method && (
            <>
              <View style={styles.divider} />
              <View style={styles.row}>
                <View style={styles.rowIcon}>
                  <Icon name="card-outline" size={16} color={Colors.primary} />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowLabel}>Payment Method</Text>
                  <Text style={styles.rowValue}>{expense.payment_method}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {expense.notes && (
          <View style={styles.card}>
            <View style={styles.notesHeader}>
              <Icon name="document-text-outline" size={16} color={Colors.primary} />
              <Text style={styles.notesTitle}>Notes</Text>
            </View>
            <Text style={styles.notesText}>{expense.notes}</Text>
          </View>
        )}

        <Text style={styles.auditText}>Created {format(new Date(expense.created_at), 'MMM dd, yyyy')}</Text>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Spacing.md + insets.bottom }]}>
        <Pressable onPress={() => (nav as any).navigate('AddExpense', { expenseId })} style={styles.editBtn}>
          <Icon name="pencil-outline" size={18} color={Colors.onPrimary} />
          <Text style={styles.editBtnText}>  Edit</Text>
        </Pressable>
        <Pressable onPress={() => setShowDeleteModal(true)} style={styles.deleteBtn}>
          <Icon name="trash-outline" size={20} color={Colors.onErrorContainer} />
        </Pressable>
      </View>

      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Expense"
        message="Are you sure you want to delete this expense?"
        confirmText="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background, paddingBottom: 80 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.containerMargin, paddingTop: 56, paddingBottom: Spacing.md, marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
  },
  backBtn: { width: 40, height: 40, borderRadius: BorderRadius.full, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surfaceContainerHigh + '50' },
  headerTitle: { fontSize: 18, fontFamily: Fonts.family.bold, color: Colors.primary },

  scrollArea: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.containerMargin, paddingBottom: Spacing.lg },

  heroCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  heroIcon: { width: 56, height: 56, borderRadius: BorderRadius.full, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  heroTitle: { fontSize: 20, fontFamily: Fonts.family.bold, color: Colors.onSurface, marginBottom: Spacing.xs },
  heroAmount: { fontSize: 28, fontFamily: Fonts.family.bold, marginBottom: Spacing.md },
  statusBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, backgroundColor: Colors.surfaceContainerHigh, borderRadius: BorderRadius.md },
  statusText: { fontSize: 11, fontFamily: Fonts.family.semiBold, color: Colors.onSurfaceVariant, letterSpacing: 0.05 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: 12, fontFamily: Fonts.family.semiBold, color: Colors.outline,
    textTransform: 'uppercase', letterSpacing: 0.05, marginBottom: Spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowIcon: { width: 32, height: 32, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 12, fontFamily: Fonts.family.regular, color: Colors.onSurfaceVariant },
  rowValue: { fontSize: 15, fontFamily: Fonts.family.semiBold, color: Colors.onSurface, marginTop: 1 },
  divider: { height: 1, backgroundColor: Colors.surfaceContainerHigh, marginVertical: Spacing.md },

  notesHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  notesTitle: { fontSize: 12, fontFamily: Fonts.family.semiBold, color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.05 },
  notesText: { fontSize: 14, fontFamily: Fonts.family.regular, color: Colors.onSurface, lineHeight: 20 },

  auditText: { fontSize: 11, fontFamily: Fonts.family.regular, color: Colors.outline, textAlign: 'center', marginVertical: Spacing.lg },

  bottomBar: {
    flexDirection: 'row', gap: Spacing.sm,
    paddingHorizontal: Spacing.containerMargin, paddingTop: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
  },
  editBtn: {
    flex: 1, backgroundColor: Colors.primary, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
  },
  editBtnText: { fontSize: 14, fontFamily: Fonts.family.semiBold, color: Colors.onPrimary },
  deleteBtn: {
    paddingHorizontal: Spacing.lg, backgroundColor: Colors.errorContainer + '50', borderRadius: BorderRadius.md,
    justifyContent: 'center', alignItems: 'center', flexDirection: 'row',
  },
});

export default ExpenseDetailsScreen;
