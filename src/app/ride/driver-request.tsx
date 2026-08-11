import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedNumber } from '@/components/ui/animated-number';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';
import { FontFamily, FontSize, LetterSpacing } from '@/constants/typography';
import { useRide } from '@/context/ride';
import { formatPeso } from '@/utils/fare';

export default function DriverRequestScreen() {
  const router = useRouter();
  const { booking, progress, etaSeconds, arrived, arrivedAtPickup } = useRide();

  if (!booking) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <EmptyState
            icon="navigation"
            title="No active booking"
            body="Accept a booking from the dashboard to see the passenger here."
            action={
              <PrimaryButton
                label="Back to dashboard"
                gradient
                color={Colors.driver}
                onPress={() => router.replace('/(driver)/dashboard')}
              />
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  const startRide = () => {
    arrivedAtPickup();
    router.replace('/ride/drive-active');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.header}>
          <PressableScale accessibilityRole="button" style={styles.backBtn} onPress={() => router.back()} haptic>
            <Icon name="arrow-left" size={22} color={Colors.primaryText} />
          </PressableScale>
          <View style={styles.headerTitle}>
            <Text style={styles.kicker}>PICKUP</Text>
            <Text style={styles.title}>Go to pickup</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Passenger card */}
        <View style={styles.passengerCard}>
          <Text style={styles.passengerKicker}>PASSENGER</Text>
          <View style={styles.passengerNameRow}>
            <Icon name="account" size={17} color={Colors.primaryText} />
            <Text style={styles.passengerName}>
              {booking.passengerName ?? 'Passenger'}
            </Text>
            <Icon name="star" size={15} color={Colors.star} />
            <Text style={styles.passengerRating}>
              {booking.passengerRating?.toFixed(1) ?? '—'}
            </Text>
          </View>
          <Text style={styles.passengerRoute}>
            {booking.pickup.name} → {booking.destination.name}
          </Text>
          <Text style={styles.passengerFare}>
            {formatPeso(booking.fare.total)} · {booking.distanceKm.toFixed(1)} km
          </Text>
        </View>

        {/* Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.statusKicker}>
                {arrived ? 'YOU HAVE ARRIVED' : 'EST. ARRIVAL'}
              </Text>
              {arrived ? (
                <Text style={styles.statusValue}>🎉 At the pickup point</Text>
              ) : (
                <View style={styles.etaRow}>
                  <AnimatedNumber
                    value={etaSeconds}
                    duration={400}
                    format={(v) => `${Math.round(v)}s`}
                    style={styles.statusValue}
                  />
                  <Text style={styles.statusHint}>to passenger</Text>
                </View>
              )}
            </View>
            <View style={styles.vehicleBadge}>
              <Icon
                name={booking.vehicleType === 'tricycle' ? 'motorbike' : 'bus'}
                size={22}
                color={Colors.driver}
              />
            </View>
          </View>
          <ProgressBar progress={progress} color={Colors.driver} />
        </View>

        <PrimaryButton
          label={arrived ? 'Mark passenger boarded' : 'I arrived at pickup'}
          icon={arrived ? 'check-circle' : 'map-marker-check'}
          gradient
          color={Colors.driver}
          onPress={startRide}
        />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    gap: 1,
  },
  kicker: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.driver,
    letterSpacing: LetterSpacing.wide,
    textAlign: 'center',
  },
  title: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.title,
    color: Colors.primaryText,
  },
  headerSpacer: {
    width: 40,
  },
  passengerCard: {
    backgroundColor: Colors.driverSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: Colors.driver,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  passengerKicker: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.driver,
    letterSpacing: LetterSpacing.wide,
  },
  passengerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  passengerName: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.body,
    color: Colors.primaryText,
  },
  passengerRating: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.caption,
    color: Colors.primaryText,
  },
  passengerRoute: {
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.body,
    color: Colors.primaryText,
  },
  passengerFare: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.small,
    color: Colors.secondaryText,
  },
  statusCard: {
    backgroundColor: Colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    backgroundColor: Colors.driverSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
});