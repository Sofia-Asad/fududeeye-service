import { useEffect, useState } from 'react'
import { Filter, ShieldCheck, UserCog, UsersRound } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import { listUsers } from '@/api/accounts'
import { useAuth } from '@/auth/AuthContext'
import DataTable, { type Column } from '@/components/DataTable'
import DirectoryCard, { DirectorySelect, DirectorySkeleton, DirectoryToolbar, SearchBox } from '@/components/DirectoryCard'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import PaginationFooter from '@/components/PaginationFooter'
import PermissionGate from '@/components/PermissionGate'
import StatusBadge from '@/components/StatusBadge'
import SummaryCard from '@/components/SummaryCard'
import type { Role, User } from '@/types/auth'

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  SALES: 'Sales',
}

const ROLE_STYLES: Record<Role, { bg: string; fg: string }> = {
  ADMIN: { bg: 'var(--warning-bg)', fg: 'var(--warning)' },
  MANAGER: { bg: 'var(--info-bg)', fg: 'var(--info)' },
  SALES: { bg: 'var(--neutral-bg)', fg: 'var(--neutral)' },
}

const adminUsersUrl = `${new URL(import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1').origin}/admin/accounts/user/`

function errorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    if (status === 403) return 'You do not have permission to do that.'
    if (status === 401) return 'Please sign in again.'
    return status ? `Request failed (${status}).` : 'Request failed.'
  }
  return 'Request failed.'
}

function fullName(user: User) {
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

function RoleBadge({ role }: { role: Role }) {
  const style = ROLE_STYLES[role]
  return (
    <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 11px', borderRadius: 999, background: style.bg, color: style.fg }}>
      {ROLE_LABELS[role]}
    </span>
  )
}

export default function Users() {
  const { user: currentUser } = useAuth()
  const [search, setSearch] = useState('')
  const [ordering, setOrdering] = useState('username')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [search, ordering])

  const users = useQuery({
    queryKey: ['users', search, ordering, currentPage],
    queryFn: () => listUsers({
      search: search.trim() || undefined,
      ordering,
      page: currentPage,
    }),
    enabled: !!currentUser?.is_admin,
  })

  const rows = users.data?.results ?? []
  const stats = {
    active: rows.filter(user => user.is_active_staff).length,
    admins: rows.filter(user => user.role === 'ADMIN').length,
    managers: rows.filter(user => user.role === 'MANAGER').length,
    sales: rows.filter(user => user.role === 'SALES').length,
  }

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Name',
      render: user => {
        const name = fullName(user)
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 999, background: user.role === 'ADMIN' ? 'var(--warning-bg)' : 'var(--primary-soft)', color: user.role === 'ADMIN' ? 'var(--warning)' : 'var(--primary-hover)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
              {initials(name)}
            </div>
            <div>
              <div style={{ color: 'var(--text)', fontSize: 13.5, fontWeight: 700 }}>{name}</div>
              <div style={{ color: 'var(--muted)', fontSize: 12 }}>@{user.username}</div>
            </div>
          </div>
        )
      },
    },
    { key: 'role', header: 'Role', render: user => <RoleBadge role={user.role} /> },
    { key: 'phone', header: 'Phone', render: user => user.phone || '-' },
    { key: 'email', header: 'Email', render: user => user.email || '-' },
    { key: 'status', header: 'Status', render: user => <StatusBadge status={user.is_active_staff ? 'ACTIVE' : 'INACTIVE'} /> },
    {
      key: 'capabilities',
      header: 'Capabilities',
      render: user => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {user.can_view_finance && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: 'var(--primary-soft)', color: 'var(--primary-hover)' }}>Finance</span>}
          {user.can_delete && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: 'var(--danger-bg)', color: 'var(--danger)' }}>Delete</span>}
          {!user.can_view_finance && !user.can_delete && <span style={{ color: 'var(--muted)' }}>-</span>}
        </div>
      ),
    },
  ]

  return (
    <Layout>
      <PermissionGate minRole="ADMIN" fallback={
        <div className="app-page">
          <div className="card" style={{ padding: 22, color: 'var(--muted)' }}>Your role cannot view users.</div>
        </div>
      }>
        <div className="app-page">
          <PageHeader
            eyebrow="Insights"
            title="Users"
            subtitle="Read-only staff directory; manage accounts in Django admin."
            actions={(
              <a href={adminUsersUrl} className="secondary-button">
                <ShieldCheck size={16} />
                Django admin
              </a>
            )}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 16 }}>
            <SummaryCard label="Active on page" value={stats.active} caption="Enabled staff accounts" icon={<UsersRound size={18} />} />
            <SummaryCard label="Admins" value={stats.admins} caption="On current page" icon={<ShieldCheck size={18} />} tone="amber" />
            <SummaryCard label="Managers" value={stats.managers} caption="On current page" icon={<UserCog size={18} />} tone="blue" />
            <SummaryCard label="Sales" value={stats.sales} caption="On current page" icon={<UsersRound size={18} />} tone="neutral" />
          </div>

          <DirectoryCard
            title="User directory"
            count={users.data ? `${users.data.count} staff accounts` : 'Loading records'}
            toolbar={(
              <DirectoryToolbar>
                <SearchBox value={search} onChange={setSearch} placeholder="Search users" />
                <DirectorySelect value={ordering} onChange={setOrdering} ariaLabel="Ordering">
                  <option value="username">Username A-Z</option>
                  <option value="-username">Username Z-A</option>
                  <option value="role">Role A-Z</option>
                  <option value="-role">Role Z-A</option>
                </DirectorySelect>
                <button type="button" className="primary-button" onClick={() => setCurrentPage(1)}>
                  <Filter size={16} />
                  Filter
                </button>
              </DirectoryToolbar>
            )}
            footer={users.data && (
              <PaginationFooter
                page={currentPage}
                total={users.data.count}
                hasPrevious={!!users.data.previous}
                hasNext={!!users.data.next}
                onPrevious={() => setCurrentPage(page => Math.max(1, page - 1))}
                onNext={() => setCurrentPage(page => page + 1)}
              />
            )}
          >
            {users.isLoading && <DirectorySkeleton />}
            {users.isError && <div className="error-banner" style={{ margin: '0 18px 18px' }}>{errorMessage(users.error)}</div>}
            {users.data && <DataTable columns={columns} rows={rows} empty="No users match the current filters." variant="bare" />}
          </DirectoryCard>
        </div>
      </PermissionGate>
    </Layout>
  )
}
