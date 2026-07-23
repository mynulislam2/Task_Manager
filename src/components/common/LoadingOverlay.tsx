import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius } from '../../constants/spacing';
import { registerLoader } from '../../utils/loader';

const LoadingOverlay = () => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    registerLoader({
      show: () => {
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      },
      hide: () => {
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      },
    });
  }, [opacity]);

  return (
    <Animated.View style={[styles.overlay, { opacity }]} pointerEvents="none">
      <View style={styles.loader}>
        <View style={styles.spinner} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9998,
    elevation: 10,
  },
  loader: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainerLowest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    borderWidth: 3,
    borderColor: Colors.outlineVariant,
    borderTopColor: Colors.primary,
  },
});

export default LoadingOverlay;
