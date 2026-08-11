/**
 * Naga-Gentra palette — same global system as MacroMorphosis (design plan §9),
 * plus transport-specific semantic accents and premium depth tokens
 * (gradients, glass, scrims, star rating).
 */
export const Colors = {
  /** Global background */
  background: '#F8FAFC',
  /** Card / surface background */
  card: '#FFFFFF',
  /** Primary text */
  primaryText: '#1F2937',
  /** Secondary text */
  secondaryText: '#6B7280',
  /** Success / available / correct */
  success: '#22C55E',
  /** Error / full / incorrect */
  error: '#EF4444',
  /** Warning / filling up */
  warning: '#F59E0B',
  /** Muted border color */
  border: '#E5E7EB',
  /** Input / subtle fill */
  muted: '#F1F5F9',
  /** On-accent text */
  onAccent: '#FFFFFF',
  /** Brand blue — passenger accent */
  brand: '#208AEF',
  /** Brand blue soft tint (used over brand backgrounds) */
  brandSoft: '#E8F1FE',
  /** Driver accent (emerald) */
  driver: '#059669',
  /** Driver soft tint */
  driverSoft: '#E7F6F1',

  // ── Premium depth / accent tokens ──────────────────────────────
  /** Deep brand blue for gradient bottoms / pressed states */
  brandDeep: '#176BC8',
  /** Passenger hero / primary-button gradient (top → bottom) */
  brandGradient: ['#2E93F0', '#176BC8'] as const,
  /** Deep driver emerald for gradient bottoms / pressed states */
  driverDeep: '#047857',
  /** Driver hero / earnings gradient (top → bottom) */
  driverGradient: ['#10B981', '#047857'] as const,
  /** Modal / sheet backdrop scrim */
  scrim: 'rgba(10, 25, 45, 0.4)',
  /** Frosted surface over maps / imagery */
  glass: 'rgba(255, 255, 255, 0.86)',
  /** Rating-star amber (same value as `warning`, named semantically) */
  star: '#F59E0B',
  /** Frosted circle over accent fills */
  accentGlass: 'rgba(255, 255, 255, 0.25)',
  /** Body text on accent fills */
  onAccentSoft: 'rgba(255, 255, 255, 0.9)',
  /** Hint text on accent fills */
  onAccentMuted: 'rgba(255, 255, 255, 0.8)',
  /** Map pickup marker */
  pickup: '#208AEF',
  /** Map destination marker */
  destination: '#EF4444',
  /** Soft success glass tint (empty-state / pickup accents) */
  successSoft: 'rgba(34, 197, 94, 0.12)',
  /** Soft danger glass tint (emergency glass) */
  dangerSoft: 'rgba(239, 68, 68, 0.12)',
  /** Soft amber glass tint (low-balance nudge) */
  warningSoft: 'rgba(245, 158, 11, 0.12)',
} as const;

export type GlobalColorName = keyof typeof Colors;
