import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Radar } from '@/components/radar';
import { EmptyState } from '@/components/ui/empty-state';
import { FadeInView } from '@/components/ui/fade-in-view';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { FontFamily, FontSize, LineHeight, LetterSpacing } from '@/constants/typography';
import { useRide } from '@/context/ride';
import { hapticTick } from '@/utils/haptics';

const MICROCOPY = [
  'Contacting nearby drivers…',
  'Pinging tricycles around your pickup…',
  'Picking the closest match…',
  'Confirming your ride…',
];

const TICK_MS = 1700;

export default function RideFindingScreen() {
  const router = useRouter();
  const { status, cancelBooking, retryFinding } = useRide();
  const [tick, setTick] = useState(0);

  // Rotate microcopy + nudge a haptic tick each rotation.
  useEffect(() => {
    if (status !== 'finding') return;
    const timer = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (tick > 0) hapticTick();
  }, [tick]);

  // Once a driver is assigned, move on to the assigned screen.
  useEffect(() => {
    if (status === 'assigned') router.replace('/ride/assigned');
  }, [status, router]);

const searching = status === 'finding';

  const goHome = () => {
    cancelBooking();
    router.replace('/(passenger)/home');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        {searching ? (
          <>
            <Radar size={140} />
            <Text style={styles.title}>Finding your ride</Text>
            <FadeInView key={tick}>
              <Text style={styles.body}>{MICROCOPY[tick % MICROCOPY.length]}</Text>
            </FadeInView>

            {/* Shimmer "matched driver" hint card */}
            <View style={styles.skeletonCard}>
              <View style={styles.skeletonBadge}>
                <Skeleton width={48} height={48} radius={24} />
              </View>
              <View style={styles.skeletonLines}>
                <Skeleton width={150} height={15} />
                <Skeleton width={96} height={11} />
              </View>
            </View>

            <PrimaryButton label="Cancel booking" variant="secondary" onPress={goHome} />
          </>
        ) : (
          <EmptyState
            icon="car-off"
            title="No drivers found"
            body="We couldn't match you with a nearby driver."
            action={
              <View style={styles.actions}>
                <PrimaryButton
                  label="Try again"
                  icon="radar"
                  gradient
                  onPress={retryFinding}
                />
                <PrimaryButton
                  label="Change trip"
                  variant="secondary"
                  onPress={goHome}
                />
              </View>
            }
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.md,
  },
  title: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.subtitle,
    color: Colors.primaryText,
    textAlign: 'center',
    marginTop: spacing.md,
    letterSpacing: LetterSpacing.tight,
  },
  body: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.small,
    color: Colors.secondaryText,
    textAlign: 'center',
    lineHeight: LineHeight.small,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: spacing.lg,
    marginVertical: spacing.md,
  },
  skeletonBadge: {
    width: 48,
    height: 48,
  },
  skeletonLines: {
    flex: 1,
    gap: spacing.sm,
  },
  actions: {
    alignSelf: 'stretch',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});