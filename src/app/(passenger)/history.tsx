import { StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { Stagger } from '@/components/ui/fade-in-view';
import { Icon, type IconName } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';
import { FontFamily, FontSize, LetterSpacing } from '@/constants/typography';
import { useSession } from '@/context/session';
import type { TripReceipt } from '@/types';
import { formatPeso } from '@/utils/fare';

const VEHICLE_ICON: Record<'tricycle' | 'jeepney', IconName> = {
  tricycle: 'motorbike',
  jeepney: 'bus',
};

export default function HistoryScreen() {
  const { state } = useSession();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.kicker}>HISTORY</Text>
        <Text style={styles.title}>Your rides</Text>
        <Text style={styles.subtitle}>
          {state.receipts.length} trip{state.receipts.length === 1 ? '' : 's'} so far
        </Text>
      </View>

      {state.receipts.length === 0 ? (
        <EmptyState
          icon="car-multiple"
          title="No rides yet"
          body="Book your first ride from the Home tab and it will show up here."
        />
      ) : (
        <Stagger interval={80}>
          {state.receipts.map((receipt) => (
            <ReceiptCard key={receipt.id} receipt={receipt} />
          ))}
        </Stagger>
      )}
    </Screen>
  );
}

function ReceiptCard({ receipt }: { receipt: TripReceipt }) {
  const date = new Date(receipt.date);
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.vehicleBadge}>
          <Icon
            name={VEHICLE_ICON[receipt.vehicleType]}
            size={22}
            color={receipt.vehicleType === 'tricycle' ? Colors.brand : Colors.driver}
          />
        </View>
        <View style={styles.route}>
          <Text style={styles.routeText}>
            {receipt.pickup} → {receipt.destination}
          </Text>
          <Text style={styles.meta}>
            {date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} ·{' '}
            {receipt.driverName} · {receipt.plate}
          </Text>
        </View>
        <View style={styles.amount}>
          <Text style={styles.amountValue}>{formatPeso(receipt.fare + receipt.tip)}</Text>
          {receipt.tip > 0 && (
            <Text style={styles.amountTip}>+ {formatPeso(receipt.tip)} tip</Text>
          )}
        </View>
      </View>
      <View style={styles.cardBottom}>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Icon
              key={n}
              name={n <= receipt.rating ? 'star' : 'star-outline'}
              size={14}
              color={n <= receipt.rating ? Colors.star : Colors.border}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 4,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  kicker: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.brand,
    letterSpacing: LetterSpacing.wide,
  },
  title: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.heading,
    color: Colors.primaryText,
  },
  subtitle: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.small,
    color: Colors.secondaryText,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
    ...shadows.card,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  vehicleBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  route: {
    flex: 1,
    gap: 2,
  },
  routeText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.body,
    color: Colors.primaryText,
  },
  meta: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
  },
  amount: {
    alignItems: 'flex-end',
  },
  amountValue: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.price,
    color: Colors.primaryText,
  },
  amountTip: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.success,
  },
  cardBottom: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: spacing.md,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
});