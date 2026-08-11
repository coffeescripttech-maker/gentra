import type { Terminal } from '@/types';

/** Registered jeepney terminals from the MVP spec ("Registered Terminals (MVP)"). */
export const TERMINALS: Terminal[] = [
  {
    id: 'plaza-terminal',
    name: 'Plaza Rizal Terminal',
    address: 'Plaza Rizal, Naga City',
    latLng: { latitude: 13.6253, longitude: 123.1885 },
    route: 'City Loop — Plaza',
  },
  {
    id: 'sm-terminal',
    name: 'SM City Naga Terminal',
    address: 'Magsaysay Ave., Naga City',
    latLng: { latitude: 13.6197, longitude: 123.1833 },
    route: 'Bagumbayan — SM',
  },
  {
    id: 'city-hall-terminal',
    name: 'Naga City Hall Terminal',
    address: 'J. Miranda Ave., Naga City',
    latLng: { latitude: 13.6264, longitude: 123.1874 },
    route: 'Peñafrancia — City Hall',
  },
  {
    id: 'univ-belt-terminal',
    name: 'University Belt Terminal',
    address: 'Bagumbayan Sur, Naga City',
    latLng: { latitude: 13.6243, longitude: 123.1922 },
    route: 'Ateneo — Naga Central',
  },
];

export function getTerminal(id: string): Terminal | undefined {
  return TERMINALS.find((t) => t.id === id);
}
