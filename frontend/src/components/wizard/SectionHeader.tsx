import type { ReactNode } from 'react'

/** Generic icon + title + description row — the same visual language as an AccordionCard header, usable standalone (e.g. inside a modal or a static card). */
export default function SectionHeader({ icon, title, description }: { icon: ReactNode; title: string; description?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
      <span style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 11, background: 'var(--accent-weak)', color: 'var(--accent-dark)', flexShrink: 0 }}>
        {icon}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{title}</div>
        {description && <div style={{ marginTop: 1, fontSize: 12, color: 'var(--muted)' }}>{description}</div>}
      </div>
    </div>
  )
}
