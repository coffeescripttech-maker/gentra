import type { Landmark, LatLng } from '@/types';
import { haversineKm } from '@/utils/geo';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '';
/** Search window around downtown Naga so autocomplete stays local. */
const NAGA_BBOX = '123.05,13.52,123.30,13.73';

type PlaceParams = Record<string, string | string[] | undefined>;

/** Keep a generated custom-place id stable across renders. */
export function customPlaceId(p: LatLng): string {
  return `custom:${p.latitude.toFixed(5)},${p.longitude.toFixed(5)}`;
}

/**
 * Autocomplete: known Naga landmarks always rank first (they're offline-safe),
 * then Mapbox geocoding fills in streets/POIs within the Naga bbox. Falls back
 * to local matches only when the API is unreachable or there's no token.
 */
export async function searchPlaces(query: string, proximity?: LatLng): Promise<Landmark[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const local = LANDMARKS.filter(
    (l) => l.name.toLowerCase().includes(q) || l.address.toLowerCase().includes(q),
  );

  if (!MAPBOX_TOKEN) return local;

  try {
    const prox = proximity
      ? `&proximity=${proximity.longitude},${proximity.latitude}`
      : '';
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${MAPBOX_TOKEN}&limit=8&country=ph&bbox=${NAGA_BBOX}${prox}`,
    );
    if (!res.ok) throw new Error('search failed');
    const json: {
      features?: Array<{ id: string; text?: string; place_name?: string; center: [number, number] }>;
    } = await res.json();

    const parts = (name: string) => name.split(', ').filter(Boolean);
    const remote: Landmark[] = (json.features ?? []).map((f) => {
      const text = parts(f.place_name ?? '');
      return {
        id: `mapbox:${f.id}`,
        name: f.text ?? text[0] ?? 'Selected place',
        address: text.slice(1).join(', ') || 'Naga City',
        latLng: { latitude: f.center[1], longitude: f.center[0] },
      };
    });

    // Keep local first, drop remote duplicates of a known landmark.
    const localNames = new Set(local.map((l) => l.name.toLowerCase()));
    const merged = [...local, ...remote.filter((r) => !localNames.has(r.name.toLowerCase()))];
    return merged.slice(0, 8);
  } catch {
    return local;
  }
}

/** Reverse-geocode a coordinate into a Landmark; snaps to the nearest known
 * place when the API is unreachable so confirm always has an address. */
export async function reverseGeocodePlace(coord: LatLng): Promise<Landmark> {
  if (MAPBOX_TOKEN) {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coord.longitude},${coord.latitude}.json?access_token=${MAPBOX_TOKEN}&limit=1&language=en`,
      );
      if (res.ok) {
        const json: { features?: Array<{ place_name?: string }> } = await res.json();
        const feature = json.features?.[0];
        if (feature?.place_name) {
          const parts = feature.place_name.split(', ').filter(Boolean);
          return {
            id: customPlaceId(coord),
            name: parts[0] ?? 'Selected location',
            address: parts.slice(1).join(', ') || 'Naga City',
            latLng: coord,
          };
        }
      }
    } catch {
      // fall through to the offline snap
    }
  }
  const near = nearestLandmark(coord);
  return {
    id: customPlaceId(coord),
    name: `Near ${near.name}`,
    address: near.address,
    latLng: coord,
  };
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
