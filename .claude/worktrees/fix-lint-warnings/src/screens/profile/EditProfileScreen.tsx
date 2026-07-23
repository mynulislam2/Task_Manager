import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { BorderRadius, Spacing } from '../../constants/spacing';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { profileService } from '../../services/profile/ProfileService';
import { useAuth } from '../../hooks/useAuth';
import { setDefaultCurrency } from '../../utils';
import { handleError } from '../../utils/errorHandler';
import { showToast } from '../../utils/toast';
import { Profile } from '../../types';

const CURRENCIES = [
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { code: 'BDT', label: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { code: 'CNY', label: 'Chinese Yuan', symbol: '¥' },
  { code: 'KRW', label: 'South Korean Won', symbol: '₩' },
  { code: 'SGD', label: 'Singapore Dollar', symbol: 'S$' },
  { code: 'MYR', label: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'THB', label: 'Thai Baht', symbol: '฿' },
  { code: 'PHP', label: 'Philippine Peso', symbol: '₱' },
  { code: 'VND', label: 'Vietnamese Dong', symbol: '₫' },
  { code: 'PKR', label: 'Pakistani Rupee', symbol: '₨' },
  { code: 'LKR', label: 'Sri Lankan Rupee', symbol: 'Rs' },
  { code: 'NPR', label: 'Nepalese Rupee', symbol: '₨' },
  { code: 'AED', label: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', label: 'Saudi Riyal', symbol: '﷼' },
  { code: 'CHF', label: 'Swiss Franc', symbol: 'CHF' },
  { code: 'SEK', label: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', label: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', label: 'Danish Krone', symbol: 'kr' },
  { code: 'MXN', label: 'Mexican Peso', symbol: 'MX$' },
  { code: 'BRL', label: 'Brazilian Real', symbol: 'R$' },
  { code: 'ZAR', label: 'South African Rand', symbol: 'R' },
  { code: 'TRY', label: 'Turkish Lira', symbol: '₺' },
  { code: 'RUB', label: 'Russian Ruble', symbol: '₽' },
  { code: 'PLN', label: 'Polish Zloty', symbol: 'zł' },
];

const EditProfileScreen = () => {
  const nav = useNavigation();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    profileService.get(user.id).then((data: Profile | null) => {
      if (data) {
        setName(data.name || '');
        setCurrency(data.currency || 'USD');
      }
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [user]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !user) return;
    setLoading(true);
    try {
      await profileService.update(user.id, { name: name.trim(), currency });
      setDefaultCurrency(currency);
      showToast('Profile updated', 'success');
      nav.goBack();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => nav.goBack()} style={styles.closeBtn}>
            <Icon name="close" size={20} color={Colors.onSurface} />
          </Pressable>
          <Text style={styles.title}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <Input
          label="Full Name"
          value={name}
          onChangeText={t => { setName(t); if (errors.name) setErrors(p => { const n = { ...p }; delete n.name; return n; }); }}
          error={errors.name}
        />

        <Text style={styles.fieldLabel}>Currency</Text>
        <View style={styles.chipRow}>
          {CURRENCIES.map(c => (
            <Pressable
              key={c.code}
              onPress={() => setCurrency(c.code)}
              style={[styles.chip, currency === c.code && styles.chipActive]}
            >
              <Text style={[styles.chipSymbol, currency === c.code && { color: Colors.onPrimary }]}>{c.symbol}</Text>
              <Text style={[styles.chipText, currency === c.code && styles.chipTextActive]}>{c.code}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.submitSection}>
          <Button title="Save Changes" onPress={handleSave} loading={loading} />
          <Button title="Cancel" onPress={() => nav.goBack()} variant="outline" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.containerMargin, paddingTop: 56 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  loadingText: { fontSize: 15, fontFamily: Fonts.family.regular, color: Colors.outline },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  closeBtn: { width: 40, height: 40, borderRadius: BorderRadius.full, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surfaceContainerHigh + '50' },
  closeBtnText: { fontSize: 18, color: Colors.onSurface },
  title: { fontSize: 20, fontFamily: Fonts.family.bold, color: Colors.primary },
  fieldLabel: {
    fontSize: 13, fontFamily: Fonts.family.semiBold, color: Colors.onSurfaceVariant,
    textTransform: 'uppercase', letterSpacing: 0.05, marginBottom: Spacing.sm, marginTop: Spacing.md,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, backgroundColor: Colors.surfaceContainerHigh + '50', alignItems: 'center', gap: 2 },
  chipActive: { backgroundColor: Colors.primary },
  chipSymbol: { fontSize: 11, fontFamily: Fonts.family.regular, color: Colors.onSurfaceVariant },
  chipText: { fontSize: 11, fontFamily: Fonts.family.semiBold, color: Colors.onSurfaceVariant },
  chipTextActive: { color: Colors.onPrimary },
  submitSection: { marginTop: Spacing.xl, gap: Spacing.sm },
});

export default EditProfileScreen;
