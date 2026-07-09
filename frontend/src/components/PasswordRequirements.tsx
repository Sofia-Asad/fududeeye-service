import { Check, X } from 'lucide-react'

export interface PasswordChecks {
  length: boolean
  uppercase: boolean
  lowercase: boolean
  number: boolean
  match: boolean
}

export function checkPassword(password: string, confirmPassword: string): PasswordChecks {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    match: password.length > 0 && password === confirmPassword,
  }
}

export function isPasswordValid(checks: PasswordChecks) {
  return checks.length && checks.uppercase && checks.lowercase && checks.number && checks.match
}

const RULES: { key: keyof PasswordChecks; label: string }[] = [
  { key: 'length', label: 'At least 8 characters' },
  { key: 'uppercase', label: 'One uppercase letter' },
  { key: 'lowercase', label: 'One lowercase letter' },
  { key: 'number', label: 'One number' },
  { key: 'match', label: 'Passwords match' },
]

export default function PasswordRequirements({ checks }: { checks: PasswordChecks }) {
  return (
    <ul style={{ listStyle: 'none', margin: '4px 0 0', padding: 0, display: 'grid', gap: 6 }}>
      {RULES.map(rule => {
        const passed = checks[rule.key]
        return (
          <li key={rule.key} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: passed ? 'var(--success)' : 'var(--text-faint)' }}>
            {passed ? <Check size={14} /> : <X size={14} />}
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}
