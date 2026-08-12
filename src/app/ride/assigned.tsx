import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  MapboxMap,
  type MapboxMapHandle,
  type MapboxMarker,
} from '@/components/mapbox-map';
import { CustomIcon } from '@/components/ui/custom-icon';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { EmptyState } from '@/components/ui/empty-state';
import { Stagger } from '@/components/ui/fade-in-view';
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

const VEHICLE_ICON: Record<'tricycle' | 'jeepney', IconName> = {
  tricycle: 'motorbike',
  jeepney: 'bus',
};

export default function RideAssignedScreen() {
  const router = useRouter();
  const {
    booking,
    progress,
    etaSeconds,
    arrived,
    driverPosition,
    boardVehicle,
    cancelBooking,
  } = useRide();

  const mapRef = useRef<MapboxMapHandle>(null);
  const [showMapFallback, setShowMapFallback] = useState(Platform.OS === 'web');

  if (!booking) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <EmptyState
            icon="car-off"
            title="No active ride"
            body="Start a booking from the home screen to see your driver here."
            action={
              <PrimaryButton
                label="Back to home"
                onPress={() => router.replace('/(passenger)/home')}
              />
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  const driver = booking.driverId ? getDriver(booking.driverId) : undefined;
  const vehicleLabel = booking.vehicleType === 'tricycle' ? 'Tricycle' : 'Jeepney';

  /** Leave the ride: clear the booking and return to the home tab. */
  const goHome = () => {
    cancelBooking();
    router.replace('/(passenger)/home');
  };

  const center = {
    latitude:
      (booking.pickup.latLng.latitude + booking.destination.latLng.latitude) / 2,
    longitude:
      (booking.pickup.latLng.longitude + booking.destination.latLng.longitude) / 2,
  };

  /** Driver bead: live position when moving, otherwise their starting spot. */
  const driveCoord = driverPosition ?? driver?.latLng ?? booking.pickup.latLng;
  const markers: MapboxMarker[] = [
    { id: 'pickup', coordinate: booking.pickup.latLng, color: Colors.success },
    {
      id: 'destination',
      coordinate: booking.destination.latLng,
      color: Colors.error,
      title: booking.destination.name,
    },
    { id: 'driver', coordinate: driveCoord, color: Colors.brand, title: 'Your driver' },
  ];

  /** Frame the whole route once the map tiles land. */
  const handleMapReady = () => {
    setShowMapFallback(false);
    mapRef.current?.setRoute(
      [booking.pickup.latLng, booking.destination.latLng],
      true,
      { padding: 36, maxZoom: 12.5 },
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Themed header with a way back ─────────────────────── */}
      <View style={styles.header}>
        <PressableScale
          accessibilityRole="button"
          style={styles.backBtn}
          onPress={goHome}
          haptic>
          <Icon name="arrow-left" size={20} color={Colors.primaryText} />
        </PressableScale>
        <Text style={styles.title}>Driver on the way</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <Stagger interval={80}>
          {/* ── Matched! driver hero ───────────────────────────── */}
          {driver && (
            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View style={styles.heroAvatar}>
                  <Text style={styles.heroAvatarEmoji}>{driver.emoji}</Text>
                </View>
                <View style={styles.heroInfo}>
                  <Text style={styles.heroKicker}>YOUR DRIVER</Text>
                  <View style={styles.heroNameRow}>
                    <Text style={styles.heroName} numberOfLines={1}>
                      {driver.name}
                    </Text>
                    <Icon name="shield-check" size={16} color={Colors.brand} />
                  </View>
                  <View style={styles.heroMeta}>
                    <Icon name="star" size={13} color={Colors.star} />
                    <Text style={styles.heroRating}>{driver.rating.toFixed(1)}</Text>
                    <Text style={styles.heroDot}>·</Text>
                    <Text style={styles.heroPlate}>{driver.plate}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.heroDivider} />

              <View style={styles.heroBottom}>
                <View style={styles.vehicleChip}>
                  <CustomIcon kind={booking.vehicleType} size={26} />
                  <Text style={styles.vehicleChipText}>{vehicleLabel}</Text>
                </View>
                <View style={styles.modePill}>
                  <Icon name="navigation" size={13} color={Colors.brand} />
                  <Text style={styles.modePillText}>
                    {booking.rideMode === 'special' ? 'Special ride' : 'Shared ride'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* ── Live approach map ──────────────────────────────── */}
          <View style={styles.mapCard}>
            <View style={styles.mapStage}>
              {!showMapFallback ? (
                <>
                  <MapboxMap
                    ref={mapRef}
                    style={StyleSheet.absoluteFill}
                    center={center}
                    zoom={12}
                    markers={markers}
                    onReady={handleMapReady}
                    onError={() => setShowMapFallback(true)}
                  />
                  {/* ETA chip floats over the map corner */}
                  <View style={styles.mapChip}>
                    {arrived ? (
                      <Text style={styles.mapChipArrived}>🎉 Driver has arrived</Text>
                    ) : (
                      <View style={styles.mapChipEta}>
                        <AnimatedNumber
                          value={etaSeconds}
                          duration={400}
                          format={(v) => `${Math.round(v)}s`}
                          style={styles.mapChipValue}
                        />
                        <Text style={styles.mapChipLabel}>to pickup</Text>
                      </View>
                    )}
                  </View>
                </>
              ) : (
                <View style={styles.mapFallback}>
                  <View style={styles.mapFallbackIcon}>
                    <Icon name="map-marker-path" size={30} color={Colors.brand} />
                  </View>
                  <View style={styles.mapFallbackText}>
                    <Text style={styles.mapFallbackTitle}>
                      {arrived ? 'Driver has arrived' : 'Heading to your pickup…'}
                    </Text>
                    <Text style={styles.mapFallbackSub}>
                      {arrived
                        ? `Look for ${driver?.plate ?? 'the vehicle'} outside.`
                        : `${vehicleLabel} · ${booking.distanceKm.toFixed(1)} km away`}
                    </Text>
                  </View>
                </View>
              )}
            </View>
            <View style={styles.mapBar}>
              <ProgressBar progress={progress} color={Colors.brand} />
            </View>
          </View>

          {/* ── Route + fare card ─────────────────────────────── */}
          <View style={styles.routeCard}>
            <View style={styles.routeRow}>
              <View style={styles.routeDot} />
              <Text style={styles.routeName} numberOfLines={1}>
                {booking.pickup.name}
              </Text>
            </View>
            <View style={styles.routeConnector} />
            <View style={styles.routeRow}>
              <View style={styles.routeDotDest} />
              <Text style={styles.routeName} numberOfLines={1}>
                {booking.destination.name}
              </Text>
            </View>

            <View style={styles.fareRow}>
              <View style={styles.fareItem}>
                <Icon name="map-marker-distance" size={14} color={Colors.secondaryText} />
                <Text style={styles.fareText}>{booking.distanceKm.toFixed(1)} km</Text>
              </View>
              <View style={styles.fareItem}>
                <Icon name={VEHICLE_ICON[booking.vehicleType]} size={14} color={Colors.secondaryText} />
                <Text style={styles.fareText}>
                  {booking.rideMode === 'special' ? 'Special' : 'Shared'}
                </Text>
              </View>
              <View style={styles.fareItem}>
                <Icon name="cash" size={14} color={Colors.success} />
                <Text style={[styles.fareText, styles.fareAmount]}>
                  {formatPeso(booking.fare.total)}
                </Text>
              </View>
            </View>
          </View>
        </Stagger>
      </ScrollView>

      {/* ── Sticky action ─────────────────────────────────────── */}
      <View style={styles.footer}>
        {arrived ? (
          <PrimaryButton
            label={`Board the ${vehicleLabel} & start ride`}
            icon={VEHICLE_ICON[booking.vehicleType]}
            gradient
            onPress={() => {
              boardVehicle();
              router.replace('/ride/active');
            }}
          />
        ) : (
          <PrimaryButton label="Cancel booking" variant="secondary" onPress={goHome} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  title: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.subtitle,
    color: Colors.primaryText,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },

  /* Match hero */
  heroCard: {
    backgroundColor: Colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroAvatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: Colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.brand,
  },
  heroAvatarEmoji: {
    fontSize: 28,
  },
  heroInfo: {
    flex: 1,
    gap: 2,
  },
  heroKicker: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
    letterSpacing: LetterSpacing.wide,
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroName: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.body,
    color: Colors.primaryText,
    flexShrink: 1,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroRating: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.caption,
    color: Colors.primaryText,
  },
  heroDot: {
    color: Colors.border,
  },
  heroPlate: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
  },
  heroDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  heroBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vehicleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.brandSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  vehicleChipText: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.brand,
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.muted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  modePillText: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
  },

  /* Live approach map */
  mapCard: {
    backgroundColor: Colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  mapStage: {
    height: 190,
    backgroundColor: Colors.muted,
  },
  mapChip: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: Colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    ...shadows.card,
  },
  mapChipEta: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  mapChipValue: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.body,
    color: Colors.brand,
  },
  mapChipLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
  },
  mapChipArrived: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.success,
  },
  mapBar: {
    padding: spacing.md,
  },
  mapFallback: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  mapFallbackIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapFallbackText: {
    flex: 1,
    gap: 2,
  },
  mapFallbackTitle: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.body,
    color: Colors.primaryText,
  },
  mapFallbackSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
  },

  /* Route + fare */
  routeCard: {
    backgroundColor: Colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
    ...shadows.card,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
  },
  routeDotDest: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
  },
  routeConnector: {
    width: 2,
    height: 14,
    borderLeftWidth: 2,
    borderLeftColor: Colors.border,
    borderStyle: 'dashed',
    marginLeft: 4,
  },
  routeName: {
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.body,
    color: Colors.primaryText,
    flex: 1,
  },
  fareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  fareItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  fareText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
  },
  fareAmount: {
    fontFamily: FontFamily.bodyBold,
    color: Colors.brand,
  },

  footer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
});