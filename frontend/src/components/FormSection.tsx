import type { ReactNode } from 'react'

const TONES = {
  primary: { bg: 'var(--primary-soft)', fg: 'var(--primary-hover)' },
  amber: { bg: 'var(--warning-bg)', fg: 'var(--warning)' },
  blue: { bg: 'var(--info-bg)', fg: 'var(--info)' },
  red: { bg: 'var(--danger-bg)', fg: 'var(--danger)' },
  neutral: { bg: 'var(--neutral-bg)', fg: 'var(--neutral)' },
} as const

type FormTone = keyof typeof TONES

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null
  return (
    <span className="field-error">
      {children}
    </span>
  )
}

export function FieldLabel({
  label,
  required,
  children,
  error,
  helper,
  name,
}: {
  label: ReactNode
  required?: boolean
  children: ReactNode
  error?: ReactNode
  helper?: ReactNode
  name?: string
}) {
  return (
    <label className="field-label" data-error={!!error} data-field={name}>
      <span className="field-title">
        {label}
        {required && <span className="field-required">*</span>}
      </span>
      {children}
      {helper && !error && <span className="field-helper">{helper}</span>}
      <FieldError>{error}</FieldError>
    </label>
  )
}

export function Field({
  label,
  required,
  error,
  helper,
  name,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  helper?: ReactNode
  name?: string
  children: ReactNode
}) {
  return (
    <label className="field-label" data-error={!!error} data-field={name}>
      <span className="field-title">
        {label}
        {required && <span className="field-required">*</span>}
      </span>
      {children}
      {helper && !error && <span className="field-helper">{helper}</span>}
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}

export function FormGrid({ children }: { children: ReactNode }) {
  return (
    <div className="form-grid">
      {children}
    </div>
  )
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (value: T) => void
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        gap: 4,
        padding: 4,
        borderRadius: 10,
        background: '#f0eee3',
      }}
    >
      {options.map(option => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            style={{
              height: 36,
              border: 'none',
              borderRadius: 8,
              background: active ? '#ffffff' : 'transparent',
              color: active ? 'var(--primary-hover)' : 'var(--muted)',
              boxShadow: active ? '0 1px 2px rgba(34,48,42,.08)' : 'none',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export default function FormSection({
  icon,
  title,
  description,
  children,
  tone = 'primary',
}: {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  tone?: FormTone
}) {
  const colors = TONES[tone]

  return (
    <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 20px 16px' }}>
        {icon && (
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 13,
              display: 'grid',
              placeItems: 'center',
              background: colors.bg,
              color: colors.fg,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
        <div>
          <h2 style={{ margin: 0, fontSize: 15.5, fontWeight: 700 }}>{title}</h2>
          {description && (
            <p style={{ margin: '3px 0 0', color: 'var(--muted)', fontSize: 12.5, lineHeight: 1.35 }}>
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="form-section-body">
        {children}
      </div>
    </section>
  )
}
