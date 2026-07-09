import type { ReactNode } from 'react'

/** Generic informational/placeholder card — dashed border variant for "not yet available" states. */
export default function InfoCard({
  icon,
  title,
  description,
  dashed,
}: {
  icon: ReactNode
  title: string
  description: string
  dashed?: boolean
}) {
  return (
    <section
      className={dashed ? undefined : 'card'}
      style={{
        padding: '24px 20px',
        textAlign: 'center',
        borderRadius: 14,
        border: dashed ? '1.5px dashed var(--border-strong)' : undefined,
        background: dashed ? 'var(--surface-2)' : undefined,
      }}
    >
      <div style={{ display: 'grid', placeItems: 'center', width: 44, height: 44, margin: '0 auto', borderRadius: 12, background: 'var(--neutral-bg)', color: 'var(--text-faint)' }}>
        {icon}
      </div>
      <p style={{ margin: '12px 0 0', color: 'var(--text-mid)', fontSize: 13, fontWeight: 700 }}>{title}</p>
      <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 12, lineHeight: 1.4 }}>{description}</p>
    </section>
  )
}
