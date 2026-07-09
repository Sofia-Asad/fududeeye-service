import { Link } from 'react-router-dom'
import { ChevronDown, LogOut, UserRound } from 'lucide-react'

import { useDismissableMenu } from '@/hooks/useDismissableMenu'
import { initialsFor, roleLabel } from '@/lib/format'
import type { Role } from '@/types/auth'

export default function UserProfileMenu({
  fullName,
  role,
  userId,
  onLogout,
}: {
  fullName: string
  role?: Role
  userId?: number
  onLogout: () => void
}) {
  const { open, setOpen, ref } = useDismissableMenu<HTMLDivElement>()
  const initials = initialsFor(fullName)
  // UserViewSet (and so /users/:id) is admin-only on the backend — only offer
  // the profile link to roles that can actually load it.
  const canViewProfile = role === 'ADMIN' && !!userId

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(current => !current)}
        aria-expanded={open}
        aria-label="User menu"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          height: 40,
          padding: '0 10px 0 6px',
          borderRadius: 12,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 999,
            display: 'grid',
            placeItems: 'center',
            background: 'var(--primary)',
            color: '#fff',
            fontSize: 11.5,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {initials}
        </span>
        <span style={{ display: 'grid', textAlign: 'left', lineHeight: 1.25 }}>
          <span style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)', fontSize: 13, fontWeight: 700 }}>
            {fullName}
          </span>
          <span style={{ color: 'var(--muted)', fontSize: 11 }}>{roleLabel(role)}</span>
        </span>
        <ChevronDown size={15} style={{ color: 'var(--text-faint)', transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 180ms ease' }} />
      </button>

      {open && (
        <div
          className="card"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 220,
            zIndex: 40,
            padding: 8,
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid var(--row-line)', marginBottom: 6 }}>
            <div style={{ color: 'var(--text)', fontSize: 13.5, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {fullName}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 12 }}>{roleLabel(role)}</div>
          </div>

          {canViewProfile && (
            <Link
              to={`/users/${userId}`}
              onClick={() => setOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', borderRadius: 10, color: 'var(--text-mid)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
              onMouseEnter={event => { event.currentTarget.style.background = 'var(--thead-bg)' }}
              onMouseLeave={event => { event.currentTarget.style.background = 'transparent' }}
            >
              <UserRound size={15} />
              Profile
            </Link>
          )}

          <button
            type="button"
            onClick={() => { setOpen(false); onLogout() }}
            style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 9, padding: '9px 10px', border: 'none', borderRadius: 10, background: 'transparent', color: 'var(--danger)', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
            onMouseEnter={event => { event.currentTarget.style.background = 'var(--danger-bg)' }}
            onMouseLeave={event => { event.currentTarget.style.background = 'transparent' }}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
