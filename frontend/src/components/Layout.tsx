import { Link, useLocation, useMatch } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Bell,
  ChartLine,
  ClipboardList,
  CreditCard,
  HandCoins,
  Home,
  LayoutDashboard,
  LogOut,
  MessageCircleQuestion,
  MessageSquareWarning,
  MoreHorizontal,
  Package,
  ShieldCheck,
  ShoppingCart,
  Store,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'

import { listInquiries } from '@/api/inquiries'
import { listComplaints, listDemands } from '@/api/service'
import { useAuth } from '@/auth/AuthContext'
import type { Role } from '@/types/auth'

interface NavItem {
  to: string
  end?: boolean
  label: string
  icon: LucideIcon
  badge?: string | number
  badgeTone?: 'primary' | 'danger'
  adminOnly?: boolean
}

interface NavGroup {
  label: string
  items: NavItem[]
  hiddenFor?: Role[]
}

function roleLabel(role?: Role) {
  if (!role) return 'Staff'
  return role.toLowerCase().replace(/^\w/, char => char.toUpperCase())
}

function initialsFor(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

function SidebarLink({ item }: { item: NavItem }) {
  const match = useMatch({ path: item.to, end: item.end ?? item.to === '/' })
  const active = !!match
  const Icon = item.icon
  const badgeColor = item.badgeTone === 'danger'
    ? { bg: 'var(--danger-bg)', fg: 'var(--danger)' }
    : { bg: 'var(--primary-soft)', fg: 'var(--primary-hover)' }

  return (
    <Link
      to={item.to}
      style={{
        display: 'flex',
        minHeight: 38,
        alignItems: 'center',
        gap: 11,
        padding: '8px 10px',
        borderRadius: 10,
        color: active ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
        background: active ? 'var(--sidebar-active-bg)' : 'transparent',
        textDecoration: 'none',
        fontSize: 14,
        fontWeight: active ? 700 : 500,
      }}
      onMouseEnter={event => {
        if (!active) event.currentTarget.style.background = '#f0eee3'
      }}
      onMouseLeave={event => {
        if (!active) event.currentTarget.style.background = 'transparent'
      }}
    >
      <Icon size={17} strokeWidth={2} style={{ color: active ? 'var(--sidebar-active-text)' : 'var(--muted)', flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.badge !== undefined && (
        <span
          style={{
            minWidth: 22,
            height: 21,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 999,
            padding: '0 7px',
            background: badgeColor.bg,
            color: badgeColor.fg,
            fontSize: 11.5,
            fontWeight: 700,
          }}
        >
          {item.badge}
        </span>
      )}
    </Link>
  )
}

function MobileTab({ to, label, icon: Icon, moreActive = false }: NavItem & { moreActive?: boolean }) {
  const match = useMatch({ path: to, end: to === '/' })
  const active = !!match || moreActive
  return (
    <Link
      to={to}
      style={{
        display: 'grid',
        placeItems: 'center',
        gap: 3,
        minHeight: 48,
        borderRadius: 14,
        color: active ? 'var(--primary-hover)' : 'var(--muted)',
        background: active ? 'var(--primary-soft)' : 'transparent',
        textDecoration: 'none',
        fontSize: 11,
        fontWeight: active ? 700 : 600,
      }}
    >
      <Icon size={18} strokeWidth={2.1} />
      <span>{label}</span>
    </Link>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username || 'User'
  const initials = initialsFor(fullName)

  const demandCount = useQuery({
    queryKey: ['layout-open-demands-count'],
    queryFn: () => listDemands({ status: 'OPEN', page: 1 }),
    enabled: !!user,
    staleTime: 60_000,
  })
  const complaintCount = useQuery({
    queryKey: ['layout-open-complaints-count'],
    queryFn: () => listComplaints({ status: 'OPEN', page: 1 }),
    enabled: !!user,
    staleTime: 60_000,
  })
  const inquiryCount = useQuery({
    queryKey: ['layout-new-inquiries-count'],
    queryFn: () => listInquiries({ status: 'NEW', page: 1 }),
    enabled: !!user,
    staleTime: 60_000,
  })

  const groups: NavGroup[] = [
    {
      label: 'Overview',
      items: [{ to: '/', end: true, label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      label: 'Manage',
      items: [
        { to: '/customers', label: 'Customers', icon: Users },
        { to: '/items', label: 'Items', icon: Package },
        { to: '/sales', label: 'Sales', icon: ShoppingCart },
        {
          to: '/demands',
          label: 'Demands',
          icon: ClipboardList,
          badge: demandCount.data?.count,
          badgeTone: 'primary',
        },
        {
          to: '/complaints',
          label: 'Complaints',
          icon: MessageSquareWarning,
          badge: complaintCount.data?.count,
          badgeTone: 'danger',
        },
        {
          to: '/inquiries',
          label: 'Inquiries',
          icon: MessageCircleQuestion,
          badge: inquiryCount.data?.count,
          badgeTone: 'primary',
        },
      ],
    },
    {
      label: 'Money',
      hiddenFor: ['SALES'],
      items: [
        { to: '/expenses', label: 'Expenses', icon: CreditCard },
        { to: '/sales/payouts', label: 'Payouts', icon: HandCoins },
      ],
    },
    {
      label: 'Insights',
      hiddenFor: ['SALES'],
      items: [
        { to: '/reports', label: 'Reports', icon: ChartLine },
        { to: '/audit', label: 'Audit log', icon: ShieldCheck },
        { to: '/users', label: 'Users', icon: UserCog, adminOnly: true },
      ],
    },
  ]

  const visibleGroups = groups
    .map(group => ({
      ...group,
      items: group.items.filter(item => !item.adminOnly || user?.role === 'ADMIN'),
    }))
    .filter(group => group.items.length > 0 && !group.hiddenFor?.includes(user?.role ?? 'SALES'))

  const moreActive = !['/', '/items', '/sales', '/customers'].some(path => (
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  ))

  return (
    <div className="app-shell">
      <div className="mobile-topbar">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text)', textDecoration: 'none' }}>
          <span style={{ width: 36, height: 36, borderRadius: 11, display: 'grid', placeItems: 'center', background: 'var(--primary)', color: '#fff' }}>
            <Store size={18} />
          </span>
          <span>
            <span style={{ display: 'block', fontSize: 16, fontWeight: 700, lineHeight: 1.05 }}>Fududeeye</span>
            <span style={{ display: 'block', marginTop: 2, color: 'var(--muted)', fontSize: 9.5, fontWeight: 700, letterSpacing: '.14em' }}>CRM</span>
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <button
            type="button"
            aria-label="Notifications"
            style={{ position: 'relative', width: 38, height: 38, borderRadius: 12, border: '1px solid var(--border)', background: '#fff', color: 'var(--muted)', display: 'grid', placeItems: 'center' }}
          >
            <Bell size={17} />
            <span style={{ position: 'absolute', top: 9, right: 10, width: 7, height: 7, borderRadius: 999, background: 'var(--accent)' }} />
          </button>
          <button
            type="button"
            onClick={() => { void logout() }}
            aria-label="Log out"
            style={{ width: 38, height: 38, border: 'none', borderRadius: 999, background: 'var(--primary)', color: '#fff', fontWeight: 700 }}
          >
            {initials}
          </button>
        </div>
      </div>

      <aside className="desktop-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '20px 18px 18px' }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, display: 'grid', placeItems: 'center', background: 'var(--primary)', color: '#fff', flexShrink: 0 }}>
            <Store size={19} />
          </div>
          <div>
            <div style={{ color: 'var(--text)', fontSize: 17, fontWeight: 700, lineHeight: 1.08 }}>Fududeeye</div>
            <div style={{ marginTop: 3, color: 'var(--muted)', fontSize: 10, fontWeight: 700, letterSpacing: '.16em' }}>BROKERAGE CRM</div>
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'space-between', minHeight: 0, padding: '0 12px 14px' }}>
          <nav style={{ display: 'grid', gap: 22, overflowY: 'auto', paddingRight: 2 }}>
            {visibleGroups.map(group => (
              <div key={group.label}>
                <div style={{ margin: '0 8px 8px', color: 'var(--muted)', fontSize: 10.5, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase' }}>
                  {group.label}
                </div>
                <div style={{ display: 'grid', gap: 3 }}>
                  {group.items.map(item => <SidebarLink key={item.to} item={item} />)}
                </div>
              </div>
            ))}
          </nav>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 16, padding: 10, borderRadius: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 999, display: 'grid', placeItems: 'center', background: 'var(--primary)', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)', fontSize: 13.5, fontWeight: 700 }}>
                {fullName}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 11.5, fontWeight: 500 }}>{roleLabel(user?.role)}</div>
            </div>
            <button
              type="button"
              onClick={() => { void logout() }}
              aria-label="Log out"
              style={{ width: 32, height: 32, border: '1px solid var(--border)', borderRadius: 10, background: '#fff', color: 'var(--muted)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="app-main">{children}</main>

      <nav className="mobile-tabbar" aria-label="Primary navigation">
        <MobileTab to="/" end label="Home" icon={Home} />
        <MobileTab to="/items" label="Items" icon={Package} />
        <MobileTab to="/sales" label="Sales" icon={ShoppingCart} />
        <MobileTab to="/customers" label="Customers" icon={Users} />
        <MobileTab to="/demands" label="More" icon={MoreHorizontal} moreActive={moreActive} />
      </nav>
    </div>
  )
}
