import type { VehicleType } from '@/types';

export interface CapacityStatus {
  color: string;
  label: string;
  seatsLeft: number;
}

/**
 * Capacity rules from the MVP spec ("Capacity Feature (Core Innovation)").
 *
 * Tricycle (max 4): plenty of space → filling up → full.
 * Jeepney (max 23): "Just started" (≤ half) → "Filling up" → "Leaving soon" (≥80% full).
 */
export function capacityStatus(
  vehicleType: VehicleType,
  current: number,
  max: number,
): CapacityStatus {
  const seatsLeft = Math.max(0, max - current);

  if (vehicleType === 'tricycle') {
    if (seatsLeft <= 0) return { color: '#EF4444', label: 'Full', seatsLeft };
    if (seatsLeft === 1) return { color: '#F59E0B', label: '1 seat left', seatsLeft };
    return { color: '#22C55E', label: `${seatsLeft} seats left`, seatsLeft };
  }

  // Jeepney
  if (current >= Math.ceil(max * 0.8)) {
    return { color: '#EF4444', label: 'Leaving soon', seatsLeft };
  }
  if (current > Math.floor(max / 2)) {
    return { color: '#F59E0B', label: 'Filling up', seatsLeft };
  }
  return { color: '#22C55E', label: 'Just started', seatsLeft };
}
