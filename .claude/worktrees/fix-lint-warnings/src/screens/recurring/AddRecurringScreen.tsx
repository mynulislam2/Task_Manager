import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { recurringService } from '../../services/db/RecurringService';
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

const FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly'];

const AddRecurringScreen = () => {
  const nav = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const editId = (route.params as any)?.paymentId;
  const isEditing = !!editId;

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [startDate, setStartDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!editId || !user) return;
    recurringService.getById(editId, user.id).then(data => {
      if (data) {
        setName(data.name);
        setAmount(String(data.amount));
        setCategory(data.category);
        setFrequency(data.frequency);
        setStartDate(new Date(data.start_date));
      }
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [editId, user]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) e.amount = 'Enter a valid amount';
    if (!category) e.category = 'Select a category';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;
    setLoading(true);
    try {
      const dateStr = format(startDate, 'yyyy-MM-dd');
      const payload = {
        user_id: user.id,
        name: name.trim(),
        amount: Number(amount),
        category,
        frequency: frequency as 'daily' | 'weekly' | 'monthly' | 'yearly',
        start_date: dateStr,
        next_date: dateStr,
      };
      if (isEditing && editId) {
        await recurringService.update(editId, payload);
        showToast('Recurring payment updated', 'success');
      } else {
        await recurringService.create({ ...payload, is_paused: false });
        showToast('Recurring payment added', 'success');
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
          <Text style={styles.title}>Edit Recurring</Text>
          <View style={{ width: 40 }} />
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
          <Text style={styles.title}>{isEditing ? 'Edit Recurring' : 'Add Recurring'}</Text>
          <View style={{ width: 40 }} />
        </View>

        <Input
          label="Name"
          value={name}
          onChangeText={t => { setName(t); if (errors.name) setErrors(p => { const n = { ...p }; delete n.name; return n; }); }}
          placeholder="Subscription name"
          error={errors.name}
        />

        <Input
          label="Amount"
          value={amount}
          onChangeText={t => { setAmount(t); if (errors.amount) setErrors(p => { const n = { ...p }; delete n.amount; return n; }); }}
          keyboardType="numeric"
          prefix="$"
          error={errors.amount}
        />

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

        {/* Frequency */}
        <Text style={styles.fieldLabel}>Frequency</Text>
        <View style={styles.freqRow}>
          {FREQUENCIES.map(f => (
            <Pressable
              key={f}
              onPress={() => setFrequency(f)}
              style={[styles.freqChip, frequency === f && styles.freqChipActive]}
            >
              <Text style={[styles.freqText, frequency === f && styles.freqTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Date */}
        <Text style={styles.fieldLabel}>Start Date</Text>
        <Pressable onPress={() => setShowDate(true)} style={styles.dateBtn}>
          <Text style={styles.dateBtnText}>{format(startDate, 'MMM dd, yyyy')}</Text>
        </Pressable>
        {showDate && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(event: any, d?: Date) => { setShowDate(false); if (d) setStartDate(d); }}
          />
        )}

        <View style={styles.submitSection}>
          <Button title={isEditing ? 'Update Recurring' : 'Add Recurring Payment'} onPress={handleSubmit} loading={loading} />
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

  freqRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  freqChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceContainerHigh + '50', flex: 1, alignItems: 'center' },
  freqChipActive: { backgroundColor: Colors.primary },
  freqText: { fontSize: 13, fontFamily: Fonts.family.medium, color: Colors.onSurfaceVariant },
  freqTextActive: { color: Colors.onPrimary },

  dateBtn: { backgroundColor: Colors.surfaceContainerLow, padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.md },
  dateBtnText: { fontSize: 15, fontFamily: Fonts.family.medium, color: Colors.onSurface },

  submitSection: { marginTop: Spacing.xl },
});

export default AddRecurringScreen;
