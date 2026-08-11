import { Children, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface FadeInViewProps {
  children: ReactNode;
  /** Delay before the entry animation starts (ms). */
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

/** Mount animation — fades + rises in once. */
export function FadeInView({ children, delay = 0, style }: FadeInViewProps) {
  return (
    <Animated.View
      style={style}
      entering={FadeInUp.delay(delay).springify().damping(18).stiffness(140)}
    >
      {children}
    </Animated.View>
  );
}

interface StaggerProps {
  children: ReactNode;
  /** Delay between each child's entry (ms). */
  interval?: number;
}

/**
 * Staggers full-width blocks in a vertical stack. Because each child gets
 * wrapped in an Animated.View, only use for column stacks of full-width cards.
 */
export function Stagger({ children, interval = 90 }: StaggerProps) {
  return (
    <>
      {Children.toArray(children).map((child, i) => (
        <Animated.View
          key={i}
          style={{ width: '100%' }}
          entering={FadeInUp.delay(i * interval).springify().damping(18).stiffness(140)}
        >
          {child}
        </Animated.View>
      ))}
    </>
  );
}