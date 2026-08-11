import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Colors } from '@/constants/colors';
import { radius } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';
import { FontFamily, FontSize } from '@/constants/typography';

type Variant = 'primary' | 'secondary' | 'ghost';

interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  /** Accent color (defaults to the app brand color). */
  color?: string;
  /** Render the accent as a vertical gradient (uses brand/driver gradient tokens). */
  gradient?: boolean;
  /** Optional leading icon. */
  icon?: IconName;
  disabled?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  color = Colors.brand,
  gradient = false,
  icon,
  disabled = false,
  style,
}: PrimaryButtonProps) {
  const isGhost = variant === 'ghost';
  const isSecondary = variant === 'secondary';
  const fillColor = isGhost ? 'transparent' : isSecondary ? Colors.muted : color;
  const textColor = isGhost ? color : isSecondary ? Colors.primaryText : Colors.onAccent;

  // Gradient only applies to the filled primary variant, and only for the
  // two accent tokens that have a gradient.
  const gradientColors =
    isGhost || isSecondary || !gradient
      ? null
      : color === Colors.brand
        ? Colors.brandGradient
        : color === Colors.driver
          ? Colors.driverGradient
          : null;

  const content = (
    <View style={styles.content}>
      {icon ? <Icon name={icon} size={20} color={textColor} /> : null}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </View>
  );

  return (
    <PressableScale
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      haptic
      style={[
        styles.base,
        variant === 'primary' && (gradientColors ? shadows.elevated : shadows.card),
        disabled && styles.disabled,
        style,
      ]}>
      {gradientColors ? (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.fill}>
          {content}
        </LinearGradient>
      ) : (
        <View style={[styles.fill, { backgroundColor: fillColor }]}>{content}</View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.body,
  },
});