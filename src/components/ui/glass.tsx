import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import {
  Platform,
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';

import { Colors } from '@/constants/colors';

interface GlassProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Blur intensity for iOS (0–100); the card fallbacks ignore it. */
  intensity?: number;
}

/**
 * Frosted surface for floating elements over maps/imagery.
 *
 * iOS gets a true native blur. The Android "dimezis" blur method requires a
 * `blurTarget` view and can't reliably capture a Mapbox WebView, so non-iOS
 * renders a translucent card instead — the same look the old
 * `experimentalBlurMethod="dimezisBlurView"` fell back to, minus the warning.
 */
export function Glass({ children, style, intensity = 60 }: GlassProps) {
  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={intensity} tint="light" style={style}>
        {children}
      </BlurView>
    );
  }
  return <View style={[styles.fallback, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
});