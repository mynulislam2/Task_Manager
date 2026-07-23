import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { Fonts } from '../../constants/fonts';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const HEIGHT = { sm: 40, md: 52, lg: 60 };
const FONT_SIZE = { sm: 13, md: 15, lg: 17 };
const RADIUS = { sm: BorderRadius.sm, md: BorderRadius.lg, lg: BorderRadius.xl };

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
  style,
}) => {
  const isDisabled = disabled || loading;

  const bgColor = {
    primary: Colors.primary,
    secondary: Colors.surfaceContainerHigh,
    outline: 'transparent',
    ghost: 'transparent',
    danger: Colors.errorContainer,
  }[variant];

  const txtColor = {
    primary: Colors.onPrimary,
    secondary: Colors.onSurface,
    outline: Colors.primary,
    ghost: Colors.primary,
    danger: Colors.onErrorContainer,
  }[variant];

  const borderStyle =
    variant === 'outline' ? { borderWidth: 1.5, borderColor: Colors.outline } : {};

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          height: HEIGHT[size],
          backgroundColor: bgColor as string,
          borderRadius: RADIUS[size],
          opacity: pressed && !isDisabled ? 0.85 : 1,
        },
        borderStyle,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {icon && <>{icon}</>}
      {loading ? (
        <ActivityIndicator color={txtColor as string} size="small" />
      ) : (
        <Text style={[styles.text, { color: txtColor as string, fontSize: FONT_SIZE[size] }]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  text: { fontFamily: Fonts.family.semiBold },
});

export default Button;
