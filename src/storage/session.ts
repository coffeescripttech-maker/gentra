import AsyncStorage from '@react-native-async-storage/async-storage';

import { SEED_RECEIPTS } from '@/data';
import { STORAGE_KEYS } from '@/storage/keys';
import type { SessionState } from '@/types';

/** Seed the passenger history + driver earnings so the app has data on first run. */
const EARNINGS_SEED: SessionState['earnings'] = [
  { date: '2026-08-09', trips: 3, cash: 85, onlineMinutes: 120 },
  { date: '2026-08-08', trips: 18, cash: 460, onlineMinutes: 480 },
  { date: '2026-08-07', trips: 21, cash: 540, onlineMinutes: 510 },
  { date: '2026-08-06', trips: 15, cash: 390, onlineMinutes: 430 },
  { date: '2026-08-05', trips: 24, cash: 615, onlineMinutes: 540 },
  { date: '2026-08-04', trips: 12, cash: 310, onlineMinutes: 380 },
];

/** Initial session state (role not chosen yet, seeded profile + data). */
export function defaultSession(): SessionState {
  return {
    roleChosen: false,
    role: 'passenger',
    passenger: {
      name: 'Juan Dela Cruz',
      phone: '+63 9XX XXX XXXX',
      savedLocations: [
        { id: 'home', name: 'Home', address: 'Penafrancia Ave., Naga City', latLng: { latitude: 13.6302, longitude: 123.1851 } },
        { id: 'work', name: 'Work', address: 'Centro Bicol Building, Naga City', latLng: { latitude: 13.6238, longitude: 123.1819 } },
      ],
      emergencyContact: '+63 917 123 4567',
    },
    driver: {
      name: 'Mang Tony',
      phone: '+63 9XX XXX XXXX',
      vehicleType: 'tricycle',
      plate: 'NAG-1024',
      maxCapacity: 4,
      verification: {
        license: true,
        registration: true,
        franchise: true,
        photos: true,
      },
    },
    receipts: SEED_RECEIPTS,
    earnings: EARNINGS_SEED,
    walletBalance: 2765,
    fastDemo: false,
  };
}

/** Load persisted session state, falling back to defaults. */
export async function loadSession(): Promise<SessionState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.session);
    if (!raw) {
      return defaultSession();
    }
    const parsed = JSON.parse(raw) as Partial<SessionState>;
    return { ...defaultSession(), ...parsed };
  } catch {
    return defaultSession();
  }
}

/** Persist the given session state. */
export async function saveSession(state: SessionState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.session, JSON.stringify(state));
  } catch {
    // Offline-first prototype: failing to persist is non-fatal.
  }
}
