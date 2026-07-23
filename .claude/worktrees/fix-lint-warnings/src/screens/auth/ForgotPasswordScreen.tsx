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
import { BorderRadius, Spacing } from '../../constants/spacing';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = () => {
  const nav = useNavigation<Nav>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email');
      return false;
    }
    return true;
  };

  const handleReset = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.resetPassword(email.trim());
      setSubmitted(true);
      showToast('Check your email for the reset link', 'success');
    } catch (err) {
      handleError(err, 'Unable to send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthScreenWrapper
        title="Check Your Email"
        subtitle="We've sent a password reset link to your email"
      >
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>
            Click the link in your email to reset your password. If you don't see it, check your
            spam folder.
          </Text>
        </View>
        <Button title="Back to Login" onPress={() => nav.navigate('Login')} />
      </AuthScreenWrapper>
    );
  }

  return (
    <AuthScreenWrapper
      title={Strings.FORGOT_PASSWORD_TITLE}
      subtitle={Strings.FORGOT_PASSWORD_SUBTITLE}
    >
      <Input
        label={Strings.EMAIL_LABEL}
        value={email}
        onChangeText={t => {
          setEmail(t);
          if (error) setError('');
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        error={error}
      />
      <Button title={Strings.FORGOT_PASSWORD_BUTTON} onPress={handleReset} loading={loading} />
      <Pressable onPress={() => nav.navigate('Login')} style={styles.backLink}>
        <Text style={styles.backLinkText}>Back to Login</Text>
      </Pressable>
    </AuthScreenWrapper>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  messageText: {
    color: Colors.onSurface,
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  backLink: { alignItems: 'center', marginTop: Spacing.lg },
  backLinkText: { color: Colors.primary, fontFamily: Fonts.family.medium, fontSize: 14 },
});

export default ForgotPasswordScreen;
