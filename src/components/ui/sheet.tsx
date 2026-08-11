import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants/colors';
import { radius } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Max sheet height as a fraction of the window (default 0.85). */
  maxHeightRatio?: number;
}

/**
 * Draggable bottom sheet — springs open, drag-down to dismiss, tap backdrop to
 * close. The handle and backdrop are built in; content is whatever the caller
 * renders (keep it under `maxHeightRatio` or wrap in a ScrollView).
 */
export function Sheet({ visible, onClose, children, maxHeightRatio = 0.85 }: SheetProps) {
  const { height: windowHeight } = useWindowDimensions();
  const translateY = useSharedValue(windowHeight); // start off-screen
  const backdropOpacity = useSharedValue(0);
  const contentHeight = useSharedValue(windowHeight); // fallback until measured
  const [rendered, setRendered] = useState(visible);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      translateY.value = withSpring(0, { damping: 26, stiffness: 260 });
      backdropOpacity.value = withTiming(1, { duration: 220 });
    } else if (rendered) {
      translateY.value = withTiming(contentHeight.value, { duration: 240 }, (finished) => {
        if (finished) runOnJS(setRendered)(false);
      });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, rendered, translateY, backdropOpacity, contentHeight]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) translateY.value = e.translationY;
    })
    .onEnd((e) => {
      const shouldClose = e.translationY > contentHeight.value * 0.25 || e.velocityY > 900;
      if (shouldClose) {
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, { damping: 26, stiffness: 260 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));

  if (!rendered) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close">
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]} />
      </Pressable>
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[styles.sheet, sheetStyle, { maxHeight: windowHeight * maxHeightRatio }]}
          onLayout={(e) => {
            contentHeight.value = e.nativeEvent.layout.height;
          }}
        >
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: Colors.scrim,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...shadows.modal,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
});