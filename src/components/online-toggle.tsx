import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';
import { FontFamily, FontSize } from '@/constants/typography';

interface OnlineToggleProps {
  online: boolean;
  onChange: (value: boolean) => void;
}

const TRACK_WIDTH = 58;
const TRACK_HEIGHT = 34;
const KNOB_SIZE = 26;
const KNOB_PADDING = 4;
const KNOB_TRAVEL = TRACK_WIDTH - KNOB_SIZE - KNOB_PADDING * 2;

/** Driver go-online card — gradient badge + a spring-sliding switch knob. */
export function OnlineToggle({ online, onChange }: OnlineToggleProps) {
  const progress = useSharedValue(online ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(online ? 1 : 0, { damping: 18, stiffness: 240 });
  }, [online, progress]);

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: KNOB_TRAVEL * progress.value }],
  }));
  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [Colors.border, Colors.driver]),
  }));

  return (
    <PressableScale
      accessibilityRole="switch"
      accessibilityState={{ checked: online }}
      onPress={() => onChange(!online)}
      haptic
      style={styles.card}>
      {online ? (
        <LinearGradient colors={Colors.driverGradient} style={styles.badge}>
          <Icon name="wifi" size={22} color={Colors.onAccent} />
        </LinearGradient>
      ) : (
        <View style={[styles.badge, styles.badgeOff]}>
          <Icon name="wifi-off" size={22} color={Colors.secondaryText} />
        </View>
      )}

      <View style={styles.text}>
        <Text style={styles.label}>{online ? 'You are online' : 'Go online'}</Text>
        <Text style={styles.hint}>
          {online ? 'Ready for bookings' : 'Tap to accept bookings'}
        </Text>
      </View>

      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.knob, knobStyle]} />
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: Colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: spacing.lg,
    ...shadows.card,
  },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOff: {
    backgroundColor: Colors.muted,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.subtitle,
    color: Colors.primaryText,
  },
  hint: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
  },
  knob: {
    position: 'absolute',
    top: KNOB_PADDING,
    left: KNOB_PADDING,
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: Colors.card,
    ...shadows.card,
  },
});