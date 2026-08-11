import { ViewStyle } from 'react-native';

import { Colors } from '@/constants/colors';

/**
 * Soft, layered shadow presets — the app's depth layer. Cards that sit on
 * `Colors.muted` get `card`, floating sheets/CTAs get `elevated`, modal
 * sheets get `modal`. iOS uses layered shadow*, Android uses elevation.
 */
export const shadows = {
  /** Default card resting on a muted background. */
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  } satisfies ViewStyle,

  /** Raised cards / primary CTAs. */
  elevated: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
  } satisfies ViewStyle,

  /** Bottom sheets / modals. */
  modal: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 12,
  } satisfies ViewStyle,
} as const;
