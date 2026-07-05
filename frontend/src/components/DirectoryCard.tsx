import { Search } from 'lucide-react'
import type { ReactNode } from 'react'

export function SearchBox({
  value,
  onChange,
  placeholder = 'Search',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label className="directory-search" style={{ position: 'relative', display: 'block' }}>
      <Search size={16} style={{ position: 'absolute', left: 13, top: 14, color: 'var(--muted)' }} />
      <input
        className="control"
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '0 12px 0 38px' }}
      />
    </label>
  )
}

export function DirectorySelect({
  value,
  onChange,
  children,
  ariaLabel,
}: {
  value: string | number
  onChange: (value: string) => void
  children: ReactNode
  ariaLabel?: string
}) {
  return (
    <select
      className="control"
      value={value}
      onChange={event => onChange(event.target.value)}
      aria-label={ariaLabel}
      style={{ padding: '0 12px' }}
    >
      {children}
    </select>
  )
}

export function DirectoryToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="directory-toolbar">
      {children}
    </div>
  )
}

export function DirectorySkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ padding: '4px 18px 18px', display: 'grid', gap: 13 }}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} style={{ display: 'grid', gridTemplateColumns: '1.4fr .8fr .7fr .6fr', gap: 18 }}>
          <span className="skeleton-row" />
          <span className="skeleton-row" />
          <span className="skeleton-row" />
          <span className="skeleton-row" />
        </div>
      ))}
    </div>
  )
}

export default function DirectoryCard({
  title,
  count,
  toolbar,
  children,
  footer,
}: {
  title: ReactNode
  count?: ReactNode
  toolbar?: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <section className="card" style={{ overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '18px 18px 14px',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 16.5, fontWeight: 700, color: 'var(--text)' }}>
            {title}
          </h2>
          {count && (
            <div style={{ marginTop: 3, color: 'var(--muted)', fontSize: 12.5 }}>
              {count}
            </div>
          )}
        </div>
      </div>
      {toolbar}
      {children}
      {footer && (
        <div style={{ borderTop: '1px solid var(--row-line)', padding: '13px 18px' }}>
          {footer}
        </div>
      )}
    </section>
  )
}
