import { useEffect } from 'react';
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants/colors';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/** Shimmer placeholder block for loading / searching states. */
export function Skeleton({ width = '100%', height = 16, radius = 8, style }: SkeletonProps) {
  const sweep = useSharedValue(-120);

  useEffect(() => {
    sweep.value = withRepeat(
      withTiming(320, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [sweep]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sweep.value }],
  }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: Colors.muted, overflow: 'hidden' },
        style,
      ]}
    >
      <Animated.View style={[styles.highlight, shimmerStyle]} />
    </Animated.View>
  );
}

const styles = {
  highlight: {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    width: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
};