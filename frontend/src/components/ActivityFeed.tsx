import { Clock3 } from 'lucide-react'
import type { ReactNode } from 'react'

export interface ActivityFeedItem {
  title: ReactNode
  caption?: ReactNode
  icon?: ReactNode
  tone?: 'primary' | 'amber' | 'blue' | 'red' | 'neutral'
}

const TONES = {
  primary: { bg: 'var(--primary-soft)', fg: 'var(--primary-hover)' },
  amber: { bg: 'var(--warning-bg)', fg: 'var(--warning)' },
  blue: { bg: 'var(--info-bg)', fg: 'var(--info)' },
  red: { bg: 'var(--danger-bg)', fg: 'var(--danger)' },
  neutral: { bg: 'var(--neutral-bg)', fg: 'var(--neutral)' },
} as const

export default function ActivityFeed({
  title = 'Activity',
  items,
}: {
  title?: ReactNode
  items: ActivityFeedItem[]
}) {
  return (
    <section className="card" style={{ padding: 20 }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>{title}</h2>
      <div style={{ display: 'grid', gap: 14 }}>
        {items.map((item, index) => {
          const colors = TONES[item.tone ?? 'primary']
          return (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '30px minmax(0, 1fr)', gap: 11 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 999,
                  display: 'grid',
                  placeItems: 'center',
                  background: colors.bg,
                  color: colors.fg,
                }}
              >
                {item.icon ?? <Clock3 size={15} />}
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>{item.title}</div>
                {item.caption && (
                  <div style={{ marginTop: 2, fontSize: 12.5, color: 'var(--muted)' }}>
                    {item.caption}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
