import { LANDMARKS, searchPlaces } from '@/data';
import type { Landmark, TripReceipt } from '@/types';

/** Resolve a receipt's place name back into a routable Landmark. */
export async function resolvePlace(name: string): Promise<Landmark | null> {
  const q = name.trim();
  if (!q) return null;
  const exact = LANDMARKS.find((l) => l.name.toLowerCase() === q.toLowerCase());
  if (exact) return exact;
  const matches = await searchPlaces(q);
  return matches[0] ?? null;
}

/**
 * Resolve both ends of a past trip. The GPS pseudo-place is never rebookable,
 * so it resolves to `null` and the caller silently falls back to defaults.
 */
export async function resolveTripEnds(
  receipt: TripReceipt,
): Promise<{ pickup: Landmark | null; destination: Landmark | null }> {
  const [pickup, destination] = await Promise.all([
    resolvePlace(receipt.pickup),
    resolvePlace(receipt.destination),
  ]);
  return {
    pickup: pickup && pickup.id !== 'current-location' ? pickup : null,
    destination,
  };
}