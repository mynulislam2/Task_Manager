import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { budgetService } from '../../services/db/BudgetService';
import { addBudget, updateBudget } from '../../store/budgetSlice';
import { useAuth } from '../../hooks/useAuth';
import { handleError } from '../../utils/errorHandler';
import { showToast } from '../../utils/toast';
import { format } from 'date-fns';

const CATEGORIES = [
  { key: 'Food', icon: 'restaurant-outline' },
  { key: 'Transport', icon: 'car-outline' },
  { key: 'Shopping', icon: 'cart-outline' },
  { key: 'Bills', icon: 'document-text-outline' },
  { key: 'Health', icon: 'medkit-outline' },
  { key: 'Entertainment', icon: 'film-outline' },
  { key: 'Other', icon: 'ellipsis-horizontal-circle-outline' },
];

const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(2024, i, 1);
  return format(d, 'yyyy-MM');
});

const CreateBudgetScreen = () => {
  const nav = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const editId = (route.params as any)?.budgetId;
  const isEditing = !!editId;

  const [category, setCategory] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!editId) return;
    budgetService.getById(editId).then(data => {
      if (data) {
        setCategory(data.category);
        setLimitAmount(String(data.limit_amount));
        setMonth(data.month);
      }
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [editId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!category) e.category = 'Please select a category';
    if (!limitAmount || isNaN(Number(limitAmount)) || Number(limitAmount) <= 0) e.amount = 'Enter a valid amount';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;
    setLoading(true);
    try {
      const payload = { user_id: user.id, category, limit_amount: Number(limitAmount), month };
      if (isEditing && editId) {
        await budgetService.update(editId, payload);
        dispatch(updateBudget({ ...payload, id: editId, created_at: new Date().toISOString() } as any));
        showToast('Budget updated', 'success');
      } else {
        const result = await budgetService.create(payload);
        dispatch(addBudget(result));
        showToast('Budget created', 'success');
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
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={() => nav.goBack()} style={styles.closeBtn}>
            <Icon name="close" size={20} color={Colors.onSurface} />
          </Pressable>
          <Text style={styles.title}>Edit Budget</Text>
          <View style={styles.headerSpacer} />
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => nav.goBack()} style={styles.closeBtn}>
            <Icon name="close" size={20} color={Colors.onSurface} />
          </Pressable>
          <Text style={styles.title}>{isEditing ? 'Edit Budget' : 'Create Budget'}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Category */}
        <Text style={styles.fieldLabel}>Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(c => (
            <Pressable
              key={c.key}
              onPress={() => { setCategory(c.key); if (errors.category) setErrors(p => { const n = { ...p }; delete n.category; return n; }); }}
              style={[styles.categoryItem, category === c.key && styles.categoryItemActive]}
            >
              <View style={[styles.categoryIcon, category === c.key && styles.categoryIconActive]}>
                <Icon name={c.icon} size={20} color={category === c.key ? Colors.white : Colors.onSurfaceVariant} />
              </View>
              <Text style={[styles.categoryLabel, category === c.key && styles.categoryLabelActive]}>
                {c.key}
              </Text>
            </Pressable>
          ))}
        </View>
        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

        {/* Amount */}
        <Input
          label="Monthly Limit Amount"
          value={limitAmount}
          onChangeText={t => { setLimitAmount(t); if (errors.amount) setErrors(p => { const n = { ...p }; delete n.amount; return n; }); }}
          keyboardType="numeric"
          prefix="$"
          error={errors.amount}
        />

        {/* Month */}
        <Text style={styles.fieldLabel}>Start Month</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthRow}>
          {MONTHS.map(m => (
            <Pressable
              key={m}
              onPress={() => setMonth(m)}
              style={[styles.monthChip, month === m && styles.monthChipActive]}
            >
              <Text style={[styles.monthText, month === m && styles.monthTextActive]}>
                {format(new Date(m + '-01'), 'MMM yyyy')}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Submit */}
        <View style={styles.submitSection}>
          <Button title={isEditing ? 'Update Budget' : 'Create Budget'} onPress={handleSubmit} loading={loading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.containerMargin, paddingTop: 56, paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  closeBtn: { width: 40, height: 40, borderRadius: BorderRadius.full, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surfaceContainerHigh + '50' },
  closeBtnText: { fontSize: 18, color: Colors.onSurface },
  title: { fontSize: 20, fontFamily: Fonts.family.bold, color: Colors.primary },
  headerSpacer: { width: 40 },
  helpBtn: { width: 40, height: 40, borderRadius: BorderRadius.full, justifyContent: 'center', alignItems: 'center' },
  helpBtnText: { fontSize: 18, color: Colors.primary, fontFamily: Fonts.family.bold },

  fieldLabel: {
    fontSize: 13, fontFamily: Fonts.family.semiBold, color: Colors.onSurfaceVariant,
    textTransform: 'uppercase', letterSpacing: 0.05, marginBottom: Spacing.sm, marginTop: Spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm,
  },
  categoryItem: {
    alignItems: 'center', padding: Spacing.sm, borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceContainer + '50', width: '23%',
  },
  categoryItemActive: { backgroundColor: Colors.primaryContainer + '15' },
  categoryIcon: { width: 40, height: 40, borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceContainer, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xs },
  categoryIconActive: { backgroundColor: Colors.primaryContainer },
  categoryEmoji: { fontSize: 18 },
  categoryLabel: { fontSize: 11, fontFamily: Fonts.family.medium, color: Colors.onSurfaceVariant },
  categoryLabelActive: { fontSize: 11, fontFamily: Fonts.family.semiBold, color: Colors.primary },
  errorText: { fontSize: 12, color: Colors.error, fontFamily: Fonts.family.regular, marginBottom: Spacing.sm, marginLeft: Spacing.xs },

  monthRow: { marginBottom: Spacing.md },
  monthChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceContainerHigh + '50', marginRight: Spacing.sm },
  monthChipActive: { backgroundColor: Colors.primary },
  monthText: { fontSize: 13, fontFamily: Fonts.family.medium, color: Colors.onSurfaceVariant },
  monthTextActive: { color: Colors.onPrimary },

  submitSection: { marginTop: Spacing.xl },
});

export default CreateBudgetScreen;
