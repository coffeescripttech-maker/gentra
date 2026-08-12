import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useSession } from '@/context/session';
import { driversByType, getDriver, LANDMARKS } from '@/data';
import type {
  Booking,
  Driver,
  Landmark,
  LatLng,
  RideMode,
  RideStatus,
  VehicleType,
} from '@/types';
import { estimateFare } from '@/utils/fare';
import { haversineKm, tripDistanceKm } from '@/utils/geo';

/** Seconds the "driver approaching" leg lasts (normal pacing). */
const APPROACH_SECONDS = 20;
/** Seconds the active ride lasts before the driver "arrives". */
const RIDE_SECONDS = 30;
/** How long before an incoming driver request appears while online. */
const REQUEST_DELAY_MS = 6000;
/** Passenger search duration before auto-assigning a driver. */
const SEARCH_DELAY_MS = 4000;

/** Shortened timings when fast-demo mode is on (keeps live demos moving). */
const FAST_APPROACH_SECONDS = 4;
const FAST_RIDE_SECONDS = 8;
const FAST_SEARCH_DELAY_MS = 1500;
const FAST_REQUEST_DELAY_MS = 2000;

type BookingSource = 'passenger' | 'driver';

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}

function lerp(a: LatLng, b: LatLng, t: number): LatLng {
  return {
    latitude: a.latitude + (b.latitude - a.latitude) * t,
    longitude: a.longitude + (b.longitude - a.longitude) * t,
  };
}

function nearestDriver(candidates: Driver[], point: LatLng): Driver | undefined {
  if (candidates.length === 0) return undefined;
  return candidates.reduce((best, d) =>
    haversineKm(d.latLng, point) < haversineKm(best.latLng, point) ? d : best,
  );
}

function randomLandmarks(): [Landmark, Landmark] {
  const a = LANDMARKS[Math.floor(Math.random() * LANDMARKS.length)];
  let b = a;
  while (b.id === a.id) {
    b = LANDMARKS[Math.floor(Math.random() * LANDMARKS.length)];
  }
  return [a, b];
}

function buildBooking(
  pickup: Landmark,
  destination: Landmark,
  vehicleType: VehicleType,
  rideMode: RideMode,
  status: RideStatus,
): Booking {
  const distanceKm = tripDistanceKm(pickup.latLng, destination.latLng);
  const isNight = new Date().getHours() >= 22 || new Date().getHours() < 5;
  return {
    id: makeId('bk'),
    status,
    pickup,
    destination,
    vehicleType,
    rideMode,
    distanceKm,
    fare: estimateFare(vehicleType, rideMode, distanceKm, isNight),
    createdAt: Date.now(),
  };
}

interface RideContextValue {
  booking: Booking | null;
  status: RideStatus;
  /** 0→1 movement of the driver marker on the current leg. */
  progress: number;
  /** Seconds left before the driver reaches the pickup (assigned leg). */
  etaSeconds: number;
  /** Whether the driver has reached the current leg's end point. */
  arrived: boolean;
  /** Driver marker position (passenger live view). */
  driverPosition: LatLng | null;

  /** Passenger's latest map-picked pickup (overrides the home default). */
  draftPickup: Landmark | null;
  /** Passenger's latest map-picked destination (overrides the home default). */
  draftDestination: Landmark | null;
  setDraftPickup: (place: Landmark | null) => void;
  setDraftDestination: (place: Landmark | null) => void;

  // Passenger actions
  startBooking: (
    pickup: Landmark,
    destination: Landmark,
    vehicleType: VehicleType,
    rideMode: RideMode,
  ) => void;
  cancelBooking: () => void;
  /** Re-run the same search after a "no drivers" miss. */
  retryFinding: () => void;
  /** Passenger boards once the driver arrived (assigned → active). */
  boardVehicle: () => void;
  /** Passenger finishes the ride (active → complete). */
  finishPassengerRide: (tip: number, rating: number) => void;
  /** Return to idle after viewing the receipt. */
  resetRide: () => void;

