import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'

import { useDismissableMenu } from '@/hooks/useDismissableMenu'

export interface NotificationItem {
  label: string
  count: number
  to: string
  tone: 'primary' | 'danger'
}

const TONE_COLORS = {
  primary: { bg: 'var(--primary-soft)', fg: 'var(--primary-hover)' },
  danger: { bg: 'var(--danger-bg)', fg: 'var(--danger)' },
} as const

/** Notification bell — reuses the same open-demand/complaint/inquiry counts already shown as sidebar badges. */
export default function NotificationsMenu({ items }: { items: NotificationItem[] }) {
  const { open, setOpen, ref } = useDismissableMenu<HTMLDivElement>()
  const total = items.reduce((sum, item) => sum + item.count, 0)

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(current => !current)}
        aria-label="Notifications"
        aria-expanded={open}
        style={{
          position: 'relative',
          width: 40,
          height: 40,
          borderRadius: 12,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--muted)',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
        }}
      >
        <Bell size={17} />
        {total > 0 && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 6,
              right: 7,
              minWidth: 8,
              height: 8,
              borderRadius: 999,
              background: 'var(--accent)',
            }}
          />
        )}
      </button>

      {open && (
        <div
          className="card"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 280,
            zIndex: 40,
            padding: 8,
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div style={{ padding: '8px 10px 10px', color: 'var(--text)', fontSize: 13, fontWeight: 700 }}>
            Notifications
          </div>
          <div style={{ display: 'grid', gap: 2 }}>
            {items.map(item => {
              const colors = TONE_COLORS[item.tone]
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    padding: '9px 10px',
                    borderRadius: 10,
                    color: 'var(--text-mid)',
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                  onMouseEnter={event => { event.currentTarget.style.background = 'var(--thead-bg)' }}
                  onMouseLeave={event => { event.currentTarget.style.background = 'transparent' }}
                >
                  <span>{item.label}</span>
                  <span
                    style={{
                      minWidth: 22,
                      height: 21,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 999,
                      padding: '0 7px',
                      background: item.count > 0 ? colors.bg : 'var(--neutral-bg)',
                      color: item.count > 0 ? colors.fg : 'var(--neutral)',
                      fontSize: 11.5,
                      fontWeight: 700,
                    }}
                  >
                    {item.count}
                  </span>
                </Link>
              )
            })}
          </div>
          {total === 0 && (
            <div style={{ padding: '8px 10px 4px', color: 'var(--muted)', fontSize: 12 }}>
              You&rsquo;re all caught up.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
