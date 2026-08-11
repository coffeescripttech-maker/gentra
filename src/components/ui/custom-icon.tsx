import { Image, type ImageStyle, type StyleProp } from 'react-native';

/**
 * Custom glyphs from `assets/images/custom_icons/`. The PNGs are transparent
 * full-color illustrations, so they render as-is at `size` — the same footprint
 * as a Lucide icon of that size (vehicles and brand marks read better as real
 * drawings than line icons).
 */
export type CustomIconKind =
  | 'tricycle'
  | 'jeepney'
  | 'orders'
  | 'wallet'
  | 'places'
  | 'promos'
  | 'profile';

const CUSTOM_IMAGES: Record<CustomIconKind, number> = {
  tricycle: require('../../../assets/images/custom_icons/e-tricycle.png'),
  jeepney: require('../../../assets/images/custom_icons/jeep.png'),
  orders: require('../../../assets/images/custom_icons/orders.png'),
  wallet: require('../../../assets/images/custom_icons/wallet.png'),
  places: require('../../../assets/images/custom_icons/places.png'),
  promos: require('../../../assets/images/custom_icons/promos.png'),
  profile: require('../../../assets/images/custom_icons/profile.png')
};

interface CustomIconProps {
  kind: CustomIconKind;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

/** Renders a custom artwork glyph at a consistent icon size. */
export function CustomIcon({ kind, size = 24, style }: CustomIconProps) {
  return (
    <Image
      source={CUSTOM_IMAGES[kind]}
      style={[{ width: size, height: size, resizeMode: 'contain' }, style]}
    />
  );
}
