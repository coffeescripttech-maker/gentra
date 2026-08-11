/** Shared domain types for the Naga-Gentra prototype. */

export type Role = 'passenger' | 'driver';
export type VehicleType = 'tricycle' | 'jeepney';
export type RideMode = 'special' | 'shared';
export type RideStatus = 'idle' | 'finding' | 'assigned' | 'active' | 'complete';

export interface LatLng {
  latitude: number;
  longitude: number;
}

/** A named pickup / drop-off place in Naga City. */
export interface Landmark {
  id: string;
  name: string;
  address: string;
  latLng: LatLng;
}

/** A nearby driver shown on the map / in the list. */
export interface Driver {
  id: string;
  name: string;
  emoji: string;
  plate: string;
  vehicleType: VehicleType;
  rating: number;
  rideCount: number;
  maxCapacity: number;
  currentPassengers: number;
  latLng: LatLng;
  online: boolean;
}

export interface FareBreakdown {
  vehicleType: VehicleType;
  rideMode: RideMode;
  distanceKm: number;
  /** Base fare (first N free km). */
  base: number;
  /** Distance-based cost. */
  distanceCost: number;
  /** Night-rate surcharge (10 PM – 5 AM). */
  nightSurcharge: number;
  total: number;
}

export interface Booking {
  id: string;
  status: RideStatus;
  pickup: Landmark;
  destination: Landmark;
  vehicleType: VehicleType;
  rideMode: RideMode;
  distanceKm: number;
  fare: FareBreakdown;
  driverId?: string;
  createdAt: number;
  /** Passenger details shown to a driver (incoming request). */
  passengerName?: string;
  passengerRating?: number;
}

/** A registered jeepney terminal (digital pila). */
export interface Terminal {
  id: string;
  name: string;
  address: string;
  latLng: LatLng;
  route: string;
}

/** A completed trip stored in the passenger history. */
export interface TripReceipt {
  id: string;
  /** ISO date string. */
  date: string;
  pickup: string;
  destination: string;
  vehicleType: VehicleType;
  driverName: string;
  plate: string;
  fare: number;
  tip: number;
  rating: number;
}

export interface PassengerProfile {
  name: string;
  phone: string;
  savedLocations: Landmark[];
  emergencyContact: string;
}

export interface DriverProfile {
  name: string;
  phone: string;
  vehicleType: VehicleType;
  plate: string;
  maxCapacity: number;
  verification: {
    license: boolean;
    registration: boolean;
    franchise: boolean;
    photos: boolean;
  };
}

export interface EarningsDay {
  date: string;
  trips: number;
  cash: number;
  onlineMinutes: number;
}

/** Persisted app state for both roles. */
export interface SessionState {
  /** Whether the user has picked a role at least once. */
  roleChosen: boolean;
  role: Role;
  passenger: PassengerProfile;
  driver: DriverProfile;
  receipts: TripReceipt[];
  earnings: EarningsDay[];
  /** Passenger wallet cash balance (₱). */
  walletBalance: number;
  /** Shortens the simulated ride timings for live demos. */
  fastDemo: boolean;
}
