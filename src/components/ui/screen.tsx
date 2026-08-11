import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
  padded?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Style applied to the inner content container. */
  style?: StyleProp<ViewStyle>;
}

/** Standard app screen: safe-area background + optional scroll. */
export function Screen({
  children,
  scroll = true,
  padded = true,
  contentContainerStyle,
  style,
}: ScreenProps) {
  const contentStyle = [padded && styles.padded, contentContainerStyle];

  if (!scroll) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.flex, contentStyle, style]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={contentStyle}
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  padded: {
    padding: 24,
  },
});
