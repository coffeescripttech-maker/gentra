import { useEffect, useRef, useState } from 'react';
import { Text, type TextProps } from 'react-native';

interface AnimatedNumberProps extends TextProps {
  value: number;
  /** Duration of the count-up in ms. */
  duration?: number;
  /** Formats the displayed value. */
  format?: (v: number) => string;
}

/** Counts to `value` with an ease-out tween — fares, earnings, ETAs. */
export function AnimatedNumber({
  value,
  duration = 600,
  format = (v) => String(Math.round(v)),
  ...rest
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (value - from) * eased;
      setDisplay(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = value;
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return <Text {...rest}>{format(display)}</Text>;
}