import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen } from '@/components/ui/screen';
import { Icon, type IconName } from '@/components/ui/icon';
import { Colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';
import { FontFamily, FontSize, LetterSpacing, LineHeight } from '@/constants/typography';
import { useSession } from '@/context/session';

export default function DriverProfileScreen() {
  const router = useRouter();
  const { state, setFastDemo, reset } = useSession();
  const { driver } = state;

  const initials = driver.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const checklist: Array<{ key: keyof typeof driver.verification; label: string }> = [
    { key: 'license', label: "Driver's license" },
    { key: 'registration', label: 'Vehicle registration (OR/CR)' },
    { key: 'franchise', label: 'Franchise / TODA membership' },
    { key: 'photos', label: 'Vehicle photos (4 angles)' },
  ];

  return (
    <Screen>
      <View style={styles.header}>
        <LinearGradient colors={Colors.driverGradient} style={styles.avatar}>
          <Text style={styles.avatarInitials}>{initials}</Text>
        </LinearGradient>
        <Text style={styles.name}>{driver.name}</Text>
        <Text style={styles.phone}>{driver.phone}</Text>
      </View>

      <Section title="My vehicle">
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleIcon}>
            <Icon
              name={driver.vehicleType === 'tricycle' ? 'motorbike' : 'bus'}
              size={30}
              color={Colors.driver}
            />
          </View>
          <View style={styles.vehicleText}>
            <Text style={styles.rowTitle}>
              {driver.vehicleType === 'tricycle' ? 'Tricycle' : 'Jeepney'} · {driver.plate}
            </Text>
            <Text style={styles.rowSub}>Capacity: up to {driver.maxCapacity} passengers</Text>
          </View>
        </View>
      </Section>

      <Section title="Verification">
        {checklist.map((item) => {
          const verified = driver.verification[item.key];
          return (
            <Row
              key={item.key}
              icon={verified ? 'check-circle' : 'clock-outline'}
              label={item.label}
              sub={verified ? 'Verified' : 'Pending review'}
              tint={verified ? Colors.success : Colors.warning}
            />
          );
        })}
      </Section>

      <Section title="Demo settings">
        <Row
          icon="lightning-bolt"
          label="Fast demo mode"
          sub="Speeds up the ride simulation for presentations"
          tint={Colors.driver}
          right={
            <Switch
              value={state.fastDemo}
              onValueChange={setFastDemo}
              trackColor={{ true: Colors.driver, false: Colors.border }}
              thumbColor={Colors.onAccent}
            />
          }
        />
      </Section>

      <View style={styles.actions}>
        <PrimaryButton
          label="Switch to Passenger"
          icon="car-multiple"
          variant="secondary"
          onPress={() => router.replace('/role')}
        />
        <PrimaryButton label="Reset prototype data" variant="ghost" onPress={reset} />
      </View>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Row({
  icon,
  label,
  sub,
  tint,
  right,
}: {
  icon: IconName;
  label: string;
  sub: string;
  tint: string;
  right?: ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: `${tint}1A` }]}>
        <Icon name={icon} size={18} color={tint} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{label}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      {right ?? <Icon name="chevron-right" size={20} color={Colors.secondaryText} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.elevated,
  },
  avatarInitials: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.heading,
    color: Colors.onAccent,
    letterSpacing: LetterSpacing.normal,
  },
  name: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.title,
    color: Colors.primaryText,
  },
  phone: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.small,
    color: Colors.secondaryText,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.small,
    color: Colors.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: LetterSpacing.wide,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: radius.lg,
    padding: spacing.xs,
    ...shadows.card,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  vehicleIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.driverSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleText: {
    flex: 1,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.body,
    color: Colors.primaryText,
  },
  rowSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
    marginTop: 2,
    lineHeight: LineHeight.caption,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});