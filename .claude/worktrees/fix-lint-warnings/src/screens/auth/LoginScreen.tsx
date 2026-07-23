import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AuthScreenWrapper from '../../components/common/AuthScreenWrapper';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Strings } from '../../constants/strings';
import { authService } from '../../services/auth/AuthService';
import { handleError } from '../../utils/errorHandler';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { Spacing } from '../../constants/spacing';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen = () => {
  const nav = useNavigation<Nav>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.signIn({ email: email.trim(), password });
    } catch (err) {
      handleError(err, 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenWrapper title={Strings.LOGIN_TITLE} subtitle={Strings.LOGIN_SUBTITLE}>
      <Input
        label={Strings.EMAIL_LABEL}
        value={email}
        onChangeText={t => {
          setEmail(t);
          if (errors.email)
            setErrors(p => {
              const n = { ...p };
              delete n.email;
              return n;
            });
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />
      <Input
        label={Strings.PASSWORD_LABEL}
        value={password}
        onChangeText={t => {
          setPassword(t);
          if (errors.password)
            setErrors(p => {
              const n = { ...p };
              delete n.password;
              return n;
            });
        }}
        secureTextEntry
        error={errors.password}
      />
      <Pressable onPress={() => nav.navigate('ForgotPassword')} style={styles.forgotRow}>
        <Text style={styles.forgotText}>{Strings.FORGOT_PASSWORD}</Text>
      </Pressable>
      <Button title={Strings.LOGIN_BUTTON} onPress={handleLogin} loading={loading} />
      <View style={styles.footer}>
        <Text style={styles.footerText}>{Strings.NO_ACCOUNT}</Text>
        <Pressable onPress={() => nav.navigate('Register')}>
          <Text style={styles.link}>{Strings.REGISTER_BUTTON}</Text>
        </Pressable>
      </View>
    </AuthScreenWrapper>
  );
};

const styles = StyleSheet.create({
  forgotRow: { alignSelf: 'flex-end', marginBottom: Spacing.lg, marginTop: -Spacing.sm },
  forgotText: { color: Colors.primary, fontFamily: Fonts.family.medium, fontSize: 14 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  footerText: { color: Colors.onSurfaceVariant, fontFamily: Fonts.family.regular, fontSize: 14 },
  link: { color: Colors.primary, fontFamily: Fonts.family.semiBold, fontSize: 14 },
});

export default LoginScreen;
