import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/spacing';
import { Fonts } from '../../constants/fonts';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  prefix?: string;
  suffix?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  autoCapitalize = 'none',
  prefix,
  suffix,
}) => {
  const [focused, setFocused] = useState(false);
  const [secure, setSecure] = useState(secureTextEntry);
  const hasError = !!error;

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, hasError && { color: Colors.error }]}>{label}</Text>
      <View
        style={[
          styles.container,
          focused && !hasError && styles.focused,
          hasError && styles.errorBorder,
        ]}
      >
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}
        <TextInput
          style={[
            styles.input,
            multiline && styles.multiline,
            prefix && { paddingLeft: Spacing.xs },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.outline + '60'}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          multiline={multiline}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setSecure(!secure)} style={styles.eye}>
            <Icon
              name={secure ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={Colors.outline}
            />
          </Pressable>
        )}
        {suffix && <View style={styles.suffix}>{suffix}</View>}
      </View>
      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.md },
  label: {
    fontSize: 13,
    fontFamily: Fonts.family.semiBold,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.xs,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.surfaceContainerHigh,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 48,
  },
  focused: { borderColor: Colors.primary, backgroundColor: Colors.surfaceContainerLowest },
  errorBorder: { borderColor: Colors.error },
  prefix: {
    fontSize: 16,
    fontFamily: Fonts.family.semiBold,
    color: Colors.onSurfaceVariant,
    marginRight: Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.onSurface,
    fontFamily: Fonts.family.regular,
    paddingVertical: 0,
    minHeight: 24,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  eye: { padding: Spacing.sm },
  suffix: { marginLeft: Spacing.sm },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    fontFamily: Fonts.family.regular,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});

export default Input;
