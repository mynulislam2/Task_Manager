import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing, Typography } from '../../constants';

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, rightElement, showBack }) => {
  const navigation = useNavigation();
  const canGoBack = showBack !== undefined ? showBack : navigation.canGoBack();

  return (
    <View style={[styles.container, canGoBack ? styles.containerWithBack : null]}>
      {canGoBack && (
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={Colors.textMain} />
        </TouchableOpacity>
      )}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {rightElement && (
        <View style={styles.rightContainer}>
          {rightElement}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: Colors.background,
    minHeight: 60,
  },
  containerWithBack: {
    paddingLeft: Spacing.sm,
  },
  backBtn: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...Typography.h1,
    color: Colors.textMain,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  rightContainer: {
    marginLeft: Spacing.md,
  },
});
