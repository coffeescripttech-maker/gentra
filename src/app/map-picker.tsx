import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MapboxMap, type MapboxMapHandle, type MapboxMarker } from '@/components/mapbox-map';
import { BackButton } from '@/components/ui/back-button';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';
import { FontFamily, FontSize, LineHeight, LetterSpacing } from '@/constants/typography';
import { useRide } from '@/context/ride';
import {
  customPlaceId,
  getLandmark,
  LANDMARKS,
  nearestLandmark,
  NAGA_CENTER,
  placeToParams,
} from '@/data/locations';
import type { Landmark, LatLng } from '@/types';
import { tripDistanceKm } from '@/utils/geo';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '';
const PICK_ZOOM = 16;
const SEARCH_ZOOM = 15;
/** Simulated route-calculation delay (the distance math itself is instant). */
const ROUTE_CALC_MS = 900;
/** Assumed tricycle pace — km per minute (≈21 km/h) for the ETA estimate. */
const KM_PER_MIN = 0.36;

type MapMode = 'pickup' | 'destination' | 'route';

/**
 * Stationary center pin — the map moves beneath it. The pin springs a settle
 * bounce + ripple every time the map stops, so picking feels alive.
 */
function CenterPin({ bounce }: { bounce: number }) {
  const scale = useSharedValue(1);
  const ripple = useSharedValue(0);
  const breath = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(0.82, { duration: 110, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 7, stiffness: 320 }),
    );
    ripple.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 420, easing: Easing.in(Easing.quad) }),
    );
  }, [bounce, scale, ripple]);

  // Gentle continuous breathing ring — quietly signals the map is pickable.
  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, { duration: 1700, easing: Easing.out(Easing.quad) }),
      -1,
      false,
    );
  }, [breath]);

  const pinStyle = useAnimatedStyle(() => ({
    // The wrapper is centered, so the icon's middle sits on the map center.
    // Lucide's pin tip is ~21px below the icon's center at size 46 — lift it
    // up so the tip (not the body) marks the exact selection point.
    transform: [{ translateY: -21 }, { scale: scale.value }],
  }));
  const breathStyle = useAnimatedStyle(() => ({
    opacity: (1 - breath.value) * 0.45,
    transform: [{ scale: 1 + breath.value * 1.6 }],
  }));
  const rippleStyle = useAnimatedStyle(() => ({
    opacity: (1 - ripple.value) * 0.7,
    transform: [{ scale: 0.85 + ripple.value * 1.9 }],
  }));

  return (
    <View pointerEvents="none" style={styles.pinLayer}>
      <Animated.View style={[styles.pulse, breathStyle]} />
      <Animated.View style={[styles.ripple, rippleStyle]} />
      <Animated.View style={pinStyle}>
        <Icon name="map-marker" size={46} color={Colors.pickup} />
      </Animated.View>
    </View>
  );
}

/**
 * Continuous pickup → destination → route map flow (Grab-style, but stays on
 * this one page the whole time). Pickup confirm flips the mode in place;
 * destination confirm draws the route and hands off to ride selection.
 */
