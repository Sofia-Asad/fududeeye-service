import { Check, X } from 'lucide-react'

import { PASSWORD_REQUIREMENTS, getPasswordStrength } from '@/utils/auth'
import { cn } from '@/lib/utils'

const BAR_COLORS: Record<string, string> = {
  empty: 'bg-border',
  weak: 'bg-danger',
  fair: 'bg-warning',
  good: 'bg-info',
  strong: 'bg-success',
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  const { score, level, label } = getPasswordStrength(password)

  return (
    <div className="grid gap-2" aria-live="polite">
      <div className="grid grid-cols-4 gap-1.5">
        {Array.from({ length: 4 }).map((_, index) => (
          <span key={index} className={cn('h-1.5 rounded-full bg-border', index < score && BAR_COLORS[level])} />
        ))}
      </div>
      {label && (
        <p className="text-xs font-medium text-ink-muted">
          Password strength: <span className="font-semibold text-ink">{label}</span>
        </p>
      )}
    </div>
  )
}

export function PasswordRequirementsList({ password }: { password: string }) {
  return (
    <ul className="grid gap-1.5">
      {PASSWORD_REQUIREMENTS.map(requirement => {
        const met = requirement.test(password)
        return (
          <li key={requirement.label} className="flex items-center gap-2 text-xs text-ink-muted">
            {met ? (
              <Check size={14} aria-hidden="true" className="text-success" />
            ) : (
              <X size={14} aria-hidden="true" className="text-ink-faint" />
            )}
            <span className={cn(met && 'text-ink')}>{requirement.label}</span>
          </li>
        )
      })}
    </ul>
  )
}

/** Combined strength meter + requirements checklist. */
export default function PasswordStrength({ password }: { password: string }) {
  return (
    <div className="grid gap-3">
      <PasswordStrengthMeter password={password} />
      <PasswordRequirementsList password={password} />
    </div>
  )
}
