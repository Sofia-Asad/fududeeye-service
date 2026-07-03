import type { ReactNode } from 'react'

export interface DetailMetaRow {
  label: ReactNode
  value: ReactNode
}

export default function DetailMeta({
  title = 'Details',
  rows,
}: {
  title?: ReactNode
  rows: DetailMetaRow[]
}) {
  return (
    <section className="card" style={{ padding: 20 }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>{title}</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        {rows.map((row, index) => (
          <div
            key={index}
            style={{
              display: 'grid',
              gridTemplateColumns: '130px minmax(0, 1fr)',
              gap: 12,
              alignItems: 'baseline',
            }}
          >
            <div style={{ color: 'var(--muted)', fontSize: 12.5 }}>{row.label}</div>
            <div style={{ color: 'var(--text)', fontSize: 13.5, fontWeight: 700, minWidth: 0 }}>
              {row.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
