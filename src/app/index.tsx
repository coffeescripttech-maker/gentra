import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';

import { Colors } from '@/constants/colors';
import { shadows } from '@/constants/shadows';
import { LetterSpacing, FontFamily, FontSize, LineHeight } from '@/constants/typography';
import { useSession } from '@/context/session';

/** Branded splash — routes to role selection (first run) or the saved role. */
export default function SplashRoute() {
  const router = useRouter();
  const { state } = useSession();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (state.roleChosen) {
        const home = state.role === 'driver' ? '/(driver)/dashboard' : '/(passenger)/home';
        router.replace(home);
      } else {
        router.replace('/role');
      }
    }, 1700);
    return () => clearTimeout(timer);
  }, [router, state.role, state.roleChosen]);

  return (
    <View style={styles.container}>
      <Animated.View entering={ZoomIn.delay(80).springify().damping(12)}>
        <LinearGradient colors={Colors.brandGradient} style={styles.badge}>
          <Text style={styles.badgeEmoji}>🚖</Text>
        </LinearGradient>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(320).springify().damping(16)}>
        <Text style={styles.title}>NAGA-GENTRA</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(460).springify().damping(16)}>
        <Text style={styles.tagline}>Ride smarter. Arrive sooner.</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(600)}>
        <Text style={styles.topic}>Tricycle &amp; Jeepney · Naga City</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  badge: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...shadows.elevated,
  },
  badgeEmoji: {
    fontSize: 52,
  },
  title: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.display,
    color: Colors.primaryText,
    letterSpacing: LetterSpacing.wide,
  },
  tagline: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.body,
    color: Colors.secondaryText,
    marginTop: 8,
    lineHeight: LineHeight.body,
    textAlign: 'center',
  },
  topic: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.small,
    color: Colors.brand,
    marginTop: 20,
    letterSpacing: LetterSpacing.display,
    textTransform: 'uppercase',
  },
});