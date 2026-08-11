import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  ZoomIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FareBreakdown } from '@/components/fare-breakdown';
import { EmptyState } from '@/components/ui/empty-state';
import { Stagger } from '@/components/ui/fade-in-view';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { FontFamily, FontSize, LetterSpacing } from '@/constants/typography';
import { useRide } from '@/context/ride';
import { formatPeso } from '@/utils/fare';
import { hapticLight, hapticSuccess } from '@/utils/haptics';

const TIP_OPTIONS = [0, 10, 20, 50];

export default function RideCompleteScreen() {
  const router = useRouter();
  const { booking, finishPassengerRide, resetRide } = useRide();
  const [tip, setTip] = useState(0);
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  if (!booking) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <EmptyState
            icon="clipboard-remove-outline"
            title="No ride to review"
            body="Completed trips appear here so you can tip and rate your driver."
            action={<PrimaryButton label="Back to home" onPress={() => router.replace('/(passenger)/home')} />}
          />
        </View>
      </SafeAreaView>
    );
  }

  const submit = () => {
    hapticSuccess();
    finishPassengerRide(tip, rating);
    setSubmitted(true);
  };

  const done = () => {
    resetRide();
    router.replace('/(passenger)/home');
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Stagger interval={100}>
            <View style={styles.celebration}>
              <Animated.View entering={ZoomIn.delay(80).springify().damping(12)}>
                <View style={styles.celebBadge}>
                  <Text style={styles.thanksEmoji}>🎉</Text>
                </View>
              </Animated.View>
            </View>
            <Text style={styles.kicker}>SALAMAT!</Text>
            <Text style={styles.title}>Trip saved</Text>
            <Text style={styles.body}>
              Your trip is in your history.{' '}
              {tip > 0 && `Your driver got a ${formatPeso(tip)} tip.`}
            </Text>
            <FareBreakdown fare={booking.fare} tip={tip} animated />
            <PrimaryButton label="Back to home" icon="check-circle" gradient onPress={done} />
          </Stagger>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Stagger interval={80}>
          <View>
            <Text style={styles.kicker}>TRIP COMPLETE</Text>
            <Text style={styles.title}>How was your ride?</Text>
          </View>

          <FareBreakdown fare={booking.fare} animated />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add a tip</Text>
            <View style={styles.tipRow}>
              {TIP_OPTIONS.map((amount) => (
                <TipChip
                  key={amount}
                  active={tip === amount}
                  onPress={() => {
                    hapticLight();
                    setTip((prev) => (prev === amount ? 0 : amount));
                  }}>
                  {amount === 0 ? 'No tip' : formatPeso(amount)}
                </TipChip>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rate your driver</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} filled={star <= rating} onPress={() => setRating(star)} />
              ))}
            </View>
          </View>

          <PrimaryButton label="Finish & save trip" icon="check-circle" gradient onPress={submit} />
        </Stagger>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Tip chip — border/bg/text spring to the accent when selected. */
function TipChip({
  active,
  onPress,
  children,
}: {
  active: boolean;
  onPress: () => void;
  children: string;
}) {
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(active ? 1 : 0, { damping: 20, stiffness: 300 });
  }, [active, progress]);

  const chipStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(progress.value, [0, 1], [Colors.border, Colors.brand]),
    backgroundColor: interpolateColor(progress.value, [0, 1], [Colors.card, Colors.brandSoft]),
  }));
  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [Colors.primaryText, Colors.brand]),
  }));

  return (
    <PressableScale onPress={onPress} haptic style={styles.tipWrap}>
      <Animated.View style={[styles.tipChip, chipStyle]}>
        <Animated.Text style={[styles.tipText, textStyle]}>{children}</Animated.Text>
      </Animated.View>
    </PressableScale>
  );
}

/** Rating star — springs to full size/scale when filled. */
function Star({ filled, onPress }: { filled: boolean; onPress: () => void }) {
  const progress = useSharedValue(filled ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(filled ? 1 : 0, { damping: 16, stiffness: 320 });
  }, [filled, progress]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 0.85 + 0.15 * progress.value }],
  }));

  return (
    <PressableScale onPress={onPress} haptic hitSlop={8}>
      <Animated.View style={style}>
        <Icon
          name={filled ? 'star' : 'star-outline'}
          size={38}
          color={filled ? Colors.star : Colors.border}
        />
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: spacing.xxl,
    paddingBottom: spacing.huge,
    gap: spacing.lg,
    alignItems: 'stretch',
  },
  kicker: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.brand,
    letterSpacing: LetterSpacing.wide,
    textAlign: 'center',
  },
  title: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.title,
    color: Colors.primaryText,
    textAlign: 'center',
  },
  body: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.small,
    color: Colors.secondaryText,
    textAlign: 'center',
  },
  celebration: {
    alignItems: 'center',
  },
  celebBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  thanksEmoji: {
    fontSize: 48,
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
  tipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tipWrap: {
    flex: 1,
    borderRadius: radius.md,
  },
  tipChip: {
    borderRadius: radius.md,
    borderWidth: 2,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tipText: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.small,
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
});