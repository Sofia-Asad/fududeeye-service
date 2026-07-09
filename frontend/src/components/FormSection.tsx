import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

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

/** Text input with a leading icon, e.g. phone/email/location fields. */
export function IconInput({ icon, style, ...props }: { icon: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <span style={{ position: 'relative', display: 'block' }}>
      <span style={{ position: 'absolute', left: 13, top: 0, bottom: 0, display: 'flex', alignItems: 'center', color: 'var(--muted)', pointerEvents: 'none' }}>
        {icon}
      </span>
      <input className="control" style={{ width: '100%', padding: '0 12px 0 38px', ...style }} {...props} />
    </span>
  )
}

/** Currency input with a bordered "$" prefix chip, for price/amount fields. */
export function MoneyInput({ style, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <span style={{ position: 'relative', display: 'block' }}>
      <span
        style={{
          position: 'absolute',
          left: 1,
          top: 1,
          bottom: 1,
          width: 34,
          display: 'grid',
          placeItems: 'center',
          color: 'var(--muted)',
          fontWeight: 700,
          fontSize: 13,
          borderRight: '1px solid var(--border-strong)',
          background: 'var(--surface-2)',
          borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)',
          pointerEvents: 'none',
        }}
      >
        $
      </span>
      <input
        className="control"
        inputMode="decimal"
        style={{ width: '100%', padding: '0 12px 0 44px', fontVariantNumeric: 'tabular-nums', ...style }}
        {...props}
      />
    </span>
  )
}

/** Short, resizable textarea for compact enterprise forms — replaces oversized default textareas inside accordion sections/modals. */
export function CompactTextarea({ style, rows = 2, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="control"
      rows={rows}
      style={{ width: '100%', resize: 'vertical', ...style }}
      {...props}
    />
  )
}

/** Highlighted metric readout, e.g. expected markup or company profit preview. */
export function MetricCallout({
  icon,
  label,
  value,
  valueColor,
  hint,
}: {
  icon?: ReactNode
  label: ReactNode
  value: ReactNode
  valueColor?: string
  hint?: ReactNode
}) {
  return (
    <div style={{ border: '1px dashed var(--accent-dark)', borderRadius: 14, background: 'var(--accent-weak)', padding: 15 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary-hover)', fontWeight: 700, fontSize: 13 }}>
        {icon}
        {label}
      </div>
      <div className="serif" style={{ marginTop: 7, color: valueColor ?? 'var(--primary-hover)', fontSize: 26, fontWeight: 700 }}>
        {value}
      </div>
      {hint && <div style={{ marginTop: 4, color: 'var(--muted)', fontSize: 12 }}>{hint}</div>}
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
        background: 'var(--thead-bg)',
        border: '1px solid var(--border)',
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
              boxShadow: active ? 'var(--shadow-sm)' : 'none',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background-color 150ms ease, color 150ms ease, box-shadow 150ms ease',
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
