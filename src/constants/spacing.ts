/**
 * Spacing + radius scale for Naga-Gentra. Replaces the ad-hoc 16/20/24
 * radii and 12/16/20 paddings scattered across screens.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  huge: 32,
} as const;

/** Corner radii — pills use `pill`. */
export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 99,
} as const;
