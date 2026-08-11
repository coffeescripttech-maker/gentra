import { StyleSheet, Text, View } from 'react-native';

import { CapacityBadge } from '@/components/capacity-badge';
import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Colors } from '@/constants/colors';
import { radius } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';
import { FontFamily, FontSize } from '@/constants/typography';
import type { Driver } from '@/types';

interface DriverCardProps {
  driver: Driver;
  onPress?: () => void;
  /** Show the verified badge next to the name. */
  verified?: boolean;
}

const VEHICLE_ICON: Record<Driver['vehicleType'], IconName> = {
  tricycle: 'motorbike',
  jeepney: 'bus',
};

/** Driver row — face emoji as personality, line icons for everything functional. */
export function DriverCard({ driver, onPress, verified = false }: DriverCardProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      onPress={onPress}
      haptic={!!onPress}
      style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarEmoji}>{driver.emoji}</Text>
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {driver.name}
          </Text>
          {verified && <Icon name="shield-check" size={16} color={Colors.brand} />}
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.plate}>{driver.plate}</Text>
          <Icon name="star" size={14} color={Colors.star} />
          <Text style={styles.rating}>{driver.rating.toFixed(1)}</Text>
          <Text style={styles.dot}>·</Text>
          <Icon
            name={VEHICLE_ICON[driver.vehicleType]}
            size={13}
            color={Colors.secondaryText}
          />
          <Text style={styles.vehicle}>
            {driver.vehicleType === 'tricycle' ? 'Tricycle' : 'Jeepney'}
          </Text>
        </View>
      </View>

      <CapacityBadge
        vehicleType={driver.vehicleType}
        current={driver.currentPassengers}
        max={driver.maxCapacity}
        size="small"
      />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: radius.md,
    padding: 14,
    ...shadows.card,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  name: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.body,
    color: Colors.primaryText,
    flexShrink: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  plate: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
  },
  rating: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.caption,
    color: Colors.primaryText,
  },
  dot: {
    color: Colors.border,
  },
  vehicle: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
  },
});