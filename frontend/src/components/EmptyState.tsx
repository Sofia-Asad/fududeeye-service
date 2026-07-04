import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

export default function EmptyState({
  icon,
  title,
  subtitle,
  action,
}: {
  icon?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
}) {
  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 6, padding: '46px 20px', textAlign: 'center' }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 999,
          display: 'grid',
          placeItems: 'center',
          background: 'var(--neutral-bg)',
          color: 'var(--neutral)',
          marginBottom: 6,
        }}
      >
        {icon ?? <Inbox size={19} />}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{title}</div>
      {subtitle && (
        <div style={{ fontSize: 12.5, color: 'var(--muted)', maxWidth: 320, lineHeight: 1.45 }}>
          {subtitle}
        </div>
      )}
      {action && <div style={{ marginTop: 10 }}>{action}</div>}
    </div>
  )
}
