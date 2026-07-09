import type { ReactNode } from 'react'

export interface SummaryRow {
  label: string
  value: ReactNode
  emphasis?: boolean
}

/** Sticky, read-only live-preview sidebar for a create/edit wizard — reusable across modules. */
export default function StickySummaryPanel({
  icon,
  title,
  subtitle,
  rows,
  children,
}: {
  icon: ReactNode
  title: string
  subtitle?: string
  rows: SummaryRow[]
  children?: ReactNode
}) {
  return (
    <aside className="sticky-side-panel" style={{ display: 'grid', gap: 14 }}>
      <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px 14px' }}>
          <span style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 11, background: 'var(--accent-weak)', color: 'var(--accent-dark)', flexShrink: 0 }}>
            {icon}
          </span>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 14.5, fontWeight: 700 }}>{title}</h2>
            {subtitle && <p style={{ margin: '1px 0 0', color: 'var(--muted)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitle}</p>}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10, padding: '2px 18px 18px', borderTop: '1px solid var(--row-line)', paddingTop: 14 }}>
          {rows.map(row => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>{row.label}</span>
              <span style={{ color: 'var(--text)', fontSize: row.emphasis ? 15 : 13, fontWeight: 700, textAlign: 'right', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {children}
    </aside>
  )
}
