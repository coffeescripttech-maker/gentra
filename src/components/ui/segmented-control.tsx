import { useEffect, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { PressableScale } from '@/components/ui/pressable-scale';
import { Colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';
import { FontFamily, FontSize } from '@/constants/typography';

export interface SegmentOption<T extends string> {
  key: T;
  label: string;
  /** Optional sub-caption shown under the label. */
  hint?: string;
}

interface SegmentedControlProps<T extends string> {
  options: Array<SegmentOption<T>>;
  value: T;
  onChange: (key: T) => void;
  /** Option key to gray out (e.g. unavailable modes). */
  disabledKey?: T;
  /** Copy shown under a disabled option. */
  disabledHint?: string;
}

/**
 * Animated pill segmented control — a white thumb springs between segments.
 * Used for ride modes (select) and earnings periods.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  disabledKey,
  disabledHint,
}: SegmentedControlProps<T>) {
  const [trackWidth, setTrackWidth] = useState(0);
  const thumbX = useSharedValue(0);

  const activeIndex = Math.max(0, options.findIndex((o) => o.key === value));

  useEffect(() => {
    if (trackWidth > 0) {
      thumbX.value = withSpring((activeIndex * trackWidth) / options.length, {
        damping: 22,
        stiffness: 280,
      });
    }
  }, [activeIndex, trackWidth, options.length, thumbX]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }],
  }));

  return (
    <View
      style={styles.track}
      onLayout={(e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width)}>
      <Animated.View style={[styles.thumb, { width: `${100 / options.length}%` }, thumbStyle]} />
      {options.map((option) => {
        const disabled = option.key === disabledKey;
        const active = option.key === value;
        return (
          <PressableScale
            key={option.key}
            disabled={disabled}
            onPress={() => onChange(option.key)}
            haptic
            style={styles.item}>
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
            {option.hint ? (
              <Text
                style={[
                  styles.hint,
                  active && styles.hintActive,
                  disabled && styles.hintDisabled,
                ]}>
                {disabled ? (disabledHint ?? option.hint) : option.hint}
              </Text>
            ) : null}
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: Colors.muted,
    borderRadius: radius.pill,
    padding: 4,
  },
  thumb: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: radius.pill,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    ...shadows.card,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: 2,
    zIndex: 1,
  },
  label: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.body,
    color: Colors.secondaryText,
  },
  labelActive: {
    color: Colors.brand,
  },
  hint: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
  },
  hintActive: {
    color: Colors.brand,
  },
  hintDisabled: {
    opacity: 0.4,
  },
});