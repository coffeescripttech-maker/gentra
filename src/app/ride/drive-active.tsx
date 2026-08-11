import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/primary-button';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Icon } from '@/components/ui/icon';
import { EmptyState } from '@/components/ui/empty-state';
import { Colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';
import { FontFamily, FontSize, LetterSpacing } from '@/constants/typography';
import { useRide } from '@/context/ride';
import { useSession } from '@/context/session';
import { formatPeso } from '@/utils/fare';
import { hapticLight, hapticSuccess } from '@/utils/haptics';

export default function DriveActiveScreen() {
  const router = useRouter();
  const { booking, endRideAsDriver } = useRide();
  const { state } = useSession();
  const max = state.driver.maxCapacity;
  const [passengers, setPassengers] = useState(1);

  if (!booking) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <EmptyState
            icon="steering"
            title="No active ride"
            body="Start a trip from the pickup screen to see it here."
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

  const step = (delta: number) => {
    hapticLight();
    setPassengers((p) => Math.min(max, Math.max(0, p + delta)));
  };

  const endRide = () => {
    hapticSuccess();
    endRideAsDriver();
    router.replace('/ride/drive-complete');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.kicker}>CURRENT TRIP</Text>
          <Text style={styles.title}>On the road</Text>
        </View>

        {/* Route card */}
        <View style={styles.routeCard}>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: Colors.success }]} />
            <Text style={styles.routeName}>{booking.pickup.name}</Text>
          </View>
          <View style={styles.routeConnector}>
            <View style={styles.routeLine} />
          </View>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: Colors.error }]} />
            <Text style={styles.routeName}>{booking.destination.name}</Text>
          </View>
          <Text style={styles.routeSub}>
            {booking.passengerName ?? 'Passenger'} · {formatPeso(booking.fare.total)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Passengers on board</Text>
          <View style={styles.stepper}>
            <PressableScale
              accessibilityRole="button"
              disabled={passengers <= 0}
              onPress={() => step(-1)}
              haptic
              style={[styles.stepBtn, passengers <= 0 && styles.stepBtnDisabled]}>
              <Text style={styles.stepBtnText}>−</Text>
            </PressableScale>
            <View style={styles.stepCount}>
              <Text style={styles.stepCountValue}>{passengers}</Text>
              <Text style={styles.stepCountLabel}>of {max} pax</Text>
            </View>
            <PressableScale
              accessibilityRole="button"
              disabled={passengers >= max}
              onPress={() => step(1)}
              haptic
              style={[styles.stepBtn, passengers >= max && styles.stepBtnDisabled]}>
              <Text style={styles.stepBtnText}>＋</Text>
            </PressableScale>
          </View>
        </View>

        <PrimaryButton
          label="End ride"
          icon="flag-checkered"
          gradient
          color={Colors.driver}
          onPress={endRide}
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
    gap: 2,
    marginBottom: spacing.xs,
  },
  kicker: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.driver,
    letterSpacing: LetterSpacing.wide,
  },
  title: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.title,
    color: Colors.primaryText,
  },
  routeCard: {
    backgroundColor: Colors.driverSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: Colors.driver,
    padding: spacing.lg,
    gap: spacing.xs,
    ...shadows.card,
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
  },
  routeName: {
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.body,
    color: Colors.primaryText,
  },
  routeConnector: {
    marginLeft: 4,
  },
  routeLine: {
    width: 2,
    height: 14,
    borderRadius: 1,
    backgroundColor: Colors.driver,
    opacity: 0.4,
  },
  routeSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.small,
    color: Colors.secondaryText,
    marginTop: spacing.xs,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.small,
    color: Colors.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: LetterSpacing.wide,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: spacing.lg,
    ...shadows.card,
  },
  stepBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.driver,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    backgroundColor: Colors.muted,
  },
  stepBtnText: {
    fontFamily: FontFamily.heading,
    fontSize: 26,
    color: Colors.onAccent,
  },
  stepCount: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  stepCountValue: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.display,
    color: Colors.primaryText,
  },
  stepCountLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
});