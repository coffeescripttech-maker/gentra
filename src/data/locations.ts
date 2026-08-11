import type { Landmark, LatLng } from '@/types';
import { haversineKm } from '@/utils/geo';

type PlaceParams = Record<string, string | string[] | undefined>;

/** Keep a generated custom-place id stable across renders. */
export function customPlaceId(p: LatLng): string {
  return `custom:${p.latitude.toFixed(5)},${p.longitude.toFixed(5)}`;
}

/**
 * Naga City landmarks used as pickup / drop-off points in the prototype.
 * Coordinates are approximate — enough to anchor the map and distance math.
 */
export const LANDMARKS: Landmark[] = [
  {
    id: 'plaza-rizal',
    name: 'Plaza Rizal',
    address: 'Gen. Luna St., Naga City',
    latLng: { latitude: 13.6256, longitude: 123.1889 },
  },
  {
    id: 'naga-cathedral',
    name: 'Naga Cathedral',
    address: 'Cathedral Square, Naga City',
    latLng: { latitude: 13.6263, longitude: 123.1891 },
  },
  {
    id: 'sm-naga',
    name: 'SM City Naga',
    address: 'Magsaysay Ave., Naga City',
    latLng: { latitude: 13.6203, longitude: 123.1827 },
  },
  {
    id: 'city-hall',
    name: 'Naga City Hall',
    address: 'J. Miranda Ave., Naga City',
    latLng: { latitude: 13.6268, longitude: 123.187 },
  },
  {
    id: 'ateneo',
    name: 'Ateneo de Naga',
    address: 'Bagumbayan Sur, Naga City',
    latLng: { latitude: 13.6247, longitude: 123.1926 },
  },
  {
    id: 'basilica',
    name: 'Basilica Minore',
    address: 'Peñafrancia Ave., Naga City',
    latLng: { latitude: 13.6322, longitude: 123.1844 },
  },
  {
    id: 'naga-central',
    name: 'Naga Central School 1',
    address: 'Peñafrancia Ave., Naga City',
    latLng: { latitude: 13.6305, longitude: 123.1837 },
  },
  {
    id: 'robinsons',
    name: 'Robinsons Place Naga',
    address: 'Almeda Hwy., Naga City',
    latLng: { latitude: 13.6207, longitude: 123.1797 },
  },
  {
    id: 'liceo',
    name: 'Liceo de Naga',
    address: 'Ave. of the Acacias, Naga City',
    latLng: { latitude: 13.6196, longitude: 123.1915 },
  },
  {
    id: 'terminal',
    name: 'Central Bus Terminal',
    address: 'Magsaysay Ave., Naga City',
    latLng: { latitude: 13.6168, longitude: 123.1771 },
  },
];

export function getLandmark(id: string): Landmark {
  return LANDMARKS.find((l) => l.id === id) ?? LANDMARKS[0];
}

/** Closest registered landmark to a point — reverse-geocode fallback when the
 * Mapbox geocoding API is unreachable (offline / no token). */
export function nearestLandmark(point: LatLng): Landmark {
  let best = LANDMARKS[0];
  let bestKm = Infinity;
  for (const l of LANDMARKS) {
    const d = haversineKm(l.latLng, point);
    if (d < bestKm) {
      bestKm = d;
      best = l;
    }
  }
  return best;
}

/** Serialize a place into route params. Known landmarks keep their canonical
 * id; custom (map-picked, reverse-geocoded) places carry full coordinates so
 * the ride flow can rebuild the Landmark without a lookup. */
export function placeToParams(
  prefix: 'pickup' | 'destination',
  place: Landmark,
): Record<string, string | number> {
  if (LANDMARKS.some((l) => l.id === place.id)) return { [`${prefix}Id`]: place.id };
  return {
    [`${prefix}Id`]: place.id,
    [`${prefix}Lat`]: place.latLng.latitude,
    [`${prefix}Lng`]: place.latLng.longitude,
    [`${prefix}Name`]: place.name,
    [`${prefix}Addr`]: place.address,
  };
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Rebuild a pickup/destination from route params — either a landmark id or a
 * serialized custom coordinate. Falls back to a default landmark. */
export function placeFromParams(
  params: PlaceParams,
  prefix: 'pickup' | 'destination',
): Landmark {
  const id =
    firstParam(params[`${prefix}Id`]) ?? (prefix === 'pickup' ? 'plaza-rizal' : 'sm-naga');
  const lat = firstParam(params[`${prefix}Lat`]);
  const lng = firstParam(params[`${prefix}Lng`]);
  if (lat !== undefined && lng !== undefined) {
    return {
      id,
      name: firstParam(params[`${prefix}Name`]) ?? 'Selected location',
      address: firstParam(params[`${prefix}Addr`]) ?? 'Naga City',
      latLng: { latitude: Number(lat), longitude: Number(lng) },
    };
  }
  return getLandmark(id);
}

/** Map viewport that frames downtown Naga. */
export const NAGA_CENTER = { latitude: 13.6246, longitude: 123.1865 };
