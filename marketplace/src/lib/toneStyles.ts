/** Shared icon-chip color rotation for feature/value cards across the informational pages. */
export const ICON_TONE_CLASSES = {
  gold: 'bg-gold-soft text-gold-hover',
  primary: 'bg-primary-soft text-primary',
  info: 'bg-info-soft text-info',
  success: 'bg-success-soft text-success',
} as const

/** Matching top-border accent for the same tone, e.g. on a card wrapping the icon chip above. */
export const BORDER_TONE_CLASSES = {
  gold: 'border-t-gold',
  primary: 'border-t-primary',
  info: 'border-t-info',
  success: 'border-t-success',
} as const

export type IconTone = keyof typeof ICON_TONE_CLASSES
