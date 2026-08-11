import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/colors';

interface RadarProps {
  /** Outer diameter of the radar in px. */
  size?: number;
  /** Brand/accent color for rings, sweep, and center dot. */
  color?: string;
}

/**
 * Pulsing "searching for drivers" radar.
 *
 * Pure core `Animated` (native driver) so it stays smooth with zero extra
 * dependencies: two expanding/fading rings and a rotating quarter-circle sweep.
 */
export function Radar({ size = 120, color = Colors.brand }: RadarProps) {
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const sweep = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered rings: the second starts halfway through the first's cycle so
    // there's always a ring mid-expansion.
    const pulse1 = Animated.loop(
      Animated.timing(ring1, {
        toValue: 1,
        duration: 1600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    );
    const pulse2 = Animated.loop(
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(ring2, {
          toValue: 1,
          duration: 1600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    );
    // Continuous rotation of the sweep wedge.
    const spin = Animated.loop(
      Animated.timing(sweep, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    pulse1.start();
    pulse2.start();
    spin.start();
    return () => {
      pulse1.stop();
      pulse2.stop();
      spin.stop();
    };
  }, [ring1, ring2, sweep]);

  const ringScale = ring1.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1.15] });
  const ringOpacity = ring1.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });
  const ringScale2 = ring2.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1.15] });
  const ringOpacity2 = ring2.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });
  const sweepRotate = sweep.interpolate({ inputRange: [0, 1], outputRange: ['45deg', '405deg'] });

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: Colors.brandSoft,
        },
      ]}
    >
      {/* Expanding rings */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            opacity: ringOpacity2,
            transform: [{ scale: ringScale2 }],
          },
        ]}
      />

      {/* Rotating sweep wedge (border trick for a half-circle slice) */}
      <Animated.View
        style={[
          styles.sweep,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: size / 2,
            borderTopColor: color,
            borderRightColor: color,
            borderBottomColor: 'transparent',
            borderLeftColor: 'transparent',
            transform: [{ rotate: sweepRotate }],
          },
        ]}
      />

      {/* Center core */}
      <View style={[styles.core, { borderColor: color }]}>
        <View style={[styles.coreDot, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
  },
  sweep: {
    position: 'absolute',
    opacity: 0.45,
  },
  core: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});
