import { useRouter } from 'expo-router';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Colors } from '@/constants/colors';

interface BackButtonProps {
  tint?: string;
  /** Glass-on-gradient variant — translucent white circle (default is muted gray). */
  inverse?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function BackButton({ tint, inverse = false, style }: BackButtonProps) {
  const router = useRouter();
  const color = tint ?? (inverse ? Colors.onAccent : Colors.primaryText);
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={() => router.back()}
      haptic
      style={[styles.back, inverse && styles.backInverse, style]}>
      <Icon name="arrow-left" size={22} color={color} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backInverse: {
    backgroundColor: Colors.accentGlass,
  },
});