export type PasswordStrengthLevel = 'empty' | 'weak' | 'fair' | 'good' | 'strong'

export interface PasswordStrengthResult {
  score: number
  level: PasswordStrengthLevel
  label: string
}

const STRENGTH_LEVELS: { level: PasswordStrengthLevel; label: string }[] = [
  { level: 'empty', label: '' },
  { level: 'weak', label: 'Weak' },
  { level: 'fair', label: 'Fair' },
  { level: 'good', label: 'Good' },
  { level: 'strong', label: 'Strong' },
]

/** Lightweight heuristic password strength score from 0 (empty) to 4 (strong). */
export function getPasswordStrength(password: string): PasswordStrengthResult {
  if (!password) return { score: 0, level: 'empty', label: '' }

  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  const clamped = Math.min(score, 4)
  const entry = STRENGTH_LEVELS[clamped] ?? STRENGTH_LEVELS[0]!
  return { score: clamped, level: entry.level, label: entry.label }
}

export const PASSWORD_REQUIREMENTS: { label: string; test: (value: string) => boolean }[] = [
  { label: 'At least 8 characters', test: value => value.length >= 8 },
  { label: 'One uppercase letter', test: value => /[A-Z]/.test(value) },
  { label: 'One lowercase letter', test: value => /[a-z]/.test(value) },
  { label: 'One number or special character', test: value => /[\d\W]/.test(value) },
]

/** Masks an email for display, e.g. "jane.doe@example.com" -> "ja***@example.com". */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  const visible = local.slice(0, Math.min(2, local.length))
  return `${visible}${'*'.repeat(Math.max(local.length - visible.length, 3))}@${domain}`
}
