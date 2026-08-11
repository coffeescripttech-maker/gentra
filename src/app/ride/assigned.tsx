import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DriverCard } from '@/components/driver-card';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { EmptyState } from '@/components/ui/empty-state';
import { Stagger } from '@/components/ui/fade-in-view';
import { Icon, type IconName } from '@/components/ui/icon';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { FontFamily, FontSize, LetterSpacing, LineHeight } from '@/constants/typography';
import { useRide } from '@/context/ride';
import { getDriver } from '@/data';
import { formatPeso } from '@/utils/fare';

const VEHICLE_ICON: Record<'tricycle' | 'jeepney', IconName> = {
  tricycle: 'motorbike',
  jeepney: 'bus',
};

export default function RideAssignedScreen() {
  const router = useRouter();
  const { booking, progress, etaSeconds, arrived, boardVehicle, cancelBooking } = useRide();

  if (!booking) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <EmptyState
            icon="car-off"
            title="No active ride"
            body="Start a booking from the home screen to see your driver here."
            action={<PrimaryButton label="Back to home" onPress={() => router.replace('/(passenger)/home')} />}
          />
        </View>
      </SafeAreaView>
    );
  }

  const driver = booking.driverId ? getDriver(booking.driverId) : undefined;
  const vehicleLabel = booking.vehicleType === 'tricycle' ? 'Tricycle' : 'Jeepney';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.kicker}>MATCHED</Text>
          <Text style={styles.title}>Driver on the way</Text>
        </View>

        <Stagger interval={90}>
          {driver && <DriverCard driver={driver} verified />}

          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusTextWrap}>
                <Text style={styles.statusKicker}>
                  {arrived ? 'DRIVER HAS ARRIVED' : 'EST. ARRIVAL'}
                </Text>
                {arrived ? (
                  <Text style={styles.statusValue}>🎉 Your driver is here!</Text>
                ) : (
                  <View style={styles.etaRow}>
                    <AnimatedNumber
                      value={etaSeconds}
                      duration={400}
                      format={(v) => `${Math.round(v)}s`}
                      style={styles.statusValue}
                    />
                    <Text style={styles.statusHint}>to pickup</Text>
                  </View>
                )}
              </View>
              <View style={styles.vehicleBadge}>
                <Icon name={VEHICLE_ICON[booking.vehicleType]} size={22} color={Colors.brand} />
              </View>
            </View>
            <ProgressBar progress={progress} color={Colors.brand} />
          </View>

          <View style={styles.routeCard}>
            <View style={styles.routeRow}>
              <View style={styles.routeDot} />
              <Text style={styles.routeName}>{booking.pickup.name}</Text>
            </View>
            <View style={styles.routeMeta}>
              <Icon name="menu-down" size={18} color={Colors.border} />
              <Text style={styles.routeSub}>
                {vehicleLabel} · {booking.distanceKm.toFixed(1)} km · {formatPeso(booking.fare.total)}
              </Text>
            </View>
            <View style={styles.routeRow}>
              <View style={styles.routeDotDest} />
              <Text style={styles.routeName}>{booking.destination.name}</Text>
            </View>
          </View>
        </Stagger>

        {arrived ? (
          <PrimaryButton
            label={`Board the ${vehicleLabel} & start ride`}
            icon={VEHICLE_ICON[booking.vehicleType]}
            gradient
            onPress={() => {
              boardVehicle();
              router.replace('/ride/active');
            }}
          />
        ) : (
          <PrimaryButton
            label="Cancel booking"
            variant="secondary"
            onPress={() => {
              cancelBooking();
              router.replace('/(passenger)/home');
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.xxl,
    gap: spacing.lg,
  },
  header: {
    gap: 2,
    marginBottom: spacing.xs,
  },
  kicker: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.brand,
    letterSpacing: LetterSpacing.wide,
  },
  title: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.title,
    color: Colors.primaryText,
  },
  statusCard: {
    backgroundColor: Colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTextWrap: {
    flex: 1,
    gap: 4,
  },
  statusKicker: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
    letterSpacing: LetterSpacing.normal,
  },
  statusValue: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.price,
    color: Colors.primaryText,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  statusHint: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
  },
  vehicleBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeCard: {
    backgroundColor: Colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
  },
  routeDotDest: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
  },
  routeName: {
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.body,
    color: Colors.primaryText,
    flex: 1,
  },
  routeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginLeft: 4,
  },
  routeSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
    lineHeight: LineHeight.caption,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
});