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
import { showToast } from '../../utils/toast';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { Spacing } from '../../constants/spacing';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen = () => {
  const nav = useNavigation<Nav>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Min 6 characters';
    if (!confirmPassword) e.confirmPassword = 'Confirm your password';
    else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.signUp({ name: name.trim(), email: email.trim(), password });
      showToast('Account created! Check your email to verify.', 'success');
      nav.navigate('Login');
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenWrapper title={Strings.REGISTER_TITLE} subtitle={Strings.REGISTER_SUBTITLE}>
      <Input
        label={Strings.NAME_LABEL}
        value={name}
        onChangeText={t => {
          setName(t);
          if (errors.name)
            setErrors(p => {
              const n = { ...p };
              delete n.name;
              return n;
            });
        }}
        autoCapitalize="words"
        error={errors.name}
      />
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
      <Input
        label={Strings.CONFIRM_PASSWORD_LABEL}
        value={confirmPassword}
        onChangeText={t => {
          setConfirmPassword(t);
          if (errors.confirmPassword)
            setErrors(p => {
              const n = { ...p };
              delete n.confirmPassword;
              return n;
            });
        }}
        secureTextEntry
        error={errors.confirmPassword}
      />
      <Button title={Strings.REGISTER_BUTTON} onPress={handleRegister} loading={loading} />
      <View style={styles.footer}>
        <Text style={styles.footerText}>{Strings.HAVE_ACCOUNT}</Text>
        <Pressable onPress={() => nav.navigate('Login')}>
          <Text style={styles.link}>{Strings.LOGIN_BUTTON}</Text>
        </Pressable>
      </View>
    </AuthScreenWrapper>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  footerText: { color: Colors.onSurfaceVariant, fontFamily: Fonts.family.regular, fontSize: 14 },
  link: { color: Colors.primary, fontFamily: Fonts.family.semiBold, fontSize: 14 },
});

export default RegisterScreen;
