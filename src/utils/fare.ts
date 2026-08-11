import type { FareBreakdown, RideMode, VehicleType } from '@/types';

/**
 * Fare logic ported verbatim from the MVP spec (see gentra_mobile_app/MVP.md, "Fare System").
 *
 * Tricycle special:  ₱15 base (2 km free) + ₱5/km
 * Tricycle shared:   ₱10 base (2 km free) + ₱3/km
 * Jeepney:           ₱13 base (4 km free) + ₱2/km
 * Night rate (10 PM – 5 AM): +₱10
 */
export function estimateFare(
  vehicleType: VehicleType,
  rideMode: RideMode,
  distanceKm: number,
  isNightTime = false,
): FareBreakdown {
  let base: number;
  let perKmRate: number;
  let freeKm: number;

  if (vehicleType === 'tricycle') {
    if (rideMode === 'special') {
      base = 15;
      perKmRate = 5;
      freeKm = 2;
    } else {
      base = 10;
      perKmRate = 3;
      freeKm = 2;
    }
  } else {
    base = 13;
    perKmRate = 2;
    freeKm = 4;
  }

  const chargeableKm = Math.max(0, distanceKm - freeKm);
  const distanceCost = chargeableKm * perKmRate;
  const nightSurcharge = isNightTime ? 10 : 0;
  const total = Math.round(base + distanceCost + nightSurcharge);

  return {
    vehicleType,
    rideMode,
    distanceKm: Math.round(distanceKm * 10) / 10,
    base,
    distanceCost,
    nightSurcharge,
    total,
  };
}

/** Formats a peso amount as "₱15" (no decimals for whole pesos). */
export function formatPeso(amount: number): string {
  const rounded = Math.round(amount);
  return `₱${rounded.toLocaleString('en-PH')}`;
}
