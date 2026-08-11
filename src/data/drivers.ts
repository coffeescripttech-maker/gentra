import type { Driver, VehicleType } from '@/types';

/**
 * Mock nearby drivers. Positions are jittered around downtown Naga so the
 * prototype map looks alive without any backend.
 */
export const MOCK_DRIVERS: Driver[] = [
  {
    id: 'd1',
    name: 'Mang Tony',
    emoji: '🧔🏻',
    plate: 'NAG-1024',
    vehicleType: 'tricycle',
    rating: 4.8,
    rideCount: 1284,
    maxCapacity: 4,
    currentPassengers: 1,
    latLng: { latitude: 13.6269, longitude: 123.1895 },
    online: true,
  },
  {
    id: 'd2',
    name: 'Kuya Romy',
    emoji: '👨🏽',
    plate: 'NAG-3718',
    vehicleType: 'tricycle',
    rating: 4.6,
    rideCount: 967,
    maxCapacity: 4,
    currentPassengers: 0,
    latLng: { latitude: 13.6233, longitude: 123.1841 },
    online: true,
  },
  {
    id: 'd3',
    name: 'Ate Liza',
    emoji: '👩🏻',
    plate: 'NGA-8551',
    vehicleType: 'tricycle',
    rating: 4.9,
    rideCount: 2103,
    maxCapacity: 4,
    currentPassengers: 2,
    latLng: { latitude: 13.6281, longitude: 123.1862 },
    online: true,
  },
  {
    id: 'd4',
    name: 'Kap. Dindo',
    emoji: '👨🏻🦱',
    plate: 'NAG-2097',
    vehicleType: 'jeepney',
    rating: 4.5,
    rideCount: 3481,
    maxCapacity: 23,
    currentPassengers: 9,
    latLng: { latitude: 13.6195, longitude: 123.1819 },
    online: true,
  },
  {
    id: 'd5',
    name: 'Manong Berto',
    emoji: '👴🏼',
    plate: 'NGA-4412',
    vehicleType: 'jeepney',
    rating: 4.7,
    rideCount: 4022,
    maxCapacity: 23,
    currentPassengers: 19,
    latLng: { latitude: 13.6311, longitude: 123.1859 },
    online: true,
  },
  {
    id: 'd6',
    name: 'Ate Maricel',
    emoji: '👩🏽‍🦰',
    plate: 'NAG-6684',
    vehicleType: 'jeepney',
    rating: 4.4,
    rideCount: 1180,
    maxCapacity: 23,
    currentPassengers: 5,
    latLng: { latitude: 13.6229, longitude: 123.1776 },
    online: true,
  },
];

export function getDriver(id: string): Driver | undefined {
  return MOCK_DRIVERS.find((d) => d.id === id);
}

/** Available drivers filtered by vehicle type. */
export function driversByType(type: VehicleType | 'all'): Driver[] {
  return MOCK_DRIVERS.filter((d) => d.online && (type === 'all' || d.vehicleType === type));
}
