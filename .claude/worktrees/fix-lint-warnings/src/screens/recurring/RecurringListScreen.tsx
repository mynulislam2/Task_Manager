import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { recurringService } from '../../services/db/RecurringService';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, formatDate } from '../../utils';
import { handleError } from '../../utils/errorHandler';
import { showToast } from '../../utils/toast';
import { RecurringStackParamList } from '../../navigation/RecurringStackNavigator';
import { RecurringPayment } from '../../types';

type Nav = NativeStackNavigationProp<RecurringStackParamList, 'RecurringList'>;

const FREQUENCY_COLORS: Record<string, string> = {
  daily: '#0891B2',
  weekly: '#7C3AED',
  monthly: Colors.primary,
  yearly: Colors.tertiary,
};

const RecurringListScreen = () => {
  const nav = useNavigation<Nav>();
  const { user } = useAuth();
  const [payments, setPayments] = useState<RecurringPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<RecurringPayment | null>(null);

  const fetchPayments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await recurringService.getAll(user.id);
      setPayments(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { fetchPayments(); }, [fetchPayments]));

  const togglePause = async (payment: RecurringPayment) => {
    try {
      await recurringService.update(payment.id, { is_paused: !payment.is_paused });
      showToast(payment.is_paused ? 'Resumed' : 'Paused', 'success');
      fetchPayments();
    } catch (err) {
      handleError(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await recurringService.delete(deleteTarget.id);
      showToast('Recurring payment deleted', 'success');
      fetchPayments();
    } catch (err) { handleError(err); }
    setDeleteTarget(null);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const totalMonthly = payments
    .filter(p => !p.is_paused)
    .reduce((s, p) => s + p.amount, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.title}>Recurring</Text>
        <Pressable onPress={() => nav.navigate('AddRecurring')} style={styles.addBtn}>
          <Icon name="add" size={24} color={Colors.primary} />
        </Pressable>
      </View>

      {payments.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No recurring payments</Text>
          <Text style={styles.emptySubtitle}>Set up automated payments for bills and subscriptions</Text>
          <Pressable onPress={() => nav.navigate('AddRecurring')} style={styles.emptyBtn}>
            <Text style={styles.emptyBtnText}>+ Add Recurring</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Monthly Commitment</Text>
            <Text style={styles.summaryAmount}>{formatCurrency(totalMonthly)}</Text>
            <Text style={styles.summarySub}>Includes {payments.filter(p => !p.is_paused).length} active payments</Text>
          </View>

          {/* Payment Cards */}
          {payments.map(payment => {
            const handlePress = () => {
              (nav as any).navigate('RecurringDetail', { paymentId: payment.id });
            };
            const freqColor = FREQUENCY_COLORS[payment.frequency] || Colors.outline;
            const isOverdue = new Date(payment.next_date) < new Date();
            return (
              <Pressable key={payment.id} onPress={handlePress} style={[styles.card, payment.is_paused && styles.cardPaused]}>
                <View style={styles.cardRow}>
                  <View style={[styles.cardIcon, { backgroundColor: freqColor + '20' }]}>
                    <Icon
                      name={payment.frequency === 'monthly' ? 'calendar' : payment.frequency === 'weekly' ? 'calendar-clear' : payment.frequency === 'yearly' ? 'calendar' : 'timer-outline'}
                      size={22}
                      color={freqColor}
                    />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{payment.name}</Text>
                    <View style={styles.cardMetaRow}>
                      <View style={[styles.freqBadge, { backgroundColor: freqColor + '20' }]}>
                        <Text style={[styles.freqText, { color: freqColor }]}>{payment.frequency}</Text>
                      </View>
                      <Text style={styles.cardDue}>
                        {isOverdue ? 'Overdue' : `Due ${formatDate(payment.next_date)}`}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cardAmount}>{formatCurrency(payment.amount)}</Text>
                </View>
                <View style={styles.cardActions}>
                  <Pressable
                    onPress={() => togglePause(payment)}
                    style={[styles.actionBtn, { backgroundColor: payment.is_paused ? Colors.primary : Colors.warning + '20' }]}
                  >
                    <Icon name={payment.is_paused ? 'play' : 'pause'} size={16} color={payment.is_paused ? Colors.onPrimary : Colors.warning} style={{ marginRight: 4 }} />
                    <Text style={[styles.actionText, { color: payment.is_paused ? Colors.onPrimary : Colors.warning }]}>
                      {payment.is_paused ? 'Resume' : 'Pause'}
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => setDeleteTarget(payment)} style={[styles.actionBtn, { backgroundColor: Colors.errorContainer + '30' }]}>
                    <Icon name="trash-outline" size={16} color={Colors.onErrorContainer} style={{ marginRight: 4 }} />
                    <Text style={[styles.actionText, { color: Colors.onErrorContainer }]}>Delete</Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete Recurring"
        message={deleteTarget ? `Remove "${deleteTarget.name}"?` : ''}
        confirmText="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  loadingText: { fontSize: 15, fontFamily: Fonts.family.regular, color: Colors.outline },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.containerMargin, paddingTop: 56, paddingBottom: Spacing.md, marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
  },
  menuBtn: { width: 40, height: 40, borderRadius: BorderRadius.full, justifyContent: 'center', alignItems: 'center' },
  menuBtnText: { fontSize: 20 },
  title: { fontSize: 24, fontFamily: Fonts.family.bold, color: Colors.primary },
  addBtn: { width: 40, height: 40, borderRadius: BorderRadius.full, backgroundColor: Colors.primaryContainer + '20', justifyContent: 'center', alignItems: 'center' },
  addBtnText: { fontSize: 22, color: Colors.primary, fontFamily: Fonts.family.bold },
  list: { padding: Spacing.containerMargin, paddingBottom: 120 },

  // Summary
  summaryCard: {
    backgroundColor: Colors.primaryContainer, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, marginBottom: Spacing.md,
  },
  summaryLabel: { fontSize: 12, fontFamily: Fonts.family.semiBold, color: Colors.onPrimaryContainer + '80', textTransform: 'uppercase', letterSpacing: 0.1, marginBottom: Spacing.xs },
  summaryAmount: { fontSize: 28, fontFamily: Fonts.family.bold, color: Colors.onPrimaryContainer, marginBottom: Spacing.xs },
  summarySub: { fontSize: 12, fontFamily: Fonts.family.regular, color: Colors.onPrimaryContainer + '80' },

  // Card
  card: {
    backgroundColor: Colors.surfaceContainerLow, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm,
  },
  cardPaused: { opacity: 0.6 },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  cardIcon: { width: 44, height: 44, borderRadius: BorderRadius.sm, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  cardIconText: { fontSize: 20 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontFamily: Fonts.family.semiBold, color: Colors.onSurface, marginBottom: Spacing.xs },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  freqBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  freqText: { fontSize: 10, fontFamily: Fonts.family.semiBold, textTransform: 'uppercase' },
  cardDue: { fontSize: 11, fontFamily: Fonts.family.regular, color: Colors.outline },
  cardAmount: { fontSize: 17, fontFamily: Fonts.family.bold, color: Colors.tertiary },
  cardActions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm },
  actionText: { fontSize: 12, fontFamily: Fonts.family.semiBold },

  // Empty
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xl * 2 },
  emptyTitle: { fontSize: 20, fontFamily: Fonts.family.bold, color: Colors.onSurface, marginTop: Spacing.md },
  emptySubtitle: { fontSize: 14, fontFamily: Fonts.family.regular, color: Colors.outline, textAlign: 'center', marginTop: Spacing.sm, marginBottom: Spacing.lg },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, gap: Spacing.sm,
  },
  emptyBtnText: { fontSize: 15, fontFamily: Fonts.family.semiBold, color: Colors.onPrimary },
});

export default RecurringListScreen;
