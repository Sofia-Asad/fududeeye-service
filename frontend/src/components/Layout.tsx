import { Link, useMatch } from 'react-router-dom'
import type { ReactNode } from 'react'
import logo from '@/assets/fududeeye logo.jpeg'

function SidebarLink({ to, icon, label, end = true }: {
  to: string; icon: ReactNode; label: string; end?: boolean
}) {
  const match = useMatch({ path: to, end })
  const active = !!match
  return (
    <Link
      to={to}
      style={{
        display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px',
        borderRadius: 6, fontSize: 13.5, fontWeight: active ? 600 : 500,
        color: active ? '#ffffff' : 'var(--sidebar-text)',
        background: active ? 'var(--sidebar-active-bg)' : 'transparent',
        textDecoration: 'none', position: 'relative',
      }}
    >
      {active && <span style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: 3, background: 'var(--sidebar-accent)' }} />}
      {icon}
      <span>{label}</span>
    </Link>
  )
}

const navItems = [
  {
    to: '/', end: true, label: 'Dashboard',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>,
  },
  {
    to: '/customers', end: false, label: 'Customers',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    to: '/items', label: 'Items',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
  },
  {
    to: '/sales/new', end: false, label: 'Sales',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  },
  {
    to: '/demands', label: 'Demands',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>,
  },
  {
    to: '/complaints', label: 'Complaints',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v4"/><path d="M12 14h.01"/></svg>,
  },
  {
    to: '/expenses', label: 'Expenses',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
  },
  {
    to: '/payouts', label: 'Payouts',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>,
  },
  {
    to: '/reports', label: 'Reports',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>,
  },
  {
    to: '/audit', label: 'Audit log',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h5"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>,
  },
  {
    to: '/users', label: 'Users',
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z"/></svg>,
  },
]

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* SIDEBAR */}
      <aside style={{ width: 228, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--sidebar-bg)', borderRight: '1px solid rgba(255,255,255,.08)' }}>
        {/* LOGO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 20px 16px' }}>
          <img
            src={logo}
            alt="Fududeeye"
            style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'contain', background: '#ffffff', padding: 2, flexShrink: 0 }}
          />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: '-.01em', color: '#ffffff', lineHeight: 1.1 }}>Fududeeye</div>
            <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--sidebar-accent)', letterSpacing: '.06em', textTransform: 'uppercase' }}>Service</div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '6px 12px', flex: 1, overflowY: 'auto' }}>
          {navItems.map(item => (
            <SidebarLink key={item.to} to={item.to} end={item.end} icon={item.icon} label={item.label} />
          ))}
        </nav>

        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,.10)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#f9a800', color: '#1d3480', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 700, flexShrink: 0 }}>AA</div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#ffffff' }}>Axmed Aweys</span>
            <span style={{ fontSize: 11.5, color: 'var(--sidebar-muted)' }}>Owner</span>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* TOPBAR */}
        <header style={{ height: 60, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14, padding: '0 24px', background: 'var(--surface)', borderBottom: '1px solid var(--divider)' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              placeholder="Search customers, items, sales…"
              style={{ width: '100%', height: 38, padding: '0 12px 0 34px', border: '1px solid var(--divider)', borderRadius: 6, background: 'var(--surface-2)', fontSize: 13, color: 'var(--text)', fontFamily: 'inherit', outline: 'none' }}
            />
          </div>
          <div style={{ flex: 1 }} />
          <button style={{ display: 'flex', alignItems: 'center', gap: 7, height: 38, padding: '0 14px', border: 'none', borderRadius: 6, background: 'var(--accent)', color: 'var(--accent-fg)', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            New
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <button style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--divider)', borderRadius: 6, background: 'var(--surface)', color: 'var(--muted)', cursor: 'pointer', position: 'relative' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            <span style={{ position: 'absolute', top: 7, right: 8, width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)' }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 6, cursor: 'pointer' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f9a800', color: '#1d3480', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 700 }}>AA</div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </header>

        {/* CONTENT */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
