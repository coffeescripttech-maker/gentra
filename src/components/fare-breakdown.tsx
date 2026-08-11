import { StyleSheet, Text, View } from 'react-native';

import { AnimatedNumber } from '@/components/ui/animated-number';
import { Colors } from '@/constants/colors';
import { radius } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';
import { FontFamily, FontSize } from '@/constants/typography';
import type { FareBreakdown as Fare } from '@/types';
import { formatPeso } from '@/utils/fare';

interface FareBreakdownProps {
  fare: Fare;
  tip?: number;
  /** Accent color for the total (brand in passenger flow, driver green in driver flow). */
  accentColor?: string;
  /** Count the total up with an animated number. */
  animated?: boolean;
}

export function FareBreakdown({
  fare,
  tip = 0,
  accentColor = Colors.brand,
  animated = false,
}: FareBreakdownProps) {
  const total = fare.total + tip;
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Fare breakdown</Text>

      <Row label={`Base fare (${fare.distanceKm} km)`} value={fare.base} />
      <Row label="Distance" value={fare.distanceCost} />
      {fare.nightSurcharge > 0 && <Row label="Night rate (10 PM – 5 AM)" value={fare.nightSurcharge} />}
      {tip > 0 && <Row label="Tip" value={tip} />}

      <View style={styles.divider} />
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        {animated ? (
          <AnimatedNumber
            value={total}
            duration={700}
            format={(v) => formatPeso(Math.round(v))}
            style={[styles.totalValue, { color: accentColor }]}
          />
        ) : (
          <Text style={[styles.totalValue, { color: accentColor }]}>{formatPeso(total)}</Text>
        )}
      </View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{formatPeso(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: radius.md,
    padding: 16,
    gap: 8,
    ...shadows.card,
  },
  heading: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.body,
    color: Colors.primaryText,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.small,
    color: Colors.secondaryText,
  },
  rowValue: {
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.small,
    color: Colors.primaryText,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.body,
    color: Colors.primaryText,
  },
  totalValue: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.title,
  },
});