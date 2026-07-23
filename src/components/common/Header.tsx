import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  const canGoBack = showBack !== undefined ? showBack : navigation.canGoBack();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, Spacing.md) }]}>
      <View style={styles.sideContainer}>
        {canGoBack && (
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={28} color={Colors.textMain} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.centerContainer}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
      </View>

      <View style={[styles.sideContainer, styles.rightSideContainer]}>
        {rightElement}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  sideContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightSideContainer: {
    alignItems: 'flex-end',
  },
  backBtn: {
    padding: Spacing.xs,
  },
  centerContainer: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.h2,
    color: Colors.textMain,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
});
