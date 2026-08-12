import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { CustomIcon } from '@/components/ui/custom-icon';
import { Colors } from '@/constants/colors';
import { radius } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';
import { FontFamily, FontSize } from '@/constants/typography';
import type { VehicleType } from '@/types';

interface VehicleTypeCardProps {
  type: VehicleType;
  selected: boolean;
  onPress: () => void;
  /** Pre-formatted fare, shown as a price badge so it's visible before booking. */
  priceFmt?: string;
}

const META: Record<VehicleType, { title: string; hint: string }> = {
  tricycle: { title: 'Tricycle', hint: 'Fast & flexible · up to 4 pax' },
  jeepney: { title: 'Jeepney', hint: 'Shared route · up to 23 pax' },
};

/** Selectable ride card — border/bg/check spring in and out with selection. */
export function VehicleTypeCard({ type, selected, onPress, priceFmt }: VehicleTypeCardProps) {
  const meta = META[type];
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(selected ? 1 : 0, { damping: 20, stiffness: 260 });
  }, [selected, progress]);

  const cardStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(progress.value, [0, 1], [Colors.border, Colors.brand]),
    backgroundColor: interpolateColor(progress.value, [0, 1], [Colors.card, Colors.brandSoft]),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: progress.value }],
  }));

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      haptic
      style={styles.shadow}>
      <Animated.View style={[styles.card, cardStyle]}>
        <View style={styles.iconBadge}>
          <CustomIcon kind={type} size={30} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, selected && styles.titleSelected]}>{meta.title}</Text>
          <Text style={styles.hint}>{meta.hint}</Text>
        </View>
        <View style={styles.right}>
          <Animated.View style={checkStyle}>
            <Icon name="check-circle" size={24} color={Colors.brand} />
          </Animated.View>
          {priceFmt && (
            <Text style={[styles.price, selected && styles.priceSelected]}>
              {priceFmt}
            </Text>
          )}
        </View>
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: radius.md,
    ...shadows.card,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: radius.md,
    borderWidth: 2,
    padding: 16,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  price: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.body,
    color: Colors.secondaryText,
  },
  priceSelected: {
    color: Colors.brand,
  },
  title: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.subtitle,
    color: Colors.primaryText,
  },
  titleSelected: {
    color: Colors.brand,
  },
  hint: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
  },
});