export default function MapPickerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ pickupId?: string; destinationId?: string }>();
  const { draftPickup, setDraftPickup, setDraftDestination } = useRide();

  const mapRef = useRef<MapboxMapHandle>(null);
  const geocodeSeq = useRef(0);
  const aliveRef = useRef(true);

  // ── Flow state ────────────────────────────────────────────────────
  const [mode, setMode] = useState<MapMode>('pickup');
  const [pickup, setPickup] = useState<Landmark | null>(null);
  const [destination, setDestination] = useState<Landmark | null>(null);
  /** The place currently under the center pin (not yet confirmed). */
  const [pinned, setPinned] = useState<Landmark | null>(null);
  const [addressLoading, setAddressLoading] = useState(true);
  const [calculatingRoute, setCalculatingRoute] = useState(false);

  // ── Map / location state ─────────────────────────────────────────
  const [mapFailed, setMapFailed] = useState(false);
  const [myLocation, setMyLocation] = useState<LatLng | null>(null);
  const [locationFailed, setLocationFailed] = useState(false);
  const [query, setQuery] = useState('');
  const [centerTick, setCenterTick] = useState(0);

  // Where the journey starts: the saved pickup, or the home default.
  const pickupSeed = useMemo(
    () => draftPickup ?? getLandmark(params.pickupId ?? 'plaza-rizal'),
    [draftPickup, params.pickupId],
  );
  const initialCenter = useMemo(() => pickupSeed.latLng, [pickupSeed]);

  useEffect(() => {
    return () => {
      aliveRef.current = false;
    };
  }, []);

  const reverseGeocode = useCallback(async (coordinate: LatLng) => {
    const seq = ++geocodeSeq.current;
    setAddressLoading(true);
    try {
      if (!MAPBOX_TOKEN) throw new Error('no token');
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinate.longitude},${coordinate.latitude}.json?access_token=${MAPBOX_TOKEN}&limit=1&language=en`,
      );
      if (!res.ok) throw new Error('geocode failed');
      const json: { features?: Array<{ place_name?: string }> } = await res.json();
      if (seq !== geocodeSeq.current) return;
      const feature = json.features?.[0];
      if (!feature?.place_name) throw new Error('empty result');
      const parts = feature.place_name.split(', ').filter(Boolean);
      if (!aliveRef.current) return;
      setPinned({
        id: customPlaceId(coordinate),
        name: parts[0] ?? 'Selected location',
        address: parts.slice(1).join(', ') || 'Naga City',
        latLng: coordinate,
      });
    } catch {
      if (seq !== geocodeSeq.current || !aliveRef.current) return;
      // Offline / no token: snap to the closest known place so confirm works.
      const near = nearestLandmark(coordinate);
      setPinned({
        id: customPlaceId(coordinate),
        name: `Near ${near.name}`,
        address: near.address,
        latLng: coordinate,
      });
    } finally {
      if (seq === geocodeSeq.current && aliveRef.current) {
        setAddressLoading(false);
      }
    }
  }, []);

  // Keep the address in sync as the user drags / taps / recenters the map.
  const handleCenterChange = useCallback(
    (center: LatLng) => {
      setCenterTick((t) => t + 1);
      void reverseGeocode(center);
    },
    [reverseGeocode],
  );

  // Tap-to-select: jump the pin to the tapped spot (moveend re-geocodes).
  const handleMapTap = useCallback((coordinate: LatLng) => {
    mapRef.current?.setCenter(coordinate, SEARCH_ZOOM);
  }, []);

  // Seed the pickup address immediately (also covers the map-fail case).
  useEffect(() => {
    void reverseGeocode(initialCenter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMyLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') throw new Error('permission denied');
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (!aliveRef.current) return;
      const coord: LatLng = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setMyLocation(coord);
      setLocationFailed(false);
      if (mode === 'pickup') mapRef.current?.setCenter(coord, PICK_ZOOM);
    } catch {
      if (aliveRef.current) setLocationFailed(true);
    }
  }, [mode]);

  // Default pickup = the user's real GPS location.
  useEffect(() => {
    void loadMyLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If GPS resolved before the map finished loading, apply the fix now.
  const handleMapReady = useCallback(() => {
    if (mode === 'pickup' && myLocation) {
      mapRef.current?.setCenter(myLocation, PICK_ZOOM);
    }
  }, [mode, myLocation]);

  const searchPlace = useCallback(async () => {
    Keyboard.dismiss();
    const q = query.trim();
    if (!q) return;
    try {
      if (!MAPBOX_TOKEN) throw new Error('no token');
      const proximity = myLocation
        ? `&proximity=${myLocation.longitude},${myLocation.latitude}`
        : '';
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${MAPBOX_TOKEN}&limit=3${proximity}`,
      );
      if (!res.ok) throw new Error('search failed');
      const json: { features?: Array<{ center?: [number, number] }> } = await res.json();
      const feature = json.features?.[0];
      if (feature?.center) {
        mapRef.current?.setCenter(
          { latitude: feature.center[1], longitude: feature.center[0] },
          SEARCH_ZOOM,
        );
        return;
      }
      throw new Error('no result');
    } catch {
      // Offline fallback: match a known landmark by name so search stays alive.
      const match = LANDMARKS.find((l) => l.name.toLowerCase().includes(q.toLowerCase()));
      if (match) mapRef.current?.setCenter(match.latLng, SEARCH_ZOOM);
    }
  }, [query, myLocation]);

  const recenterToMe = useCallback(() => {
    const target = myLocation ?? NAGA_CENTER;
    mapRef.current?.setCenter(target, PICK_ZOOM);
  }, [myLocation]);

  // ── Flow transitions ─────────────────────────────────────────────
  const confirmPickup = useCallback(() => {
    if (!pinned) return;
    geocodeSeq.current++; // drop any stale in-flight geocode
    setPickup(pinned);
    setDraftPickup(pinned);
    setDestination(null);
    setPinned(null);
    setAddressLoading(false);
    setMode('destination');
  }, [pinned, setDraftPickup]);

  const confirmDestination = useCallback(() => {
    if (!pinned || !pickup) return;
    setDestination(pinned);
    setCalculatingRoute(true);
    setTimeout(() => {
      if (!aliveRef.current) return;
      setCalculatingRoute(false);
      setMode('route');
    }, ROUTE_CALC_MS);
  }, [pinned, pickup]);

  const chooseRide = useCallback(() => {
    if (!pickup || !destination) return;
    setDraftDestination(destination);
    router.replace({
      pathname: '/ride/select',
      params: {
        ...placeToParams('pickup', pickup),
        ...placeToParams('destination', destination),
      },
    });
  }, [pickup, destination, setDraftDestination, router]);

  // ── Derived values ───────────────────────────────────────────────
  const distance = useMemo(
    () => (pickup && destination ? tripDistanceKm(pickup.latLng, destination.latLng) : 0),
    [pickup, destination],
  );
  const durationMin = Math.max(2, Math.round(distance / KM_PER_MIN));

  const markers = useMemo<MapboxMarker[]>(() => {
    if (mode === 'route' && pickup && destination) {
      return [
        { id: 'pickup', coordinate: pickup.latLng, color: Colors.success, title: 'Pickup' },
        {
          id: 'destination',
          coordinate: destination.latLng,
          color: Colors.destination,
          title: 'Destination',
        },
      ];
    }
    if (mode === 'destination' && pickup) {
      return [{ id: 'pickup', coordinate: pickup.latLng, color: Colors.success, title: 'Pickup' }];
    }
    return [];
  }, [mode, pickup, destination]);

  // Entering route mode: draw the line and frame both pins.
  useEffect(() => {
    if (mode !== 'route' || !pickup || !destination) return;
    const t = setTimeout(() => {
      mapRef.current?.setRoute([pickup.latLng, destination.latLng], true);
    }, 60);
    return () => clearTimeout(t);
  }, [mode, pickup, destination]);

  // When the map itself couldn't load, still offer a confirmable pickup.
  const fallbackPlace = useMemo<Landmark | null>(() => {
    if (pinned || !mapFailed) return null;
    const near = nearestLandmark(initialCenter);
    return {
      id: customPlaceId(initialCenter),
      name: `Near ${near.name}`,
      address: near.address,
      latLng: initialCenter,
    };
  }, [pinned, mapFailed, initialCenter]);

  const shownPlace = pinned ?? fallbackPlace;

  const renderAddress = () => {
    if (addressLoading) {
      return (
        <>
          <Skeleton width="60%" height={15} radius={6} />
          <Skeleton width="85%" height={12} radius={6} />
        </>
      );
    }
    if (shownPlace) {
      return (
        <>
          <Text style={styles.placeName} numberOfLines={1}>
            {shownPlace.name}
          </Text>
          <Text style={styles.placeAddr} numberOfLines={1}>
            {shownPlace.address}
          </Text>
        </>
      );
    }
    return (
      <Text style={styles.placeName}>
        {mode === 'pickup' ? 'Move the map to set your pickup' : 'Move the map to set your destination'}
      </Text>
    );
  };

  return (
    <View style={styles.root}>
      {mapFailed ? (
        <View style={styles.fallbackBg}>
          <Text style={styles.fallbackHint}>Map couldn't load — try again in a moment.</Text>
        </View>
      ) : (
        <MapboxMap
          ref={mapRef}
          center={initialCenter}
          zoom={PICK_ZOOM}
          markers={markers}
          onCenterChange={handleCenterChange}
          onMapTap={handleMapTap}
          onReady={handleMapReady}
          onError={() => setMapFailed(true)}
          style={StyleSheet.absoluteFill}
        />
      )}

      {mode !== 'route' && !mapFailed ? <CenterPin bounce={centerTick} /> : null}

      {/* Top overlay: back + contextual search */}
      <View style={[styles.topBar, { top: insets.top + spacing.sm }]}>
        <BackButton style={shadows.elevated} />
        {mode !== 'route' ? (
          <View style={styles.searchWrap}>
            <Icon name="magnify" size={18} color={Colors.secondaryText} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => void searchPlace()}
              returnKeyType="search"
              placeholder={mode === 'pickup' ? 'Search pickup location' : 'Search destination'}
              placeholderTextColor={Colors.secondaryText}
              autoCorrect={false}
              autoCapitalize="none"
              style={styles.searchInput}
            />
          </View>
        ) : null}
      </View>

      {/* Bottom sheet — its contents follow the current mode */}
      <View style={[styles.bottomArea, { bottom: insets.bottom + spacing.md }]}>
        {mode !== 'route' ? (
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="My location"
            style={styles.myLoc}
            onPress={recenterToMe}
            haptic>
            <Icon name="navigation" size={20} color={Colors.brand} />
          </PressableScale>
        ) : null}

        <View style={styles.sheetCard}>
          <View style={styles.sheetHandle} />

          {mode === 'pickup' ? (
            <>
              <Text style={styles.sheetKicker}>SELECT PICKUP</Text>

              {locationFailed ? (
                <View style={styles.errorRow}>
                  <Icon name="alert" size={16} color={Colors.warning} />
                  <Text style={styles.errorText}>
                    We couldn't get your location — you can search or pick it on the map.
                  </Text>
                  <PressableScale
                    accessibilityRole="button"
                    onPress={() => void loadMyLocation()}
                    haptic
                    style={styles.retryBtn}>
                    <Text style={styles.retryText}>Try again</Text>
                  </PressableScale>
                </View>
              ) : !myLocation ? (
                <View style={styles.locationHint}>
                  <ActivityIndicator size="small" color={Colors.brand} />
                  <Text style={styles.locationHintText}>Finding your location…</Text>
                </View>
              ) : null}

              <View style={styles.addressRow}>
                <View style={styles.addressIcon}>
                  <Icon name="map-marker" size={20} color={Colors.brand} />
                </View>
                <View style={styles.addressText}>{renderAddress()}</View>
              </View>

              <PrimaryButton
                label="Confirm Pickup"
                icon="map-marker-check"
                gradient
                onPress={confirmPickup}
                disabled={addressLoading || (!shownPlace && !mapFailed)}
                style={styles.confirmBtn}
              />
            </>
          ) : mode === 'destination' ? (
            <>
              <Text style={styles.sheetKicker}>WHERE ARE YOU GOING?</Text>

              {pickup ? (
                <View style={styles.confirmedPickupRow}>
                  <View style={[styles.placeDot, { backgroundColor: Colors.success }]}>
                    <Icon name="circle" size={12} color={Colors.onAccent} />
                  </View>
                  <View style={styles.flex1}>
                    <Text style={styles.pickupName} numberOfLines={1}>
                      {pickup.name}
                    </Text>
                    <Text style={styles.placeAddr} numberOfLines={1}>
                      {pickup.address}
                    </Text>
                  </View>
                </View>
              ) : null}

              <View style={styles.addressRow}>
                <View style={styles.addressIcon}>
                  <Icon name="map-marker" size={20} color={Colors.destination} />
                </View>
                <View style={styles.addressText}>{renderAddress()}</View>
              </View>

              <PrimaryButton
                label="Confirm Destination"
                icon="map-marker-check"
                gradient
                onPress={confirmDestination}
                disabled={addressLoading || !pinned || !pickup}
                style={styles.confirmBtn}
              />
            </>
          ) : (
            <>
              <Text style={styles.sheetKicker}>YOUR TRIP</Text>

              <View style={styles.routeRow}>
                <View style={[styles.placeDot, { backgroundColor: Colors.success }]}>
                  <Icon name="circle" size={12} color={Colors.onAccent} />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.placeName} numberOfLines={1}>
                    {pickup?.name}
                  </Text>
                  <Text style={styles.placeAddr} numberOfLines={1}>
                    {pickup?.address}
                  </Text>
                </View>
              </View>

              <View style={styles.routeRow}>
                <View style={[styles.placeDot, { backgroundColor: Colors.destination }]}>
                  <Icon name="map-marker" size={14} color={Colors.onAccent} />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.placeName} numberOfLines={1}>
                    {destination?.name}
                  </Text>
                  <Text style={styles.placeAddr} numberOfLines={1}>
                    {destination?.address}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Icon name="map-marker-distance" size={16} color={Colors.brand} />
                  <Text style={styles.statText}>{distance.toFixed(1)} km</Text>
                </View>
                <View style={styles.stat}>
                  <Icon name="clock-outline" size={16} color={Colors.brand} />
                  <Text style={styles.statText}>~{durationMin} min</Text>
                </View>
              </View>

              <PrimaryButton
                label="Choose Ride"
                icon="steering"
                gradient
                onPress={chooseRide}
                style={styles.confirmBtn}
              />
            </>
          )}
        </View>
      </View>

      {/* Route-calculation loading state */}
      {calculatingRoute ? (
        <View pointerEvents="none" style={styles.calcOverlay}>
          <View style={styles.calcCard}>
            <ActivityIndicator color={Colors.brand} size="small" />
            <Text style={styles.calcText}>Calculating best route…</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.card,
  },
  fallbackBg: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  fallbackHint: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.body,
    color: Colors.secondaryText,
    textAlign: 'center',
    lineHeight: LineHeight.body,
  },
  topBar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchWrap: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    ...shadows.card,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: FontSize.body,
    color: Colors.primaryText,
    paddingVertical: 0,
  },
  pinLayer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    // Absolute children ignore flex alignment — pin this to the map center.
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -42,
    marginTop: -42,
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: `${Colors.pickup}2B`,
  },
  ripple: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -18,
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.pickup,
    backgroundColor: 'rgba(32, 138, 239, 0.08)',
  },
  bottomArea: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    gap: spacing.md,
  },
  myLoc: {
    alignSelf: 'flex-end',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  sheetCard: {
    backgroundColor: Colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.modal,
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
  locationHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: Colors.brandSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  locationHintText: {
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.small,
    color: Colors.brand,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: Colors.warningSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.primaryText,
    lineHeight: LineHeight.caption,
  },
  retryBtn: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: Colors.card,
  },
  retryText: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.brand,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  addressIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressText: {
    flex: 1,
    gap: 4,
  },
  confirmedPickupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: Colors.muted,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  placeDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupName: {
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.body,
    color: Colors.primaryText,
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
    lineHeight: LineHeight.caption,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: spacing.xs,
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
  flex1: {
    flex: 1,
  },
  confirmBtn: {
    marginTop: spacing.xs,
  },
  calcOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.4)',
  },
  calcCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    ...shadows.elevated,
  },
  calcText: {
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.small,
    color: Colors.primaryText,
  },
});