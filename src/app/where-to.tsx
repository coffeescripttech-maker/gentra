import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui/empty-state';
import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';
import { FontFamily, FontSize, LetterSpacing, LineHeight } from '@/constants/typography';
import { useRide } from '@/context/ride';
import { useSession } from '@/context/session';
import { LANDMARKS, placeToParams, reverseGeocodePlace, searchPlaces } from '@/data';
import type { Landmark, RideMode } from '@/types';

/** Simulated route-calculation delay before the trip hands off to the map. */
const ROUTE_CALC_MS = 700;
/** Autocomplete waits this long after the last keystroke before searching. */
const SEARCH_DEBOUNCE_MS = 250;

type Field = 'pickup' | 'destination';

/**
 * The trip-builder — "Where to?" on one screen. Tap a field and it turns into
 * a text input in place (no separate search bar); results always land in the
 * same slot below the fields, whichever side is active. Both pickup and
 * destination can also be picked on the full-screen map, and search + map stay
 * in sync via the ride-context drafts. Once both ends exist the route is drawn
 * on the full-screen map (no mini-map preview here).
 */
export default function WhereToScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const insets = useSafeAreaInsets();
  const { state } = useSession();
  const { draftPickup, draftDestination, setDraftPickup, setDraftDestination } = useRide();

  // Service tiles (Tricycle / Jeepney) preselect the ride mode; ride select
  // reads it back from the route params when the trip is handed off.
  const presetMode: RideMode | undefined =
    params.mode === 'shared' ? 'shared' : params.mode === 'special' ? 'special' : undefined;

  const aliveRef = useRef(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const routeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstFocusRef = useRef(true);
  /** Set the moment a place is picked here, so completing both legs auto-routes. */
  const justPickedRef = useRef(false);

  // ── Trip state ───────────────────────────────────────────────────
  const [pickup, setPickup] = useState<Landmark | null>(null);
  const [destination, setDestination] = useState<Landmark | null>(null);
  /** Which field's inline search is open, if any. */
  const [active, setActive] = useState<Field | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Landmark[]>([]);
  const [searching, setSearching] = useState(false);

  // ── GPS / handoff status ─────────────────────────────────────────
  const [locating, setLocating] = useState(true);
  const [locationFailed, setLocationFailed] = useState(false);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    return () => {
      aliveRef.current = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (routeTimerRef.current) clearTimeout(routeTimerRef.current);
    };
  }, []);

  // Default pickup = the user's real GPS location (unless a map-picked pickup
  // was preserved — then that wins and we skip the GPS dance).
  const loadMyLocation = useCallback(async () => {
    setLocating(true);
    setLocationFailed(false);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') throw new Error('permission denied');
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (!aliveRef.current) return;
      const coord = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      const place = await reverseGeocodePlace(coord);
      if (!aliveRef.current) return;
      setPickup({
        id: 'current-location',
        name: 'Current Location',
        address: place.address,
        latLng: coord,
      });
    } catch {
      if (aliveRef.current) setLocationFailed(true);
    } finally {
      if (aliveRef.current) setLocating(false);
    }
  }, []);

  useEffect(() => {
    if (draftPickup) {
      setPickup(draftPickup);
      setLocating(false);
    } else {
      void loadMyLocation();
    }
    // Fresh visits (e.g. rebook from History) may already carry a destination.
    if (draftDestination) setDestination(draftDestination);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Returning from the full-screen map — adopt whatever spot it confirmed.
  // (Skipped on the very first focus; the mount effect already seeded pickup.)
  useFocusEffect(
    useCallback(() => {
      if (firstFocusRef.current) {
        firstFocusRef.current = false;
        return;
      }
      if (draftPickup) setPickup(draftPickup);
      if (draftDestination) setDestination(draftDestination);
    }, [draftPickup, draftDestination]),
  );

  // ── Autocomplete ────────────────────────────────────────────────
  const runSearch = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) {
        setResults([]);
        setSearching(false);
        return;
      }
      setSearching(true);
      const found = await searchPlaces(trimmed, pickup?.latLng);
      if (!aliveRef.current) return;
      setResults(found);
      setSearching(false);
    },
    [pickup],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!active) {
      setResults([]);
      setSearching(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      void runSearch(query);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, active, runSearch]);

  const switchField = useCallback((field: Field) => {
    Keyboard.dismiss();
    setQuery('');
    setResults([]);
    setActive(field);
  }, []);

  const selectPlace = useCallback(
    (place: Landmark) => {
      Keyboard.dismiss();
      setQuery('');
      setResults([]);
      justPickedRef.current = true;
      if (active === 'pickup') {
        setPickup(place);
        // GPS pickup isn't drafted — it re-resolves on the next visit.
        setDraftPickup(place.id === 'current-location' ? null : place);
        setActive(destination ? null : 'destination');
      } else {
        setDestination(place);
        setDraftDestination(place);
        setActive(null);
      }
    },
    [active, destination, setDraftPickup, setDraftDestination],
  );

  const openMap = useCallback(
    (field: Field) => {
      Keyboard.dismiss();
      router.push({
        pathname: '/map-picker',
        params: {
          select: field,
          ...(field === 'destination' && pickup ? placeToParams('pickup', pickup) : {}),
        },
      });
    },
    [router, pickup],
  );

  /** Flip the trip: destination becomes the pickup (and vice versa). */
  const swapTrip = useCallback(() => {
    if (!pickup || !destination) return;
    Keyboard.dismiss();
    setActive(null);
    setQuery('');
    setResults([]);
    // Draft the same way selectPlace does — GPS pickup stays un-drafted.
    const nextDestination = pickup;
    const nextPickup = destination;
    setDraftPickup(destination.id === 'current-location' ? null : destination);
    setDraftDestination(pickup.id === 'current-location' ? null : pickup);
    setPickup(nextPickup);
    setDestination(nextDestination);
  }, [pickup, destination, setDraftPickup, setDraftDestination]);

  /** Show the finished trip on the full-screen map (route drawn, ride choosable). */
  const goToMap = useCallback(() => {
    if (!pickup || !destination) return;
    setDraftPickup(pickup.id === 'current-location' ? null : pickup);
    setDraftDestination(destination);
    router.push({
      pathname: '/map-picker',
      params: {
        route: '1',
        ...placeToParams('pickup', pickup),
        ...placeToParams('destination', destination),
        ...(presetMode ? { mode: presetMode } : {}),
      },
    });
  }, [router, pickup, destination, presetMode, setDraftPickup, setDraftDestination]);

  // A pick that completes both ends → brief "calculating" pulse, then hand off
  // to the full-screen map. Editing a leg later doesn't re-fire (justPicked is
  // only set by picks made on this screen visit).
  const completeTrip = useCallback(() => {
    if (!pickup || !destination || calculating) return;
    setCalculating(true);
    if (routeTimerRef.current) clearTimeout(routeTimerRef.current);
    routeTimerRef.current = setTimeout(() => {
      if (!aliveRef.current) return;
      setCalculating(false);
      goToMap();
    }, ROUTE_CALC_MS);
  }, [pickup, destination, calculating, goToMap]);

  useEffect(() => {
    if (!pickup || !destination || active || !justPickedRef.current) return;
    justPickedRef.current = false;
    completeTrip();
  }, [pickup, destination, active, completeTrip]);

  const savedPlaces = state.passenger.savedLocations;
  // Suggestions fill the one results slot: shown while a field is open with an
  // empty query, or while idle before a destination has been chosen.
  const showSuggestions = active ? !query.trim() : !destination;

  return (
    <View style={styles.safe}>
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Close Where to"
          style={styles.closeBtn}
          onPress={() => router.back()}
          haptic>
          <Icon name="arrow-left" size={20} color={Colors.primaryText} />
        </PressableScale>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Where to?</Text>
          {presetMode ? (
            <Text style={styles.subtitle}>
              {presetMode === 'shared' ? 'Shared ride' : 'Special ride'}
            </Text>
          ) : null}
        </View>
        <View style={styles.topSpacer} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {/* ── Pickup + destination fields ───────────────────────── */}
        <View style={styles.fieldsCard}>
          <FieldRow
            icon="circle"
            color={Colors.success}
            name={pickup?.name}
            address={pickup?.address}
            placeholder={active === 'pickup' ? 'Search pickup location' : 'Current Location'}
            loading={locating && !pickup}
            active={active === 'pickup'}
            searching={searching}
            value={query}
            onChangeText={setQuery}
            onSubmit={() => {
              if (debounceRef.current) clearTimeout(debounceRef.current);
              void runSearch(query);
            }}
            onPress={() => switchField('pickup')}
            onMap={() => openMap('pickup')}
          />
          <View style={styles.connector}>
            <View style={styles.connectorLine} />
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Swap pickup and destination"
              disabled={!pickup || !destination}
              style={[styles.swapBtn, (!pickup || !destination) && styles.swapBtnDisabled]}
              onPress={swapTrip}
              haptic>
              <Icon name="swap-vertical" size={16} color={Colors.brand} />
            </PressableScale>
          </View>
          <FieldRow
            icon="map-marker"
            color={Colors.destination}
            name={destination?.name}
            address={destination?.address}
            placeholder={active === 'destination' ? 'Search destination' : 'Where are you going?'}
            active={active === 'destination'}
            searching={searching}
            value={query}
            onChangeText={setQuery}
            onSubmit={() => {
              if (debounceRef.current) clearTimeout(debounceRef.current);
              void runSearch(query);
            }}
            onPress={() => switchField('destination')}
            onMap={() => openMap('destination')}
          />
        </View>

        {/* GPS failure keeps the user inside the flow, never stuck. */}
        {locationFailed && !pickup ? (
          <View style={styles.locationError}>
            <View style={styles.locationErrorTop}>
              <Icon name="alert" size={16} color={Colors.warning} />
              <Text style={styles.locationErrorText}>
                We couldn't access your location.
              </Text>
            </View>
            <View style={styles.locationErrorActions}>
              <PressableScale
                accessibilityRole="button"
                onPress={() => void loadMyLocation()}
                style={styles.retryBtn}
                haptic>
                <Text style={styles.retryText}>Try again</Text>
              </PressableScale>
              <PressableScale
                accessibilityRole="button"
                onPress={() => openMap('pickup')}
                style={styles.retryBtn}
                haptic>
                <Text style={styles.retryText}>Choose pickup on map</Text>
              </PressableScale>
            </View>
          </View>
        ) : null}

        {/* ── The one results slot (suggestions / loading / results) ── */}
        {active && query.trim() ? (
          searching ? (
            <View style={styles.listBlock}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={styles.resultRow}>
                  <Skeleton width={36} height={36} radius={18} />
                  <View style={styles.skeletonText}>
                    <Skeleton width="55%" height={14} radius={6} />
                    <Skeleton width="75%" height={11} radius={6} />
                  </View>
                </View>
              ))}
            </View>
          ) : results.length > 0 ? (
            <View style={styles.listBlock}>
              {results.map((r) => (
                <PlaceRow
                  key={r.id}
                  place={r}
                  icon="map-marker"
                  color={active === 'pickup' ? Colors.success : Colors.destination}
                  onPress={() => selectPlace(r)}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              icon="map-marker-off"
              title="No places found"
              body="Try another search."
            />
          )
        ) : showSuggestions ? (
          <View style={styles.listBlock}>
            {savedPlaces.length > 0 ? (
              <>
                <Text style={styles.sectionLabel}>Saved</Text>
                {savedPlaces.map((p, i) => (
                  <PlaceRow
                    key={p.id}
                    place={p}
                    icon={i === 0 ? 'home' : i === 1 ? 'briefcase' : 'star'}
                    color={Colors.brand}
                    onPress={() => selectPlace(p)}
                  />
                ))}
              </>
            ) : null}
            <Text style={styles.sectionLabel}>Popular</Text>
            {LANDMARKS.slice(0, 4).map((l) => (
              <PlaceRow
                key={l.id}
                place={l}
                icon="map-marker"
                color={Colors.destination}
                onPress={() => selectPlace(l)}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>

      {/* ── Sticky CTA ──────────────────────────────────────────── */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <PrimaryButton
          label="Choose Ride"
          icon="steering"
          gradient
          disabled={!pickup || !destination}
          onPress={goToMap}
        />
      </View>

      {/* Route-calculation pulse before handoff to the full map. */}
      {calculating ? (
        <View pointerEvents="none" style={styles.calcOverlay}>
          <View style={styles.calcCard}>
            <ActivityIndicator color={Colors.brand} size="small" />
            <Text style={styles.calcText}>Calculating route…</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function FieldRow({
  icon,
  color,
  name,
  address,
  placeholder,
  loading = false,
  active = false,
  searching = false,
  value,
  onChangeText,
  onSubmit,
  onPress,
  onMap,
}: {
  icon: IconName;
  color: string;
  name?: string;
  address?: string;
  placeholder?: string;
  loading?: boolean;
  active?: boolean;
  searching?: boolean;
  value: string;
  onChangeText: (t: string) => void;
  onSubmit: () => void;
  onPress: () => void;
  onMap: () => void;
}) {
  return (
    <View style={styles.fieldRow}>
      {active ? (
        <View style={styles.fieldMain}>
          <View style={[styles.dot, { backgroundColor: color }]}>
            <Icon name={icon} size={14} color={Colors.onAccent} />
          </View>
          <TextInput
            autoFocus
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmit}
            returnKeyType="search"
            placeholder={placeholder}
            placeholderTextColor={Colors.secondaryText}
            autoCorrect={false}
            autoCapitalize="none"
            style={styles.fieldInput}
          />
          {searching ? (
            <View style={styles.fieldSpinner}>
              <ActivityIndicator size="small" color={Colors.brand} />
            </View>
          ) : null}
        </View>
      ) : (
        <PressableScale
          accessibilityRole="button"
          style={styles.fieldMain}
          onPress={onPress}
          haptic>
          <View style={[styles.dot, { backgroundColor: color }]}>
            <Icon name={icon} size={14} color={Colors.onAccent} />
          </View>
          {loading ? (
            <View style={styles.skeletonText}>
              <Skeleton width="45%" height={15} radius={6} />
              <Skeleton width="70%" height={11} radius={6} />
            </View>
          ) : (
            <View style={styles.fieldText}>
              {name ? (
                <Text style={styles.fieldName} numberOfLines={1}>
                  {name}
                </Text>
              ) : (
                <Text style={styles.fieldPlaceholder}>{placeholder}</Text>
              )}
              {address ? (
                <Text style={styles.fieldAddr} numberOfLines={1}>
                  {address}
                </Text>
              ) : null}
            </View>
          )}
        </PressableScale>
      )}
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Open full map"
        style={styles.mapBtn}
        onPress={onMap}
        haptic>
        <Icon name="map-marker-path" size={16} color={Colors.brand} />
        <Text style={styles.mapBtnText}>Map</Text>
      </PressableScale>
    </View>
  );
}

function PlaceRow({
  place,
  icon,
  color,
  onPress,
}: {
  place: Landmark;
  icon: IconName;
  color: string;
  onPress: () => void;
}) {
  return (
    <PressableScale
      accessibilityRole="button"
      style={styles.resultRow}
      onPress={onPress}
      haptic>
      <View style={[styles.dot, { backgroundColor: color }]}>
        <Icon name={icon} size={14} color={Colors.onAccent} />
      </View>
      <View style={styles.resultText}>
        <Text style={styles.resultName} numberOfLines={1}>
          {place.name}
        </Text>
        <Text style={styles.resultAddr} numberOfLines={1}>
          {place.address}
        </Text>
      </View>
      <Icon name="chevron-right" size={18} color={Colors.secondaryText} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.md,
    backgroundColor: Colors.background,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.subtitle,
    color: Colors.primaryText,
  },
  subtitle: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: LetterSpacing.wide,
    marginTop: 1,
  },
  topSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.huge,
    gap: spacing.md,
  },
  fieldsCard: {
    backgroundColor: Colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  fieldMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldText: {
    flex: 1,
    gap: 2,
  },
  fieldName: {
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.body,
    color: Colors.primaryText,
  },
  fieldPlaceholder: {
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.body,
    color: Colors.secondaryText,
  },
  fieldAddr: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
    lineHeight: LineHeight.caption,
  },
  fieldInput: {
    flex: 1,
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.body,
    color: Colors.primaryText,
    paddingVertical: 0,
  },
  fieldSpinner: {
    width: 20,
    alignItems: 'center',
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.brandSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  mapBtnText: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.brand,
  },
  connector: {
    alignItems: 'center',
    marginLeft: 17,
    marginVertical: spacing.xs,
  },
  connectorLine: {
    width: 2,
    height: 44,
    borderLeftWidth: 2,
    borderLeftColor: Colors.border,
    borderStyle: 'dashed',
  },
  swapBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: -38,
    marginBottom: -6,
    ...shadows.card,
  },
  swapBtnDisabled: {
    opacity: 0.4,
  },
  locationError: {
    backgroundColor: Colors.warningSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  locationErrorTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  locationErrorText: {
    flex: 1,
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.small,
    color: Colors.primaryText,
    lineHeight: LineHeight.small,
  },
  locationErrorActions: {
    flexDirection: 'row',
    gap: spacing.sm,
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
  listBlock: {
    gap: spacing.xs,
  },
  sectionLabel: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.small,
    color: Colors.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: LetterSpacing.wide,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  resultText: {
    flex: 1,
    gap: 2,
  },
  resultName: {
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.body,
    color: Colors.primaryText,
  },
  resultAddr: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
    lineHeight: LineHeight.caption,
  },
  skeletonText: {
    flex: 1,
    gap: 6,
  },
  calcOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
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
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...shadows.modal,
  },
});