  // Driver actions
  driverOnline: boolean;
  setDriverOnline: (online: boolean) => void;
  incomingRequest: Booking | null;
  acceptRequest: () => void;
  declineRequest: () => void;
  /** Driver arrived at pickup (assigned → active). */
  arrivedAtPickup: () => void;
  /** Driver reached the destination (active → complete). */
  endRideAsDriver: () => void;
  /** Driver confirms payment and returns to idle. */
  confirmPaymentAndReset: () => void;
}

const RideContext = createContext<RideContextValue | null>(null);

export function RideProvider({ children }: { children: ReactNode }) {
  const { state, addReceipt, addEarnings } = useSession();

  // Fast-demo mode shortens every simulated wait so a live demo stays snappy.
  const fastDemo = state.fastDemo;
  const approachSeconds = fastDemo ? FAST_APPROACH_SECONDS : APPROACH_SECONDS;
  const rideSeconds = fastDemo ? FAST_RIDE_SECONDS : RIDE_SECONDS;
  const searchDelayMs = fastDemo ? FAST_SEARCH_DELAY_MS : SEARCH_DELAY_MS;
  const requestDelayMs = fastDemo ? FAST_REQUEST_DELAY_MS : REQUEST_DELAY_MS;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [status, setStatus] = useState<RideStatus>('idle');
  const [source, setSource] = useState<BookingSource>('passenger');
  const [progress, setProgress] = useState(0);
  const [driverOnline, setDriverOnline] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState<Booking | null>(null);
  // Places picked on the full-screen map. `null` means "use the home default".
  const [draftPickup, setDraftPickup] = useState<Landmark | null>(null);
  const [draftDestination, setDraftDestination] = useState<Landmark | null>(null);

  // Advance the driver marker while assigned / active.
  useEffect(() => {
    if (status !== 'assigned' && status !== 'active') return;
    const legSeconds = status === 'assigned' ? approachSeconds : rideSeconds;
    const id = setInterval(() => {
      setProgress((p) => Math.min(1, p + 1 / legSeconds));
    }, 1000);
    return () => clearInterval(id);
  }, [status, approachSeconds, rideSeconds]);

  // Passenger: auto-assign the nearest matching driver after a short search.
  useEffect(() => {
    if (status !== 'finding' || source !== 'passenger' || !booking) return;
    const id = setTimeout(() => {
      const candidates = MOCK_DRIVERS_FILTER(booking.vehicleType);
      const driver = nearestDriver(candidates, booking.pickup.latLng);
      if (driver) {
        setBooking((b) => (b ? { ...b, driverId: driver.id, status: 'assigned' } : b));
        setStatus('assigned');
        setProgress(0);
      } else {
        // Hold the trip so the passenger can re-search with one tap.
        setStatus('no-drivers');
      }
    }, searchDelayMs);
    return () => clearTimeout(id);
  }, [status, source, booking, searchDelayMs]);

  // Driver: surface an incoming request while online and idle.
  useEffect(() => {
    if (!driverOnline || status !== 'idle' || incomingRequest) return;
    const id = setTimeout(() => {
      const [pickup, destination] = randomLandmarks();
      const request = buildBooking(
        pickup,
        destination,
        state.driver.vehicleType,
        'shared',
        'finding',
      );
      request.passengerName = 'Passenger 042';
      request.passengerRating = 4.7;
      setIncomingRequest(request);
    }, requestDelayMs);
    return () => clearTimeout(id);
  }, [driverOnline, status, incomingRequest, state.driver.vehicleType, requestDelayMs]);

  const startBooking = useCallback(
    (pickup: Landmark, destination: Landmark, vehicleType: VehicleType, rideMode: RideMode) => {
      const next = buildBooking(pickup, destination, vehicleType, rideMode, 'finding');
      setBooking(next);
      setStatus('finding');
      setSource('passenger');
      setProgress(0);
      setIncomingRequest(null);
    },
    [],
  );

  const cancelBooking = useCallback(() => {
    setBooking(null);
    setStatus('idle');
    setProgress(0);
  }, []);

  const retryFinding = useCallback(() => {
    setStatus('finding');
    setProgress(0);
    setIncomingRequest(null);
  }, []);

  const boardVehicle = useCallback(() => {
    setStatus('active');
    setProgress(0);
    setBooking((b) => (b ? { ...b, status: 'active' } : b));
  }, []);

  const finishPassengerRide = useCallback(
    (tip: number, rating: number) => {
      if (!booking) return;
      const driver = booking.driverId ? getDriver(booking.driverId) : undefined;
      addReceipt({
        id: makeId('t'),
        date: new Date().toISOString(),
        pickup: booking.pickup.name,
        destination: booking.destination.name,
        vehicleType: booking.vehicleType,
        driverName: driver?.name ?? 'Naga-Gentra driver',
        plate: driver?.plate ?? '—',
        fare: booking.fare.total,
        tip,
        rating,
      });
      setStatus('complete');
      setBooking((b) => (b ? { ...b, status: 'complete' } : b));
    },
    [booking, addReceipt],
  );

  const resetRide = useCallback(() => {
    setBooking(null);
    setStatus('idle');
    setProgress(0);
  }, []);

  const acceptRequest = useCallback(() => {
    if (!incomingRequest) return;
    setBooking({ ...incomingRequest, status: 'assigned' });
    setStatus('assigned');
    setSource('driver');
    setProgress(0);
    setIncomingRequest(null);
  }, [incomingRequest]);

  const declineRequest = useCallback(() => {
    setIncomingRequest(null);
  }, []);

  const arrivedAtPickup = useCallback(() => {
    setStatus('active');
    setProgress(0);
    setBooking((b) => (b ? { ...b, status: 'active' } : b));
  }, []);

  const endRideAsDriver = useCallback(() => {
    setStatus('complete');
    setBooking((b) => (b ? { ...b, status: 'complete' } : b));
  }, []);

  const confirmPaymentAndReset = useCallback(() => {
    if (booking) {
      addEarnings(booking.fare.total, 12);
    }
    setBooking(null);
    setStatus('idle');
    setProgress(0);
  }, [booking, addEarnings]);

  // Driver marker position for the passenger live view.
  const driverPosition = useMemo<LatLng | null>(() => {
    if (!booking || source !== 'passenger') return null;
    const driver = booking.driverId ? getDriver(booking.driverId) : undefined;
    if (!driver) return null;
    if (status === 'assigned') {
      return lerp(driver.latLng, booking.pickup.latLng, progress);
    }
    if (status === 'active') {
      return lerp(booking.pickup.latLng, booking.destination.latLng, progress);
    }
    return null;
  }, [booking, source, status, progress]);

  const value = useMemo<RideContextValue>(
    () => ({
      booking,
      status,
      progress,
      etaSeconds:
        status === 'assigned' ? Math.max(0, Math.ceil((1 - progress) * approachSeconds)) : 0,
      arrived: progress >= 1,
      driverPosition,
      draftPickup,
      draftDestination,
      setDraftPickup,
      setDraftDestination,
      startBooking,
      cancelBooking,
      retryFinding,
      boardVehicle,
      finishPassengerRide,
      resetRide,
      driverOnline,
      setDriverOnline,
      incomingRequest,
      acceptRequest,
      declineRequest,
      arrivedAtPickup,
      endRideAsDriver,
      confirmPaymentAndReset,
    }),
    [
      booking,
      status,
      progress,
      approachSeconds,
      driverPosition,
      draftPickup,
      draftDestination,
      startBooking,
      cancelBooking,
      retryFinding,
      boardVehicle,
      finishPassengerRide,
      resetRide,
      driverOnline,
      incomingRequest,
      acceptRequest,
      declineRequest,
      arrivedAtPickup,
      endRideAsDriver,
      confirmPaymentAndReset,
    ],
  );

  return <RideContext.Provider value={value}>{children}</RideContext.Provider>;
}

const MOCK_DRIVERS_FILTER = (type: VehicleType) => driversByType(type);

export function useRide(): RideContextValue {
  const ctx = useContext(RideContext);
  if (!ctx) {
    throw new Error('useRide must be used within a RideProvider');
  }
  return ctx;
}
