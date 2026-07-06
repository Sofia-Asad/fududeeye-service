import type { ReactNode } from 'react'

const TONES = {
  primary: { bg: 'var(--primary-soft)', fg: 'var(--primary-hover)' },
  amber: { bg: 'var(--warning-bg)', fg: 'var(--warning)' },
  gold: { bg: 'var(--accent-weak)', fg: 'var(--accent-dark)' },
  red: { bg: 'var(--danger-bg)', fg: 'var(--money-owed)' },
  blue: { bg: 'var(--info-bg)', fg: 'var(--info)' },
  success: { bg: 'var(--success-bg)', fg: 'var(--success)' },
  neutral: { bg: 'var(--neutral-bg)', fg: 'var(--neutral)' },
} as const

type SummaryTone = keyof typeof TONES

export default function SummaryCard({
  label,
  value,
  caption,
  icon,
  tone = 'primary',
  valueColor,
}: {
  label: ReactNode
  value: ReactNode
  caption?: ReactNode
  icon?: ReactNode
  tone?: SummaryTone
  valueColor?: string
}) {
  const colors = TONES[tone]

  return (
    <article className="card card-hover" style={{ padding: 18, minHeight: 128, position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div
          style={{
            color: 'var(--muted)',
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: '.14em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </div>
        {icon && (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 13,
              display: 'grid',
              placeItems: 'center',
              background: colors.bg,
              color: colors.fg,
              flexShrink: 0,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,.4)',
            }}
          >
            {icon}
          </div>
        )}
      </div>
      <div
        className="serif"
        style={{
          marginTop: 14,
          color: valueColor ?? 'var(--text)',
          fontSize: 30,
          lineHeight: 1,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
      {caption && (
        <div style={{ marginTop: 9, color: 'var(--muted)', fontSize: 12.5, lineHeight: 1.35 }}>
          {caption}
        </div>
      )}
    </article>
  )
}
