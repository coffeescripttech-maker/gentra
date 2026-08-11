/**
 * Naga-Gentra typography — same system as MacroMorphosis.
 *
 * Headings use Poppins (Bold), body text uses Nunito, buttons use Poppins SemiBold.
 * Font files are loaded via `@expo-google-fonts/*` in the root layout.
 */
export const FontFamily = {
  /** Headings, titles, card headers */
  heading: 'Poppins_700Bold',
  /** Buttons, emphasized labels */
  button: 'Poppins_600SemiBold',
  /** Subheadings */
  headingMedium: 'Poppins_500Medium',
  /** Body / narration text */
  body: 'Nunito_400Regular',
  /** Emphasized body text */
  bodySemibold: 'Nunito_600SemiBold',
  /** Strong emphasis / labels */
  bodyBold: 'Nunito_700Bold',
} as const;

export type FontFamilyName = (typeof FontFamily)[keyof typeof FontFamily];

/** Text sizes used consistently across screens. */
export const FontSize = {
  caption: 12,
  small: 13,
  body: 16,
  subtitle: 18,
  title: 24,
  heading: 28,
  display: 34,
  /** Hero numbers (splash, earnings, ETA). */
  displayLarge: 40,
  /** Inline prices / amounts (slightly larger than body). */
  price: 20,
} as const;

/** Letter-spacing for kickers, titles, and labels. */
export const LetterSpacing = {
  tight: 0.3,
  normal: 0.5,
  wide: 1,
  display: 1.5,
} as const;

/** Line-height scale matched to FontSize for balanced text. */
export const LineHeight = {
  caption: 16,
  small: 18,
  body: 24,
  subtitle: 26,
  title: 32,
  heading: 38,
  display: 44,
  displayLarge: 52,
} as const;
