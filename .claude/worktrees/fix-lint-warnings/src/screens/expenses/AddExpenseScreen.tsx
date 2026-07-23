import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { FinanceStackParamList } from '../../navigation/FinanceStackNavigator';
import { expenseService } from '../../services/db/ExpenseService';
import { addExpense, updateExpense } from '../../store/expenseSlice';
import { handleError } from '../../utils/errorHandler';
import { showToast } from '../../utils/toast';
import { useAuth } from '../../hooks/useAuth';

type Nav = NativeStackNavigationProp<FinanceStackParamList, 'AddExpense'>;
type RouteT = RouteProp<FinanceStackParamList, 'AddExpense'>;

const CATEGORIES = [
  { key: 'Food', icon: 'restaurant-outline' },
  { key: 'Transport', icon: 'car-outline' },
  { key: 'Shopping', icon: 'cart-outline' },
  { key: 'Bills', icon: 'document-text-outline' },
  { key: 'Health', icon: 'medkit-outline' },
  { key: 'Entertainment', icon: 'film-outline' },
  { key: 'Recurring', icon: 'repeat-outline' },
  { key: 'Other', icon: 'ellipsis-horizontal-circle-outline' },
];

const PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Mobile Payment',
  'Other',
];

const AddExpenseScreen = () => {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteT>();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const editId = route.params?.expenseId;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [_fetching, setFetching] = useState(!!editId);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditing = !!editId;

  // Load existing data for editing
  useEffect(() => {
    if (!editId) return;
    expenseService
      .getById(editId)
      .then(data => {
        if (data) {
          setTitle(data.title);
          setAmount(String(data.amount));
          setCategory(data.category);
          setDate(new Date(data.date));
          setPaymentMethod(data.payment_method || '');
          setNotes(data.notes || '');
        }
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, [editId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0)
      e.amount = 'Valid amount required';
    if (!category) e.category = 'Select a category';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;
    setLoading(true);
    try {
      const expenseData = {
        user_id: user.id,
        title: title.trim(),
        amount: Number(amount),
        category,
        date: date.toISOString().split('T')[0],
        payment_method: paymentMethod || undefined,
        notes: notes.trim() || undefined,
      };
      if (isEditing && editId) {
        await expenseService.update(editId, expenseData);
        dispatch(
          updateExpense({
            ...expenseData,
            id: editId,
            created_at: new Date().toISOString(),
          } as any),
        );
        showToast('Expense updated', 'success');
      } else {
        const result = await expenseService.create(expenseData as any);
        dispatch(addExpense(result));
        showToast('Expense added', 'success');
      }
      nav.goBack();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => nav.goBack()} style={styles.closeBtn}>
            <Icon name="close" size={20} color={Colors.onSurface} />
          </Pressable>
          <Text style={styles.title}>{isEditing ? 'Edit Expense' : 'Add Expense'}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Amount */}
        <Input
          label="Expense Amount"
          value={amount}
          onChangeText={t => {
            setAmount(t);
            if (errors.amount)
              setErrors(p => {
                const n = { ...p };
                delete n.amount;
                return n;
              });
          }}
          keyboardType="numeric"
          prefix="$"
          error={errors.amount}
        />

        {/* Title */}
        <Input
          label="Title"
          value={title}
          onChangeText={t => {
            setTitle(t);
            if (errors.title)
              setErrors(p => {
                const n = { ...p };
                delete n.title;
                return n;
              });
          }}
          placeholder="What was this for?"
          error={errors.title}
        />

        {/* Category */}
        <Text style={styles.fieldLabel}>Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(c => (
            <Pressable
              key={c.key}
              onPress={() => {
                setCategory(c.key);
                if (errors.category)
                  setErrors(p => {
                    const n = { ...p };
                    delete n.category;
                    return n;
                  });
              }}
              style={[styles.categoryItem, category === c.key && styles.categoryItemActive]}
            >
              <View style={[styles.categoryIcon, category === c.key && styles.categoryIconActive]}>
                <Icon
                  name={c.icon}
                  size={20}
                  color={category === c.key ? Colors.white : Colors.onSurfaceVariant}
                />
              </View>
              <Text
                style={[styles.categoryLabel, category === c.key && styles.categoryLabelActive]}
              >
                {c.key}
              </Text>
            </Pressable>
          ))}
        </View>
        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

        {/* Date */}
        <Text style={styles.fieldLabel}>Date</Text>
        <Pressable onPress={() => setShowDate(true)} style={styles.dateBtn}>
          <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
        </Pressable>
        {showDate && (
          <DateTimePicker
            value={date}
            mode="date"
            onChange={(event: any, d?: Date) => {
              setShowDate(false);
              if (d) setDate(d);
            }}
          />
        )}

        {/* Payment Method */}
        <Text style={styles.fieldLabel}>Payment Method</Text>
        <View style={styles.paymentRow}>
          {PAYMENT_METHODS.map(m => (
            <Pressable
              key={m}
              onPress={() => setPaymentMethod(m)}
              style={[styles.paymentChip, paymentMethod === m && styles.paymentChipActive]}
            >
              <Text style={[styles.paymentText, paymentMethod === m && styles.paymentTextActive]}>
                {m}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Notes */}
        <Input
          label="Notes (Optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Add more details..."
          multiline
        />

        {/* Submit */}
        <View style={styles.submitSection}>
          <Button
            title={isEditing ? 'Update Expense' : 'Save Expense'}
            onPress={handleSubmit}
            loading={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.containerMargin, paddingTop: 56, paddingBottom: 120 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHigh + '50',
  },
  closeBtnText: { fontSize: 18, color: Colors.onSurface },
  title: { fontSize: 20, fontFamily: Fonts.family.bold, color: Colors.primary },
  helpBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpBtnText: { fontSize: 18, color: Colors.primary, fontFamily: Fonts.family.bold },

  fieldLabel: {
    fontSize: 13,
    fontFamily: Fonts.family.semiBold,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.05,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  categoryItem: {
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceContainer + '50',
    width: '23%',
  },
  categoryItemActive: { backgroundColor: Colors.primaryContainer + '15' },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  categoryIconActive: { backgroundColor: Colors.primaryContainer },
  categoryEmoji: { fontSize: 18 },
  categoryLabel: { fontSize: 11, fontFamily: Fonts.family.medium, color: Colors.onSurfaceVariant },
  categoryLabelActive: { fontSize: 11, fontFamily: Fonts.family.semiBold, color: Colors.primary },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    fontFamily: Fonts.family.regular,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  dateBtn: {
    backgroundColor: Colors.surfaceContainerLow,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  dateText: { fontSize: 15, fontFamily: Fonts.family.medium, color: Colors.onSurface },
  paymentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  paymentChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainerHigh + '50',
  },
  paymentChipActive: { backgroundColor: Colors.primary },
  paymentText: { fontSize: 12, fontFamily: Fonts.family.medium, color: Colors.onSurfaceVariant },
  paymentTextActive: { color: Colors.onPrimary },
  submitSection: { marginTop: Spacing.lg },
});

export default AddExpenseScreen;
