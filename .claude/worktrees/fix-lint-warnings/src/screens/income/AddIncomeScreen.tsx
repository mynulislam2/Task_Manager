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
import { useDispatch } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { FinanceStackParamList } from '../../navigation/FinanceStackNavigator';
import { incomeService } from '../../services/db/IncomeService';
import { addIncome, updateIncome } from '../../store/incomeSlice';
import { handleError } from '../../utils/errorHandler';
import { showToast } from '../../utils/toast';
import { useAuth } from '../../hooks/useAuth';

type Nav = any;
type RouteT = RouteProp<FinanceStackParamList, 'AddIncome'>;

const CATEGORIES = [
  { key: 'Salary', icon: 'cash-outline' },
  { key: 'Bonus', icon: 'gift-outline' },
  { key: 'Freelance', icon: 'laptop-outline' },
  { key: 'Gift', icon: 'gift-outline' },
  { key: 'Invest', icon: 'trending-up-outline' },
];

const AddIncomeScreen = () => {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteT>();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const editId = (route.params as any)?.incomeId;

  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!editId);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditing = !!editId;

  useEffect(() => {
    if (!editId) return;
    incomeService
      .getById(editId)
      .then(data => {
        if (data) {
          setSource(data.source);
          setAmount(String(data.amount));
          setDate(new Date(data.date));
          setNotes(data.notes || '');
        }
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, [editId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!source.trim()) e.source = 'Source is required';
    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0)
      e.amount = 'Valid amount required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;
    setLoading(true);
    try {
      const incomeData = {
        user_id: user.id,
        source: source.trim(),
        amount: Number(amount),
        date: date.toISOString().split('T')[0],
        notes: notes.trim() || undefined,
      };
      if (isEditing && editId) {
        await incomeService.update(editId, incomeData);
        dispatch(
          updateIncome({ ...incomeData, id: editId, created_at: new Date().toISOString() } as any),
        );
        showToast('Income updated', 'success');
      } else {
        const result = await incomeService.create(incomeData);
        dispatch(addIncome(result));
        showToast('Income added', 'success');
      }
      nav.goBack();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={() => nav.goBack()} style={styles.closeBtn}>
            <Icon name="close" size={20} color={Colors.onSurface} />
          </Pressable>
          <Text style={styles.title}>Edit Income</Text>
          <View style={{ width: 40 }} />
        </View>
      </KeyboardAvoidingView>
    );
  }

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
          <Text style={styles.title}>{isEditing ? 'Edit Income' : 'Add Income'}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Amount */}
        <Input
          label="Income Amount"
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

        {/* Source */}
        <Input
          label="Source"
          value={source}
          onChangeText={t => {
            setSource(t);
            if (errors.source)
              setErrors(p => {
                const n = { ...p };
                delete n.source;
                return n;
              });
          }}
          placeholder="Where is this income from?"
          error={errors.source}
        />

        {/* Quick Source */}
        <Text style={styles.fieldLabel}>Quick Source</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(c => (
            <Pressable
              key={c.key}
              onPress={() => setSource(c.key)}
              style={[styles.categoryItem, source === c.key && styles.categoryItemActive]}
            >
              <View style={[styles.categoryIcon, source === c.key && styles.categoryIconActive]}>
                <Icon
                  name={c.icon}
                  size={18}
                  color={source === c.key ? Colors.white : Colors.onSurfaceVariant}
                />
              </View>
              <Text style={[styles.categoryLabel, source === c.key && styles.categoryLabelActive]}>
                {c.key}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Date */}
        <Text style={styles.fieldLabel}>Date</Text>
        <Pressable onPress={() => setShowDate(true)} style={styles.pickerBtn}>
          <Text style={styles.pickerBtnText}>{date.toLocaleDateString()}</Text>
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

        {/* Notes */}
        <Input
          label="Notes (Optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Add more details..."
          multiline
        />

        {/* Motivational */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationTitle}>Grow your wealth</Text>
          <Text style={styles.motivationText}>
            Tracking every dollar brings you closer to financial freedom.
          </Text>
        </View>

        {/* Submit */}
        <View style={styles.submitSection}>
          <Button
            title={isEditing ? 'Update Income' : 'Save Income'}
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

  amountSection: { alignItems: 'center', paddingVertical: Spacing.lg, marginBottom: Spacing.md },
  amountLabel: {
    fontSize: 12,
    fontFamily: Fonts.family.semiBold,
    color: Colors.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.1,
    marginBottom: Spacing.sm,
  },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  amountPrefix: {
    fontSize: 36,
    fontFamily: Fonts.family.bold,
    color: Colors.primary,
    marginRight: Spacing.xs,
  },
  amountInput: {
    fontSize: 36,
    fontFamily: Fonts.family.bold,
    color: Colors.onSurface,
    textAlign: 'left',
    minWidth: 150,
    paddingVertical: 0,
  },

  fieldLabel: {
    fontSize: 13,
    fontFamily: Fonts.family.semiBold,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.05,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  categoryGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  categoryItem: {
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceContainer + '50',
    flex: 1,
  },
  categoryItemActive: { backgroundColor: Colors.primaryContainer + '15' },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  categoryIconActive: { backgroundColor: Colors.primaryContainer },
  categoryEmoji: { fontSize: 16 },
  categoryLabel: { fontSize: 10, fontFamily: Fonts.family.medium, color: Colors.onSurfaceVariant },
  categoryLabelActive: { fontSize: 10, fontFamily: Fonts.family.semiBold, color: Colors.primary },

  row: { flexDirection: 'row', gap: Spacing.md },
  halfField: { flex: 1 },
  pickerBtn: {
    backgroundColor: Colors.surfaceContainerLow,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  pickerBtnText: { fontSize: 15, fontFamily: Fonts.family.medium, color: Colors.onSurface },

  motivationCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.md,
  },
  motivationTitle: {
    fontSize: 16,
    fontFamily: Fonts.family.bold,
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  motivationText: {
    fontSize: 13,
    fontFamily: Fonts.family.regular,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },

  submitSection: { marginTop: Spacing.md },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    fontFamily: Fonts.family.regular,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
});

export default AddIncomeScreen;
