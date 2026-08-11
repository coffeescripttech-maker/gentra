import { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants/colors';

interface ProgressBarProps {
  /** Progress from 0 to 1. */
  progress: number;
  /** Fill color (defaults to the app brand color). */
  color?: string;
  /** Track color (defaults to the app border color). */
  trackColor?: string;
  height?: number;
}

export function ProgressBar({
  progress,
  color = Colors.brand,
  trackColor = Colors.border,
  height = 8,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const fill = useSharedValue(clamped);

  // Ease each step instead of jumping — the ride context ticks once a second.
  useEffect(() => {
    fill.value = withTiming(clamped, { duration: 400 });
  }, [clamped, fill]);

  const animatedStyle = useAnimatedStyle<ViewStyle>(() => ({
    width: `${(fill.value * 100).toFixed(2)}%` as DimensionValue,
    backgroundColor: color,
  }));

  return (
    <View style={[styles.track, { height, backgroundColor: trackColor }]}>
      <Animated.View style={[styles.fill, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: 99,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 99,
  },
});