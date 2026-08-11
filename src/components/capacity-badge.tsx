import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import type { VehicleType } from '@/types';
import { capacityStatus } from '@/utils/capacity';

interface CapacityBadgeProps {
  vehicleType: VehicleType;
  current: number;
  max: number;
  size?: 'small' | 'regular';
}

/** Colored "seats left / filling up / full" pill (green · yellow · red). */
export function CapacityBadge({
  vehicleType,
  current,
  max,
  size = 'regular',
}: CapacityBadgeProps) {
  const status = capacityStatus(vehicleType, current, max);
  return (
    <View style={[styles.badge, { backgroundColor: status.color }]}>
      <Text style={[styles.text, size === 'small' && styles.textSmall]}>{status.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.caption,
    color: Colors.onAccent,
  },
  textSmall: {
    fontSize: 10,
  },
});
