import type { ReactNode } from 'react'

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 18,
        marginBottom: 20,
      }}
    >
      <div style={{ minWidth: 0 }}>
        {eyebrow && (
          <div
            style={{
              marginBottom: 5,
              color: 'var(--muted)',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {eyebrow}
          </div>
        )}
        <h1
          className="serif"
          style={{
            margin: 0,
            color: 'var(--text)',
            fontSize: 31,
            lineHeight: 1.08,
            fontWeight: 700,
            letterSpacing: 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              margin: '7px 0 0',
              color: 'var(--muted)',
              fontSize: 13.5,
              lineHeight: 1.45,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          {actions}
        </div>
      )}
    </header>
  )
}
