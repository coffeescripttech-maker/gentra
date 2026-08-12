import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, LayoutAnimation, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { MapboxMap, type MapboxMapHandle } from '@/components/mapbox-map';
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
import { getDriver } from '@/data';
import { formatPeso } from '@/utils/fare';
import { hapticWarning } from '@/utils/haptics';

const RIDE_SECONDS = 30;

const VEHICLE_ICON: Record<'tricycle' | 'jeepney', IconName> = {
  tricycle: 'motorbike',
  jeepney: 'bus',
};

export default function RideActiveScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { booking, progress, driverPosition, arrived } = useRide();
  const [mapError, setMapError] = useState(false);
  // Tap the handle to collapse the trip card; tap again to pull it back up.
  const [sheetOpen, setSheetOpen] = useState(true);

  const toggleSheet = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSheetOpen((open) => !open);
  };

  // Never let "Complete ride" hide behind a collapsed sheet.
  useEffect(() => {
    if (arrived) setSheetOpen(true);
  }, [arrived]);

  // Failsafe: if the map never reports ready or error (CDN blocked / offline),
  // drop a small hint instead of leaving a silently blank layer.
  useEffect(() => {
    const timer = setTimeout(() => setMapError(true), 8000);
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
  const driver = booking.driverId ? getDriver(booking.driverId) : undefined;
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
      {/* Full-bleed map — always mounted so it stays live through arrival */}
      <View style={styles.mapLayer}>
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
          onReady={() => setMapError(false)}
          onError={() => setMapError(true)}
        />

        {mapError && (
          <View style={styles.mapHint} pointerEvents="none">
            <Icon name="map-marker-off" size={16} color={Colors.secondaryText} />
            <Text style={styles.mapHintText}>Map unavailable — see the trip below</Text>
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
          <Text style={styles.title}>
            {arrived ? "You've arrived" : 'Ride in progress'}
          </Text>
          <View style={styles.headerSpacer} />
        </Glass>
      </SafeAreaView>

      {/* Bottom sheet — same card pattern as the map picker; tap the handle to collapse */}
      <View style={[styles.bottomArea, { bottom: insets.bottom + spacing.md }]}>
        <View style={styles.sheetCard}>
          <PressableScale
            accessibilityRole="button"
            onPress={toggleSheet}
            haptic
            style={styles.sheetHandleWrap}>
            <View style={styles.sheetHandle} />
            <Icon
              name={sheetOpen ? 'chevron-down' : 'chevron-up'}
              size={16}
              color={Colors.secondaryText}
            />
          </PressableScale>

          {/* Collapsed peek — who's driving + ETA, map stays wide open */}
          {!sheetOpen ? (
            <View style={styles.peekRow}>
              <View style={styles.peekAvatar}>
                <Text style={styles.peekAvatarEmoji}>{driver?.emoji}</Text>
              </View>
              <View style={styles.flex1}>
                <Text style={styles.peekName} numberOfLines={1}>
                  {driver?.name ?? vehicleLabel}
                </Text>
                <Text style={styles.peekSub} numberOfLines={1}>
                  {arrived ? '🎉 Arrived' : `${secondsLeft}s to drop-off`}
                </Text>
              </View>
              <Text style={styles.peekFare}>{formatPeso(booking.fare.total)}</Text>
            </View>
          ) : (
            <>
              <Text style={styles.sheetKicker}>
                {arrived ? "YOU'VE ARRIVED" : 'TRIP IN PROGRESS'}
              </Text>

              {driver && (
                <View style={styles.driverRow}>
                  <View style={styles.driverAvatar}>
                    <Text style={styles.driverAvatarEmoji}>{driver.emoji}</Text>
                  </View>
                  <View style={styles.flex1}>
                    <View style={styles.driverNameRow}>
                      <Text style={styles.driverName} numberOfLines={1}>
                        {driver.name}
                      </Text>
                      <Icon name="shield-check" size={14} color={Colors.brand} />
                    </View>
                    <View style={styles.driverMeta}>
                      <Icon name="star" size={12} color={Colors.star} />
                      <Text style={styles.driverRating}>{driver.rating.toFixed(1)}</Text>
                      <Text style={styles.driverDot}>·</Text>
                      <Text style={styles.driverPlate}>{driver.plate}</Text>
                    </View>
                  </View>
                  <View style={styles.driverVehicle}>
                    <Icon
                      name={VEHICLE_ICON[booking.vehicleType]}
                      size={16}
                      color={Colors.brand}
                    />
                    <Text style={styles.driverVehicleText}>{vehicleLabel}</Text>
                  </View>
                </View>
              )}

              <View style={styles.divider} />

              {/* Route rows, same shape as the map picker's trip card */}
              <View style={styles.routeRow}>
                <View style={[styles.placeDot, { backgroundColor: Colors.success }]}>
                  <Icon name="circle" size={12} color={Colors.onAccent} />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.placeName} numberOfLines={1}>
                    {booking.pickup.name}
                  </Text>
                  <Text style={styles.placeAddr} numberOfLines={1}>
                    {booking.pickup.address}
                  </Text>
                </View>
              </View>

              <View style={styles.routeRow}>
                <View style={[styles.placeDot, { backgroundColor: Colors.destination }]}>
                  <Icon name="map-marker" size={14} color={Colors.onAccent} />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.placeName} numberOfLines={1}>
                    {booking.destination.name}
                  </Text>
                  <Text style={styles.placeAddr} numberOfLines={1}>
                    {booking.destination.address}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.statsRow}>
                {arrived ? (
                  <View style={[styles.stat, styles.statArrived]}>
                    <Icon name="check-circle" size={16} color={Colors.success} />
                    <Text style={styles.statTextArrived}>Arrived</Text>
                  </View>
                ) : (
                  <View style={styles.stat}>
                    <Icon name="clock-outline" size={16} color={Colors.brand} />
                    <AnimatedNumber
                      value={secondsLeft}
                      duration={400}
                      format={(v) => `${Math.round(v)}s`}
                      style={styles.statText}
                    />
                  </View>
                )}
                <View style={styles.stat}>
                  <Icon name="cash" size={16} color={Colors.success} />
                  <Text style={styles.statText}>{formatPeso(booking.fare.total)}</Text>
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
            </>
          )}
        </View>
      </View>
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
  mapHint: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    ...shadows.card,
  },
  mapHintText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
  },
  bottomArea: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    gap: spacing.md,
  },
  sheetCard: {
    backgroundColor: Colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.modal,
  },
  sheetHandleWrap: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: spacing.xs,
  },
  sheetKicker: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
    letterSpacing: LetterSpacing.wide,
  },
  flex1: {
    flex: 1,
  },
  peekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  peekAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  peekAvatarEmoji: {
    fontSize: 16,
  },
  peekName: {
    flex: 1,
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.small,
    color: Colors.primaryText,
  },
  peekSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
  },
  peekFare: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.brand,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.brand,
  },
  driverAvatarEmoji: {
    fontSize: 20,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  driverName: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.body,
    color: Colors.primaryText,
    flexShrink: 1,
  },
  driverMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  driverRating: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.caption,
    color: Colors.primaryText,
  },
  driverDot: {
    color: Colors.border,
  },
  driverPlate: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
  },
  driverVehicle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.brandSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  driverVehicleText: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.brand,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: spacing.xs,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  placeDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeName: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.subtitle,
    color: Colors.primaryText,
  },
  placeAddr: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.brandSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statText: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.small,
    color: Colors.brand,
  },
  statArrived: {
    backgroundColor: Colors.successSoft,
  },
  statTextArrived: {
    color: Colors.success,
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