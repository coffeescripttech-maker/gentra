import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { FontFamily, FontSize, LineHeight } from '@/constants/typography';

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  body?: string;
  action?: ReactNode;
}

/** Consistent icon + title + body (+ optional action) block for empty screens. */
export function EmptyState({ icon = 'map-marker-off', title, body, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Icon name={icon} size={34} color={Colors.secondaryText} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.huge,
    gap: spacing.sm,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.subtitle,
    color: Colors.primaryText,
    textAlign: 'center',
  },
  body: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.small,
    color: Colors.secondaryText,
    textAlign: 'center',
    lineHeight: LineHeight.small,
  },
});