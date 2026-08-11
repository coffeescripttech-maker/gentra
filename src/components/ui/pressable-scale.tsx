import type { ReactNode } from 'react';
import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { hapticLight } from '@/utils/haptics';

interface PressableScaleProps extends PressableProps {
  /** Scale while pressed (default 0.97). */
  activeScale?: number;
  /** Fire a light haptic on press. */
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Press micro-interaction: springs to `activeScale` on press, back on release. */
export function PressableScale({
  activeScale = 0.97,
  haptic = false,
  onPressIn,
  onPressOut,
  style,
  children,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = (e: GestureResponderEvent) => {
    scale.value = withSpring(activeScale, { damping: 22, stiffness: 320 });
    if (haptic) hapticLight();
    onPressIn?.(e);
  };
  const handlePressOut = (e: GestureResponderEvent) => {
    scale.value = withSpring(1, { damping: 16, stiffness: 240 });
    onPressOut?.(e);
  };

  return (
    <AnimatedPressable
      {...rest}
      style={[animatedStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {children}
    </AnimatedPressable>
  );
}