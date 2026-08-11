import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MapboxMap } from '@/components/mapbox-map';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { EmptyState } from '@/components/ui/empty-state';
import { Glass } from '@/components/ui/glass';
import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';
import { FontFamily, FontSize, LetterSpacing } from '@/constants/typography';
import { useRide } from '@/context/ride';
import { hapticWarning } from '@/utils/haptics';

const RIDE_SECONDS = 30;

const VEHICLE_ICON: Record<'tricycle' | 'jeepney', IconName> = {
  tricycle: 'motorbike',
  jeepney: 'bus',
};

export default function RideActiveScreen() {
  const router = useRouter();
  const { booking, progress, driverPosition, arrived } = useRide();
  const [showFallback, setShowFallback] = useState(Platform.OS === 'web');

  // If the map can't mount (no Mapbox token / offline / web), fall back to a progress view.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const timer = setTimeout(() => setShowFallback(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  if (!booking) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.empty}>
          <EmptyState
            icon="car-off"
            title="No active ride"
            body="Board your driver from the assigned screen to start tracking."
            action={<PrimaryButton label="Back to home" onPress={() => router.replace('/(passenger)/home')} />}
          />
        </View>
      </SafeAreaView>
    );
  }

  const vehicleLabel = booking.vehicleType === 'tricycle' ? 'Tricycle' : 'Jeepney';
  const center = {
    latitude: (booking.pickup.latLng.latitude + booking.destination.latLng.latitude) / 2,
    longitude: (booking.pickup.latLng.longitude + booking.destination.latLng.longitude) / 2,
  };
  const secondsLeft = Math.max(0, Math.ceil((1 - progress) * RIDE_SECONDS));

  const onEmergency = () => {
    hapticWarning();
    Alert.alert(
      'Emergency',
      'In this prototype, pressing this would alert your emergency contact and the Naga PNP hotline.',
      [{ text: 'OK' }],
    );
  };

  return (
    <View style={styles.screen}>
      {/* Full-bleed map / fallback */}
      <View style={styles.mapLayer}>
        {!showFallback && (
          <MapboxMap
            style={StyleSheet.absoluteFill}
            center={center}
            zoom={14}
            follow={driverPosition}
            markers={[
              ...(driverPosition
                ? [{ id: 'driver', coordinate: driverPosition, color: Colors.brand, title: 'Your driver' }]
                : []),
              {
                id: 'destination',
                coordinate: booking.destination.latLng,
                color: Colors.error,
                title: booking.destination.name,
              },
            ]}
            onReady={() => setShowFallback(false)}
            onError={() => setShowFallback(true)}
          />
        )}

        {showFallback && (
          <View style={styles.fallback}>
            <View style={styles.fallbackIcon}>
              <Icon name="map-marker-path" size={40} color={Colors.brand} />
            </View>
            <Text style={styles.fallbackTitle}>{Math.round(progress * 100)}% of the way</Text>
            <Text style={styles.fallbackSub}>
              Tracking your {vehicleLabel.toLowerCase()} to {booking.destination.name}…
            </Text>
            <View style={styles.fallbackBar}>
              <ProgressBar progress={progress} color={Colors.brand} />
            </View>
          </View>
        )}
      </View>

      {/* Floating glass header */}
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <Glass style={styles.header} intensity={80}>
          <PressableScale
            accessibilityRole="button"
            style={styles.backBtn}
            onPress={() => router.back()}
            haptic>
            <Icon name="arrow-left" size={20} color={Colors.primaryText} />
          </PressableScale>
          <Text style={styles.title}>Ride in progress</Text>
          <View style={styles.headerSpacer} />
        </Glass>
      </SafeAreaView>

      {/* Glass bottom sheet */}
      <Glass style={styles.bottomCard} intensity={80}>
        <View style={styles.handleWrap}>
          <View style={styles.handle} />
        </View>

        <View style={styles.routeRow}>
          <View style={styles.routeText}>
            <Text style={styles.routeName}>{booking.pickup.name}</Text>
            <Icon name="menu-down" size={18} color={Colors.border} />
            <Text style={styles.routeName}>{booking.destination.name}</Text>
          </View>
          <View style={styles.etaBlock}>
            <Text style={styles.etaKicker}>ETA</Text>
            <AnimatedNumber
              value={secondsLeft}
              duration={400}
              format={(v) => `${Math.round(v)}s`}
              style={styles.etaValue}
            />
            <View style={styles.modePill}>
              <Icon name={VEHICLE_ICON[booking.vehicleType]} size={13} color={Colors.brand} />
              <Text style={styles.modePillText}>
                {booking.rideMode === 'special' ? 'Special' : 'Shared'}
              </Text>
            </View>
          </View>
        </View>

        <ProgressBar progress={progress} color={Colors.brand} />

        <View style={styles.actions}>
          <PressableScale
            accessibilityRole="button"
            style={styles.emergencyBtn}
            onPress={onEmergency}
            haptic>
            <Icon name="alert" size={18} color={Colors.error} />
            <Text style={styles.emergencyText}>Emergency</Text>
          </PressableScale>
          {arrived ? (
            <View style={styles.completeWrap}>
              <PrimaryButton
                label="Complete ride"
                icon="check-circle"
                gradient
                onPress={() => router.replace('/ride/complete')}
              />
            </View>
          ) : (
            <Text style={styles.arriving}>{secondsLeft}s to drop-off…</Text>
          )}
        </View>
      </Glass>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mapLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.muted,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  title: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.body,
    color: Colors.primaryText,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.huge,
    gap: spacing.sm,
  },
  fallbackIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  fallbackTitle: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.subtitle,
    color: Colors.primaryText,
  },
  fallbackSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.small,
    color: Colors.secondaryText,
    textAlign: 'center',
  },
  fallbackBar: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
  },
  bottomCard: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
    ...shadows.modal,
  },
  handleWrap: {
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  routeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  routeText: {
    flex: 1,
    gap: 2,
  },
  routeName: {
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.body,
    color: Colors.primaryText,
  },
  etaBlock: {
    alignItems: 'flex-end',
    gap: 2,
  },
  etaKicker: {
    fontFamily: FontFamily.button,
    fontSize: 10,
    color: Colors.secondaryText,
    letterSpacing: LetterSpacing.wide,
  },
  etaValue: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.display,
    color: Colors.brand,
    lineHeight: 42,
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.brandSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 2,
  },
  modePillText: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.brand,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  emergencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: Colors.dangerSoft,
    borderRadius: radius.md,
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
  },
  emergencyText: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.small,
    color: Colors.error,
  },
  completeWrap: {
    flex: 1,
  },
  arriving: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: FontSize.small,
    color: Colors.secondaryText,
    textAlign: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
});