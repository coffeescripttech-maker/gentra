import type { LucideProps } from 'lucide-react-native';
import {
  ArrowLeft,
  BadgeCheck,
  BanknoteX,
  Bell,
  Bike,
  Bus,
  BusFront,
  Car,
  CarFront,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleUser,
  ClipboardX,
  Clock,
  Coins,
  Ellipsis,
  Flag,
  Gauge,
  House,
  Info,
  MapPin,
  MapPinCheck,
  MapPinOff,
  Moon,
  Navigation,
  Phone,
  Plus,
  Radar,
  Receipt,
  Route,
  Search,
  ShieldCheck,
  Star,
  Tag,
  Ticket,
  TriangleAlert,
  User,
  Users,
  Wallet,
  WalletCards,
  Wifi,
  WifiOff,
  Zap
} from 'lucide-react-native';
import type { ComponentType } from 'react';

import { Colors } from '@/constants/colors';

type LucideIcon = ComponentType<LucideProps>;

/**
 * The app's single icon language. `IconName` is a *curated* union — only the
 * glyphs this app actually uses, each backed by a Lucide line icon — so a stray
 * or misspelled name is a compile error instead of a silent fallback.
 *
 * (kebab-case MDI-style names are kept on purpose: they match the call sites,
 * and this map is the only thing that changes when the icon set changes.)
 */
const ICONS = {
  account: User,
  'account-alert': Phone,
  'account-circle': CircleUser,
  'account-group': Users,
  alert: TriangleAlert,
  'arrow-left': ArrowLeft,
  'bell-outline': Bell,
  bus: Bus,
  'bus-clock': BusFront,
  'car-multiple': Car,
  'car-off': CarFront,
  'cash-check': BadgeCheck,
  'cash-multiple': Coins,
  'cash-remove': BanknoteX,
  'check-circle': CheckCircle2,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  circle: Circle,
  'clipboard-remove-outline': ClipboardX,
  'clock-outline': Clock,
  'dots-horizontal': Ellipsis,
  'flag-checkered': Flag,
  home: House,
  'information-outline': Info,
  'lightning-bolt': Zap,
  magnify: Search,
  'map-marker': MapPin,
  'map-marker-check': MapPinCheck,
  'map-marker-distance': Route,
  'map-marker-off': MapPinOff,
  'map-marker-path': Route,
  'menu-down': ChevronDown,
  motorbike: Bike,
  navigation: Navigation,
  plus: Plus,
  radar: Radar,
  receipt: Receipt,
  'shield-check': ShieldCheck,
  speedometer: Gauge,
  star: Star,
  'star-outline': Star,
  steering: Gauge,
  'tag-heart': Ticket,
  'tag-outline': Tag,
  wallet: Wallet,
  'wallet-outline': Wallet,
  'wallet-plus': WalletCards,
  'weather-night': Moon,
  wifi: Wifi,
  'wifi-off': WifiOff
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  /** Lucide stroke weight (default 2 = clean 1.5px-ish line). */
  strokeWidth?: number;
}

/** Every functional glyph in the app goes through this. */
export function Icon({
  name,
  size = 24,
  color = Colors.primaryText,
  strokeWidth = 2
}: IconProps) {
  const Cmp = ICONS[name];
  return <Cmp size={size} color={color} strokeWidth={strokeWidth} />;
}
