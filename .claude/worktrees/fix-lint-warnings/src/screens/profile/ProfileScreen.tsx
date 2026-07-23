import React, { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsAndroid, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { ProfileStackParamList } from '../../navigation/ProfileStackNavigator';
import { profileService } from '../../services/profile/ProfileService';
import { authService } from '../../services/auth/AuthService';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../store/authSlice';
import { handleError } from '../../utils/errorHandler';
import ConfirmModal from '../../components/common/ConfirmModal';
import { setDefaultCurrency } from '../../utils';
import { showToast } from '../../utils/toast';
import { Profile } from '../../types';
import { scanSmsForTransactions } from '../../services/sms/SmsReader';
import { expenseService } from '../../services/db/ExpenseService';
import { incomeService } from '../../services/db/IncomeService';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfileView'>;

const ProfileScreen = () => {
  const nav = useNavigation<Nav>();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [_loading, setLoading] = useState(true);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [smsImportEnabled, setSmsImportEnabled] = useState(false);
  const SMS_KEY = 'sms_import_enabled';

  // Load saved state on mount
  React.useEffect(() => {
    AsyncStorage.getItem(SMS_KEY).then(val => {
      if (val === 'true') setSmsImportEnabled(true);
    });
  }, []);

  const setSmsEnabled = (enabled: boolean) => {
    setSmsImportEnabled(enabled);
    AsyncStorage.setItem(SMS_KEY, enabled ? 'true' : 'false');
  };

  const handleToggleSmsImport = async () => {
    try {
      if (Platform.OS !== 'android') {
        showToast('Android only', 'error');
        return;
      }

      if (smsImportEnabled) {
        setSmsEnabled(false);
        return;
      }

      // Small delay to ensure activity is attached
      await new Promise(r => setTimeout(r, 100));

      const permission = 'android.permission.READ_SMS';
      let granted: string;
      try {
        granted = await PermissionsAndroid.request(permission, {
          title: 'Enable SMS Import',
          message: 'Allow FinTrack to read SMS for auto-detecting bank/UPI transactions.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        });
      } catch {
        showToast('Please enable SMS permission in App Settings', 'error');
        return;
      }

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        showToast('Permission denied', 'error');
        return;
      }

      setSmsEnabled(true);

      if (!user) return;
      const result = await scanSmsForTransactions();

      if (result.smsError) {
        showToast(`SMS scan issue: ${result.smsError}`, 'error');
        return;
      }
      if (result.transactions.length === 0) {
        showToast(`Scanned ${result.smsRead} SMS, no transactions found`, 'info');
        return;
      }

      // Auto-import all detected transactions
      const names: string[] = [];
      for (const tx of result.transactions) {
        try {
          if (tx.type === 'expense') {
            await expenseService.create({
              user_id: user.id, title: tx.merchant || 'Auto-detected',
              amount: tx.amount, category: 'Other',
              date: tx.date.split('T')[0] || new Date().toISOString().split('T')[0],
              sms_hash: tx.smsHash, sms_body: tx.smsBody,
            });
          } else {
            await incomeService.create({
              user_id: user.id, source: tx.merchant || 'Auto-detected',
              amount: tx.amount, date: tx.date.split('T')[0] || new Date().toISOString().split('T')[0],
              sms_hash: tx.smsHash, sms_body: tx.smsBody,
            });
          }
          names.push(tx.merchant || 'Unknown');
        } catch {}
      }
      showToast(`Imported: ${names.join(', ')}`, 'success');
    } catch (e: any) {
      showToast('Error: ' + (e?.message || 'unknown'), 'error');
    }
  };

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await profileService.get(user.id);
      setProfile(data);
      if (data?.currency) setDefaultCurrency(data.currency);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { fetchProfile(); }, [fetchProfile]));

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      dispatch(logout());
      showToast('Signed out', 'info');
    } catch (err) { handleError(err); }
    setShowSignOutModal(false);
  };

  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { justifyContent: 'center' }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
          <Text style={styles.name}>{profile?.name || 'User'}</Text>
          <Text style={styles.email}>{profile?.email || user?.email || ''}</Text>
        </View>

        <View style={styles.settingsSection}>
          <Pressable style={styles.settingsRow} onPress={() => nav.navigate('EditProfile')}>
            <View style={styles.settingsIcon}>
              <Icon name="person-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.settingsContent}>
              <Text style={styles.settingsLabel}>Edit Profile</Text>
              <Text style={styles.settingsSub}>Update your name and preferences</Text>
            </View>
            <Text style={styles.settingsArrow}>›</Text>
          </Pressable>

          <Pressable style={styles.settingsRow} onPress={() => nav.navigate('EditProfile')}>
            <View style={styles.settingsIcon}>
              <Icon name="cash-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.settingsContent}>
              <Text style={styles.settingsLabel}>Currency Preference</Text>
              <Text style={styles.settingsSub}>Change your default currency</Text>
            </View>
            <View style={styles.settingsRight}>
              <Text style={styles.settingsValue}>{profile?.currency || 'USD'}</Text>
              <Text style={styles.settingsArrow}>›</Text>
            </View>
          </Pressable>

          <View style={styles.settingsRow}>
            <View style={styles.settingsIcon}>
              <Icon name="chatbubbles-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.settingsContent}>
              <Text style={styles.settingsLabel}>SMS Auto-Import</Text>
              <Text style={styles.settingsSub}>{smsImportEnabled ? 'On' : 'Off'}</Text>
            </View>
            <Pressable
              onPress={handleToggleSmsImport}
              style={[styles.toggleBtn, smsImportEnabled && { backgroundColor: Colors.primary }]}
            >
              <View style={[styles.toggleDot, smsImportEnabled && { alignSelf: 'flex-end' }]} />
            </Pressable>
          </View>
        </View>

        <Pressable onPress={() => setShowSignOutModal(true)} style={styles.signOutBtn}>
          <Icon name="log-out-outline" size={18} color={Colors.onErrorContainer} style={{ marginRight: 6 }} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        <Text style={styles.versionText}>App Version 1.0.0 (Stable)</Text>
      </ScrollView>

      <ConfirmModal
        visible={showSignOutModal}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        destructive
        onConfirm={handleSignOut}
        onCancel={() => setShowSignOutModal(false)}
      />

 
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.containerMargin, paddingTop: 56, paddingBottom: Spacing.md, marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
  },
  headerTitle: { fontSize: 24, fontFamily: Fonts.family.bold, color: Colors.primary },
  scroll: { padding: Spacing.containerMargin, paddingBottom: 120 },

  profileHeader: { alignItems: 'center', marginBottom: Spacing.xl },
  avatarContainer: { marginBottom: Spacing.md },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.primaryContainer, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 32, fontFamily: Fonts.family.bold, color: Colors.onPrimaryContainer },
  name: { fontSize: 24, fontFamily: Fonts.family.bold, color: Colors.onSurface, marginBottom: Spacing.xs },
  email: { fontSize: 14, fontFamily: Fonts.family.regular, color: Colors.onSurfaceVariant, marginBottom: Spacing.sm },

  settingsSection: { marginBottom: Spacing.xl },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md, marginBottom: Spacing.xs,
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: BorderRadius.lg,
  },
  settingsIcon: { width: 40, height: 40, borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceContainerHigh + '50', justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  settingsContent: { flex: 1 },
  settingsLabel: { fontSize: 15, fontFamily: Fonts.family.semiBold, color: Colors.onSurface },
  settingsSub: { fontSize: 11, fontFamily: Fonts.family.regular, color: Colors.outline, marginTop: 2 },
  settingsRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  settingsValue: { fontSize: 13, fontFamily: Fonts.family.semiBold, color: Colors.primary },
  settingsArrow: { fontSize: 20, color: Colors.outline, marginLeft: Spacing.xs },

  toggleBtn: {
    width: 44, height: 26, borderRadius: 13,
    backgroundColor: Colors.surfaceContainerHigh, justifyContent: 'center', paddingHorizontal: 3,
  },
  toggleDot: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.white,
    alignSelf: 'flex-start',
  },

  signOutBtn: {
    flexDirection: 'row', paddingVertical: Spacing.md, borderRadius: BorderRadius.lg,
    backgroundColor: Colors.errorContainer + '30', alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  signOutText: { fontSize: 14, fontFamily: Fonts.family.semiBold, color: Colors.onErrorContainer, letterSpacing: 0.05 },
  versionText: { fontSize: 12, fontFamily: Fonts.family.regular, color: Colors.outline, textAlign: 'center' },
});

export default ProfileScreen;