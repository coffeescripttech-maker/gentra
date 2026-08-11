import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FareBreakdown } from '@/components/fare-breakdown';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Stagger } from '@/components/ui/fade-in-view';
import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { PrimaryButton } from '@/components/ui/primary-button';
import { VehicleTypeCard } from '@/components/vehicle-type-card';
import { Colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';
import { FontFamily, FontSize, LetterSpacing } from '@/constants/typography';
import { useRide } from '@/context/ride';
import { placeFromParams } from '@/data';
import type { RideMode, VehicleType } from '@/types';
import { estimateFare } from '@/utils/fare';
import { tripDistanceKm } from '@/utils/geo';

const MODES: Array<{ key: RideMode; label: string; hint: string }> = [
  { key: 'special', label: 'Special', hint: 'Exclusive · just you' },
  { key: 'shared', label: 'Shared', hint: 'Cheaper · join the route' },
];

export default function RideSelectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const { startBooking } = useRide();

  // Handles both known landmark ids and map-picked custom coordinates.
  const pickup = placeFromParams(params, 'pickup');
  const destination = placeFromParams(params, 'destination');
  const distance = tripDistanceKm(pickup.latLng, destination.latLng);

  const [vehicleType, setVehicleType] = useState<VehicleType>('tricycle');
  // Home's service tiles preselect the ride mode (tricycle → special, jeepney → shared).
  const [rideMode, setRideMode] = useState<RideMode>(params.mode === 'shared' ? 'shared' : 'special');

  const selectVehicle = (type: VehicleType) => {
    setVehicleType(type);
    // Jeepneys only run shared routes (per MVP).
    if (type === 'jeepney') setRideMode('shared');
  };

  const fare = estimateFare(vehicleType, rideMode, distance);

  const confirm = () => {
    startBooking(pickup, destination, vehicleType, rideMode);
    router.replace('/ride/finding');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()} accessibilityRole="button">
            <Icon name="arrow-left" size={22} color={Colors.primaryText} />
          </Pressable>
          <Text style={styles.title}>Book a ride</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Stagger interval={80}>
          {/* Route summary */}
          <View style={styles.routeCard}>
            <RouteRow
              icon="circle"
              color={Colors.success}
              name={pickup.name}
              sub={`Pickup · ${pickup.address}`}
            />
            <View style={styles.routeConnector}>
              <View style={styles.routeLine} />
              <View style={styles.distancePill}>
                <Icon name="map-marker-distance" size={12} color={Colors.brand} />
                <Text style={styles.distanceText}>{distance.toFixed(1)} km</Text>
              </View>
            </View>
            <RouteRow
              icon="map-marker"
              color={Colors.error}
              name={destination.name}
              sub={`Drop-off · ${destination.address}`}
            />
          </View>

          {/* Vehicle choice */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose your ride</Text>
            <View style={styles.vehicleList}>
              <VehicleTypeCard
                type="tricycle"
                selected={vehicleType === 'tricycle'}
                onPress={() => selectVehicle('tricycle')}
              />
              <VehicleTypeCard
                type="jeepney"
                selected={vehicleType === 'jeepney'}
                onPress={() => selectVehicle('jeepney')}
              />
            </View>
          </View>

          {/* Ride mode */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ride mode</Text>
            <SegmentedControl
              options={MODES}
              value={rideMode}
              onChange={setRideMode}
              disabledKey={vehicleType === 'jeepney' ? 'special' : undefined}
              disabledHint="Jeepneys are shared only"
            />
          </View>

          <FareBreakdown fare={fare} animated />
        </Stagger>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.footer}>
        <PrimaryButton
          label={`Book ${vehicleType === 'tricycle' ? 'Tricycle' : 'Jeepney'}`}
          icon={vehicleType === 'tricycle' ? 'motorbike' : 'bus'}
          gradient
          onPress={confirm}
        />
      </View>
    </SafeAreaView>
  );
}

function RouteRow({
  icon,
  color,
  name,
  sub,
}: {
  icon: IconName;
  color: string;
  name: string;
  sub: string;
}) {
  return (
    <View style={styles.routeRow}>
      <View style={[styles.routeDot, { backgroundColor: color }]}>
        <Icon name={icon} size={14} color={Colors.onAccent} />
      </View>
      <View style={styles.routeText}>
        <Text style={styles.routeName}>{name}</Text>
        <Text style={styles.routeSub}>{sub}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.xxl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.title,
    color: Colors.primaryText,
  },
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
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeText: {
    flex: 1,
    gap: 1,
  },
  routeName: {
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.body,
    color: Colors.primaryText,
  },
  routeSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.secondaryText,
  },
  routeConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 14,
    marginVertical: spacing.xs,
  },
  routeLine: {
    width: 2,
    height: 18,
    borderRadius: 1,
    backgroundColor: Colors.border,
  },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.brandSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: spacing.md - 14,
  },
  distanceText: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.caption,
    color: Colors.brand,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontFamily: FontFamily.button,
    fontSize: FontSize.small,
    color: Colors.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: LetterSpacing.wide,
  },
  vehicleList: {
    gap: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...shadows.modal,
  },
});