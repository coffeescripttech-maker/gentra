import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedNumber } from '@/components/ui/animated-number';
import { EmptyState } from '@/components/ui/empty-state';
import { Stagger } from '@/components/ui/fade-in-view';
import { Screen } from '@/components/ui/screen';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';
import { FontFamily, FontSize, LetterSpacing } from '@/constants/typography';
import { useSession } from '@/context/session';
import { formatPeso } from '@/utils/fare';

type Period = 'daily' | 'weekly' | 'monthly';

const PERIODS: Array<{ key: Period; label: string }> = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
];

export default function EarningsScreen() {
  const { state } = useSession();
  const [period, setPeriod] = useState<Period>('daily');

  const today = new Date().toISOString().slice(0, 10);
  const days =
    period === 'daily'
      ? state.earnings.filter((e) => e.date === today)
      : state.earnings;

  const totalCash = days.reduce((sum, e) => sum + e.cash, 0);
  const totalTrips = days.reduce((sum, e) => sum + e.trips, 0);
  const totalMinutes = days.reduce((sum, e) => sum + e.onlineMinutes, 0);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.kicker}>EARNINGS</Text>
        <Text style={styles.title}>Your income</Text>
      </View>

      <Stagger interval={80}>
        {/* Gradient hero */}
        <LinearGradient colors={Colors.driverGradient} style={styles.summary}>
          <Text style={styles.summaryKicker}>
            {period === 'daily'
              ? "TODAY'S EARNINGS"
              : period === 'weekly'
                ? 'LAST 7 DAYS'
                : 'THIS MONTH'}
          </Text>
          <AnimatedNumber
            value={totalCash}
            duration={700}
            format={(v) => formatPeso(Math.round(v))}
            style={styles.summaryValue}
          />
          <View style={styles.summaryStats}>
            <SummaryStat label="Trips" value={String(totalTrips)} />
            <SummaryStat label="Online" value={`${Math.round(totalMinutes / 60)}h`} />
          </View>
        </LinearGradient>

        {/* Period segmented control */}
        <View>
          <Text style={styles.sectionTitle}>Period</Text>
          <SegmentedControl options={PERIODS} value={period} onChange={setPeriod} />
        </View>

        {days.length === 0 ? (
          <EmptyState
            icon="cash-remove"
            title="No trips in this period"
            body="Go online from the dashboard to start earning."
          />
        ) : (
          days.map((day) => (
            <View key={day.date} style={styles.dayCard}>
              <View style={styles.dayInfo}>
                <Text style={styles.dayDate}>{formatDay(day.date)}</Text>
                <Text style={styles.dayMeta}>
                  {day.trips} trips · {Math.round(day.onlineMinutes / 60)}h online
                </Text>
              </View>
              <Text style={styles.dayCash}>{formatPeso(day.cash)}</Text>
            </View>
          ))
        )}
      </Stagger>
    </Screen>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryStat}>
      <Text style={styles.summaryStatValue}>{value}</Text>
      <Text style={styles.summaryStatLabel}>{label}</Text>
    </View>
  );
}

function formatDay(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  header: {
    gap: 4,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  kicker: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.driver,
    letterSpacing: LetterSpacing.wide,
  },
  title: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.heading,
    color: Colors.primaryText,
  },
  summary: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing.lg,
    ...shadows.elevated,
  },
  summaryKicker: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.onAccentSoft,
    letterSpacing: LetterSpacing.wide,
  },
  summaryValue: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.displayLarge,
    color: Colors.onAccent,
  },
  summaryStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  summaryStat: {
    flex: 1,
    backgroundColor: Colors.accentGlass,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    gap: 2,
  },
  summaryStatValue: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.body,
    color: Colors.onAccent,
  },
  summaryStatLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.onAccentMuted,
  },
  sectionTitle: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.small,
    color: Colors.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: LetterSpacing.wide,
    marginBottom: spacing.sm,
  },
  dayCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  dayInfo: {
    gap: 2,
  },
  dayDate: {
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.body,
    color: Colors.primaryText,
  },
  dayMeta: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
  },
  dayCash: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.subtitle,
    color: Colors.driver,
  },
});