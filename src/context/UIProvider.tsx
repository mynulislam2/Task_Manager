import React from 'react';
import { StyleSheet, View } from 'react-native';
import LoadingOverlay from '../components/common/LoadingOverlay';
import Toast from '../components/common/Toast';

const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.container}>
    {children}
    <Toast />
    <LoadingOverlay />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default UIProvider;
