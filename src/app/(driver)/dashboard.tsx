import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnlineToggle } from '@/components/online-toggle';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';
import { FontFamily, FontSize, LetterSpacing } from '@/constants/typography';
import { useRide } from '@/context/ride';
import { useSession } from '@/context/session';
import { formatPeso } from '@/utils/fare';
import { hapticSuccess, hapticTick, hapticWarning } from '@/utils/haptics';

const REQUEST_WINDOW_SECONDS = 30;

export default function DriverDashboardScreen() {
  const router = useRouter();
  const { state } = useSession();
  const requestWindowSeconds = state.fastDemo ? 10 : REQUEST_WINDOW_SECONDS;
  const {
    driverOnline,
    setDriverOnline,
    incomingRequest,
    status,
    booking,
    acceptRequest,
    declineRequest,
  } = useRide();

  const [secondsLeft, setSecondsLeft] = useState(requestWindowSeconds);

  // Count down the accept window while a request is on the table.
  useEffect(() => {
    if (!incomingRequest) return;
    setSecondsLeft(requestWindowSeconds);
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          declineRequest();
          return 0;
        }
        hapticTick();
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [incomingRequest, declineRequest, requestWindowSeconds]);

  const today = new Date().toISOString().slice(0, 10);
  const todayEarnings = state.earnings.find((e) => e.date === today);
  const activeRide = status === 'assigned' || status === 'active' || status === 'complete';

  const onAccept = () => {
    hapticSuccess();
    acceptRequest();
  };
  const onDecline = () => {
    hapticWarning();
    declineRequest();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>NAGA-GENTRA</Text>
          <Text style={styles.greeting}>Hello, {state.driver.name.split(' ')[0]}! 👋</Text>
        </View>
        <PressableScale
          accessibilityRole="button"
          style={styles.avatar}
          onPress={() => router.push('/(driver)/profile')}
          haptic>
          <Text style={styles.avatarEmoji}>🧔🏻</Text>
        </PressableScale>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Earnings hero */}
        <LinearGradient colors={Colors.driverGradient} style={styles.hero}>
          <Text style={styles.heroKicker}>TODAY'S EARNINGS</Text>
          <AnimatedNumber
            value={todayEarnings?.cash ?? 0}
            duration={700}
            format={(v) => formatPeso(Math.round(v))}
            style={styles.heroValue}
          />
          <View style={styles.heroStats}>
            <HeroStat label="Trips" value={String(todayEarnings?.trips ?? 0)} />
            <HeroStat
              label="Online"
              value={todayEarnings ? `${Math.round(todayEarnings.onlineMinutes / 60)}h` : '0h'}
            />
          </View>
        </LinearGradient>

        <OnlineToggle online={driverOnline} onChange={setDriverOnline} />

        {/* Incoming request */}
        {incomingRequest && (
          <View style={styles.requestCard}>
            <View style={styles.requestHead}>
              <Text style={styles.requestKicker}>INCOMING BOOKING</Text>
              <RequestTimer
                secondsLeft={secondsLeft}
                total={requestWindowSeconds}
                color={Colors.warning}
              />
            </View>
            <View style={styles.requestPassengerRow}>
              <Icon name="account" size={16} color={Colors.primaryText} />
              <Text style={styles.requestPassenger}>{incomingRequest.passengerName}</Text>
              <Icon name="star" size={14} color={Colors.star} />
              <Text style={styles.requestRating}>
                {incomingRequest.passengerRating?.toFixed(1)}
              </Text>
            </View>
            <Text style={styles.requestRoute}>
              {incomingRequest.pickup.name} → {incomingRequest.destination.name}
            </Text>
            <Text style={styles.requestMeta}>
              {incomingRequest.vehicleType === 'tricycle' ? 'Tricycle' : 'Jeepney'} ·{' '}
              {incomingRequest.distanceKm.toFixed(1)} km · {formatPeso(incomingRequest.fare.total)}
            </Text>
            <View style={styles.requestActions}>
              <PrimaryButton
                label="Decline"
                variant="secondary"
                onPress={onDecline}
                style={styles.requestButton}
              />
              <PrimaryButton
                label="Accept"
                gradient
                color={Colors.driver}
                onPress={onAccept}
                style={styles.requestButton}
              />
            </View>
          </View>
        )}

        {/* Active booking */}
        {activeRide && booking && (
          <View style={styles.activeCard}>
            <Text style={styles.activeKicker}>
              {status === 'complete'
                ? 'BOOKING COMPLETE'
                : status === 'active'
                  ? 'ON THE ROAD'
                  : 'GOING TO PICKUP'}
            </Text>
            <Text style={styles.activeRoute}>
              {booking.pickup.name} → {booking.destination.name}
            </Text>
            <Text style={styles.activeMeta}>
              {booking.passengerName ?? 'Passenger'} · {formatPeso(booking.fare.total)}
            </Text>
            {status === 'assigned' && (
              <PrimaryButton
                label="Proceed to pickup"
                gradient
                color={Colors.driver}
                icon="navigation"
                onPress={() => router.push('/ride/driver-request')}
              />
            )}
            {status === 'active' && (
              <PrimaryButton
                label="Open ride screen"
                gradient
                color={Colors.driver}
                onPress={() => router.push('/ride/drive-active')}
              />
            )}
            {status === 'complete' && (
              <PrimaryButton
                label="Collect payment"
                gradient
                color={Colors.driver}
                icon="cash-check"
                onPress={() => router.push('/ride/drive-complete')}
              />
            )}
          </View>
        )}

        {/* Waiting state */}
        {driverOnline && !incomingRequest && !activeRide && (
          <View style={styles.waiting}>
            <EmptyState
              icon="radar"
              title="Listening for bookings…"
              body="We'll ping you when a passenger nearby books a ride."
            />
          </View>
        )}

        {!driverOnline && !activeRide && (
          <View style={styles.waiting}>
            <EmptyState
              icon="weather-night"
              title="You're offline"
              body="Go online to start receiving bookings."
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.heroStat}>
      <Text style={styles.heroStatValue}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

/** Countdown badge — amber seconds pill inside a gently pulsing halo ring. */
function RequestTimer({
  secondsLeft,
  total,
  color,
}: {
  secondsLeft: number;
  total: number;
  color: string;
}) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }),
      -1,
      true,
    );
  }, [pulse]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.55 - 0.35 * pulse.value,
    transform: [{ scale: 1 + 0.3 * pulse.value }],
  }));

  const fraction = Math.max(0, Math.min(1, secondsLeft / total));

  return (
    <View style={styles.timerWrap}>
      <Animated.View style={[styles.timerHalo, { borderColor: color }, haloStyle]} />
      <View style={[styles.timerCore, { backgroundColor: color }]}>
        <AnimatedNumber
          value={secondsLeft}
          duration={300}
          format={(v) => `${Math.round(v)}s`}
          style={styles.timerText}
        />
      </View>
      <View style={styles.timerTicks}>
        {[0.25, 0.5, 0.75].map((t) => (
          <View key={t} style={[styles.tick, { opacity: fraction <= t ? 1 : 0.3 }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  kicker: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.driver,
    letterSpacing: LetterSpacing.wide,
  },
  greeting: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.heading,
    color: Colors.primaryText,
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  hero: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.sm,
    ...shadows.elevated,
  },
  heroKicker: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.onAccentSoft,
    letterSpacing: LetterSpacing.wide,
  },
  heroValue: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.displayLarge,
    color: Colors.onAccent,
  },
  heroStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  heroStat: {
    flex: 1,
    backgroundColor: Colors.accentGlass,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    gap: 2,
  },
  heroStatValue: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.body,
    color: Colors.onAccent,
  },
  heroStatLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.onAccentMuted,
  },
  requestCard: {
    backgroundColor: Colors.card,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: Colors.warning,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  requestHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestKicker: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.warning,
    letterSpacing: LetterSpacing.wide,
  },
  timerWrap: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerHalo: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
  },
  timerCore: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.small,
    color: Colors.onAccent,
  },
  timerTicks: {
    position: 'absolute',
    bottom: -14,
    flexDirection: 'row',
    gap: 3,
  },
  tick: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.warning,
  },
  requestPassengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  requestPassenger: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.body,
    color: Colors.primaryText,
  },
  requestRating: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.caption,
    color: Colors.primaryText,
  },
  requestRoute: {
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.body,
    color: Colors.primaryText,
  },
  requestMeta: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.small,
    color: Colors.secondaryText,
  },
  requestActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  requestButton: {
    flex: 1,
  },
  activeCard: {
    backgroundColor: Colors.driverSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: Colors.driver,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  activeKicker: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.driver,
    letterSpacing: LetterSpacing.wide,
  },
  activeRoute: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.body,
    color: Colors.primaryText,
  },
  activeMeta: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.small,
    color: Colors.secondaryText,
    marginBottom: spacing.sm,
  },
  waiting: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
});