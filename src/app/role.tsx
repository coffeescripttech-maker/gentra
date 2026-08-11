import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen } from '@/components/ui/screen';
import { Stagger } from '@/components/ui/fade-in-view';
import { Colors } from '@/constants/colors';
import { radius } from '@/constants/spacing';
import { LetterSpacing, FontFamily, FontSize, LineHeight } from '@/constants/typography';
import { useSession } from '@/context/session';

interface RoleCardProps {
  icon: IconName;
  title: string;
  body: string;
  cta: string;
  colors: readonly [string, string];
  onPress: () => void;
}

function RoleCard({ icon, title, body, cta, colors, onPress }: RoleCardProps) {
  return (
    <PressableScale accessibilityRole="button" onPress={onPress} haptic style={styles.cardShadow}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.card}>
        <View style={styles.iconBadge}>
          <Icon name={icon} size={24} color={Colors.onAccent} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardBody}>{body}</Text>
        <Text style={styles.cardCta}>{cta}</Text>
      </LinearGradient>
    </PressableScale>
  );
}

export default function RoleScreen() {
  const router = useRouter();
  const { setRole } = useSession();

  const choose = (role: 'passenger' | 'driver') => {
    setRole(role);
    router.replace(role === 'driver' ? '/(driver)/dashboard' : '/(passenger)/home');
  };

  return (
    <Screen>
      <Stagger interval={100}>
        <View style={styles.header}>
          <Text style={styles.kicker}>NAGA-GENTRA</Text>
          <Text style={styles.title}>Who are you today?</Text>
          <Text style={styles.subtitle}>
            Choose a role to explore the prototype. You can switch anytime from your profile.
          </Text>
        </View>

        <RoleCard
          icon="car-multiple"
          title="I'm a Passenger"
          body="Book a tricycle or jeepney, see live capacity, and track your driver."
          cta="Book a ride →"
          colors={Colors.brandGradient}
          onPress={() => choose('passenger')}
        />
        <RoleCard
          icon="steering"
          title="I'm a Driver"
          body="Go online, accept bookings, update capacity, and track your earnings."
          cta="Start earning →"
          colors={Colors.driverGradient}
          onPress={() => choose('driver')}
        />

        <View style={styles.footer}>
          <PrimaryButton
            label="Continue as Passenger"
            variant="secondary"
            onPress={() => choose('passenger')}
          />
          <Text style={styles.note}>Prototype demo · Works offline</Text>
        </View>
      </Stagger>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
    marginBottom: 4,
  },
  kicker: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.brand,
    letterSpacing: LetterSpacing.wide,
  },
  title: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.heading,
    color: Colors.primaryText,
  },
  subtitle: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.body,
    color: Colors.secondaryText,
    lineHeight: LineHeight.body,
  },
  cardShadow: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  card: {
    padding: 22,
    gap: 10,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.accentGlass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.title,
    color: Colors.onAccent,
  },
  cardBody: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.small,
    color: Colors.onAccentSoft,
    lineHeight: LineHeight.small,
  },
  cardCta: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.small,
    color: Colors.onAccent,
    marginTop: 4,
  },
  footer: {
    gap: 12,
    marginTop: 8,
  },
  note: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
    textAlign: 'center',
  },
});