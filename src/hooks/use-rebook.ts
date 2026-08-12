import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { useRide } from '@/context/ride';
import type { TripReceipt } from '@/types';
import { resolveTripEnds } from '@/utils/rebook';

/**
 * Rehop a past trip: resolve both ends, prefill Where To? with them, and hop
 * over. Shared by Home ("Rebook last trip") and History ("Book again").
 */
export function useRebook(): (receipt: TripReceipt) => Promise<void> {
  const router = useRouter();
  const { setDraftPickup, setDraftDestination } = useRide();

  return useCallback(
    async (receipt: TripReceipt) => {
      const { pickup, destination } = await resolveTripEnds(receipt);
      if (pickup) setDraftPickup(pickup);
      if (destination) setDraftDestination(destination);
      router.push('/where-to');
    },
    [router, setDraftPickup, setDraftDestination],
  );
}