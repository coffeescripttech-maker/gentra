import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FareBreakdown } from '@/components/fare-breakdown';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';
import { FontFamily, FontSize, LetterSpacing } from '@/constants/typography';
import { useRide } from '@/context/ride';
import { formatPeso } from '@/utils/fare';
import { hapticSuccess } from '@/utils/haptics';

export default function DriveCompleteScreen() {
  const router = useRouter();
  const { booking, confirmPaymentAndReset } = useRide();

  if (!booking) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <EmptyState
            icon="cash-check"
            title="No ride to collect"
            body="Completed trips land here so you can confirm the payment."
            action={
              <PrimaryButton
                label="Back to dashboard"
                gradient
                color={Colors.driver}
                onPress={() => router.replace('/(driver)/dashboard')}
              />
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  const confirm = () => {
    hapticSuccess();
    confirmPaymentAndReset();
    router.replace('/(driver)/dashboard');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconCircle}>
          <Icon name="cash-check" size={40} color={Colors.driver} />
        </View>
        <Text style={styles.kicker}>RIDE COMPLETE</Text>
        <Text style={styles.title}>Collect payment</Text>
        <Text style={styles.body}>
          {booking.passengerName ?? 'Passenger'} owes you{' '}
          {formatPeso(booking.fare.total)} for the trip from {booking.pickup.name} to{' '}
          {booking.destination.name}.
        </Text>

        <FareBreakdown fare={booking.fare} accentColor={Colors.driver} />

        <PrimaryButton
          label={`Confirm payment received · ${formatPeso(booking.fare.total)}`}
          icon="check-circle"
          gradient
          color={Colors.driver}
          onPress={confirm}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: spacing.xxl,
    paddingBottom: spacing.huge,
    gap: spacing.md,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.driverSoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  kicker: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.driver,
    letterSpacing: LetterSpacing.wide,
    textAlign: 'center',
  },
  title: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.title,
    color: Colors.primaryText,
    textAlign: 'center',
  },
  body: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.small,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
});