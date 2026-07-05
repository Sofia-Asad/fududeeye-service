import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, RotateCcw, ShieldCheck, UserCheck } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { listUsers } from '@/api/accounts'
import { getAuditLogReport } from '@/api/reports'
import { useAuth } from '@/auth/AuthContext'
import DataTable, { type Column } from '@/components/DataTable'
import DirectoryCard, { DirectorySelect, DirectorySkeleton, DirectoryToolbar, SearchBox } from '@/components/DirectoryCard'
import EmptyState from '@/components/EmptyState'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import PermissionGate from '@/components/PermissionGate'
import SummaryCard from '@/components/SummaryCard'
import { changesSummary, formatDateTime } from '@/lib/auditLog'
import { errorMessage } from '@/lib/errors'
import type { AuditAction, AuditLogRow } from '@/types/reports'

const ACTIONS: AuditAction[] = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'CUSTOM']

const ACTION_LABELS: Record<AuditAction, string> = {
  CREATE: 'Create',
  UPDATE: 'Update',
  DELETE: 'Delete',
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  CUSTOM: 'Custom',
}

const ACTION_STYLES: Record<AuditAction, { bg: string; fg: string }> = {
  CREATE: { bg: 'var(--success-bg)', fg: 'var(--success)' },
  UPDATE: { bg: 'var(--info-bg)', fg: 'var(--info)' },
  DELETE: { bg: 'var(--danger-bg)', fg: 'var(--danger)' },
  LOGIN: { bg: 'var(--warning-bg)', fg: 'var(--warning)' },
  LOGOUT: { bg: 'var(--neutral-bg)', fg: 'var(--neutral)' },
  CUSTOM: { bg: 'var(--warning-bg)', fg: 'var(--warning)' },
}

type ActionFilter = 'all' | AuditAction

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function weekStartISO() {
  const date = new Date()
  date.setDate(date.getDate() - 6)
  return date.toISOString().slice(0, 10)
}

function ActionBadge({ action }: { action: AuditAction }) {
  const style = ACTION_STYLES[action]
  return (
    <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 11px', borderRadius: 999, background: style.bg, color: style.fg }}>
      {ACTION_LABELS[action]}
    </span>
  )
}

const EARLIEST_DATE = '2000-01-01'

export default function AuditLog() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const initialObjectId = searchParams.get('object_id')
  const [modelFilter, setModelFilter] = useState(searchParams.get('model') ?? '')
  const [objectIdFilter, setObjectIdFilter] = useState(initialObjectId)
  const [action, setAction] = useState<ActionFilter>('all')
  // A record-history deep-link should show that record's full history, not just the last week.
  const [startDate, setStartDate] = useState(initialObjectId ? EARLIEST_DATE : weekStartISO())
  const [endDate, setEndDate] = useState(todayISO())
  const [userFilter, setUserFilter] = useState<number | null>(null)
  const enabled = !!user?.can_view_finance

  const users = useQuery({
    queryKey: ['users', 'audit-filter'],
    queryFn: () => listUsers({ ordering: 'username' }),
    enabled: !!user?.is_admin,
  })

  const audit = useQuery({
    queryKey: ['audit-log', modelFilter, objectIdFilter, action, startDate, endDate, userFilter],
    queryFn: () => getAuditLogReport({
      model: modelFilter.trim() || undefined,
      object_id: objectIdFilter ?? undefined,
      action: action === 'all' ? undefined : action,
      start: startDate || undefined,
      end: endDate || undefined,
      user: user?.is_admin ? userFilter ?? undefined : undefined,
    }),
    enabled,
  })

  const rows = audit.data?.results ?? []
  const createCount = rows.filter(row => row.action === 'CREATE').length
  const updateCount = rows.filter(row => row.action === 'UPDATE').length
  const authCount = rows.filter(row => row.action === 'LOGIN' || row.action === 'LOGOUT').length

  const columns: Column<AuditLogRow>[] = [
    {
      key: 'timestamp',
      header: 'Event',
      render: row => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <span style={{ width: 38, height: 38, borderRadius: 999, display: 'grid', placeItems: 'center', background: 'var(--primary-soft)', color: 'var(--primary-hover)' }}>
            <ShieldCheck size={16} />
          </span>
          <span>
            <strong style={{ display: 'block', color: 'var(--text)', fontWeight: 700 }}>{formatDateTime(row.timestamp)}</strong>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>{row.user || 'System'}</span>
          </span>
        </div>
      ),
    },
    { key: 'action', header: 'Action', render: row => <ActionBadge action={row.action} /> },
    { key: 'model_name', header: 'Model', render: row => <strong style={{ color: 'var(--text)' }}>{row.model_name}</strong> },
    {
      key: 'object',
      header: 'Object',
      render: row => (
        <div>
          <div style={{ fontWeight: 700 }}>{row.object_repr || '-'}</div>
          {row.object_id && <div style={{ color: 'var(--muted)', fontSize: 12 }}>ID {row.object_id}</div>}
        </div>
      ),
    },
    { key: 'changes', header: 'Changes', render: row => <span style={{ color: 'var(--muted)' }}>{changesSummary(row.changes)}</span> },
    { key: 'ip_address', header: 'IP', render: row => row.ip_address || '-' },
  ]

  return (
    <Layout>
      <PermissionGate minRole="MANAGER" fallback={
        <div className="app-page">
          <div className="card" style={{ padding: 22, color: 'var(--muted)' }}>Your role cannot view the audit log.</div>
        </div>
      }>
        <div className="app-page">
          <PageHeader
            eyebrow="Insights"
            title="Audit log"
            subtitle="Read-only timeline of staff actions and record changes."
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 16 }}>
            <SummaryCard label="Creates shown" value={createCount} caption="In current result set" icon={<ShieldCheck size={18} />} />
            <SummaryCard label="Updates shown" value={updateCount} caption="In current result set" icon={<ShieldCheck size={18} />} tone="blue" />
            <SummaryCard label="Auth events" value={authCount} caption="Login and logout events" icon={<UserCheck size={18} />} tone="amber" />
            <SummaryCard label="Total events" value={audit.data?.count ?? rows.length} caption="Filtered result count" icon={<ShieldCheck size={18} />} tone="neutral" />
          </div>

          <DirectoryCard
            title="Audit event directory"
            count={audit.data ? `${audit.data.count} events found` : 'Loading events'}
            toolbar={(
              <DirectoryToolbar>
                <SearchBox value={modelFilter} onChange={setModelFilter} placeholder="Exact model name" />
                <input className="control" type="date" value={startDate} onChange={event => setStartDate(event.target.value)} style={{ padding: '0 12px' }} />
                <input className="control" type="date" value={endDate} onChange={event => setEndDate(event.target.value)} style={{ padding: '0 12px' }} />
                <DirectorySelect value={action} onChange={value => setAction(value as ActionFilter)} ariaLabel="Audit action">
                  <option value="all">All actions</option>
                  {ACTIONS.map(nextAction => (
                    <option key={nextAction} value={nextAction}>{ACTION_LABELS[nextAction]}</option>
                  ))}
                </DirectorySelect>
                {user?.is_admin && (
                  <DirectorySelect value={userFilter ?? 'all'} onChange={value => setUserFilter(value === 'all' ? null : Number(value))} ariaLabel="Audit user">
                    <option value="all">All users</option>
                    {(users.data?.results ?? []).map(row => (
                      <option key={row.id} value={row.id}>{row.username}</option>
                    ))}
                  </DirectorySelect>
                )}
                <button type="button" className="primary-button" onClick={() => audit.refetch()}>
                  <Filter size={16} />
                  Filter
                </button>
                <button type="button" className="secondary-button" onClick={() => { setModelFilter(''); setObjectIdFilter(null); setAction('all'); setStartDate(weekStartISO()); setEndDate(todayISO()); setUserFilter(null) }}>
                  <RotateCcw size={16} />
                  Reset
                </button>
              </DirectoryToolbar>
            )}
          >
            {objectIdFilter && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 18px 14px', padding: '8px 12px', borderRadius: 10, background: 'var(--primary-soft)', color: 'var(--primary-hover)', fontSize: 12.5, fontWeight: 600 }}>
                Showing full history for {modelFilter || 'record'} #{objectIdFilter}
                <button
                  type="button"
                  onClick={() => { setObjectIdFilter(null); setStartDate(weekStartISO()) }}
                  style={{ marginLeft: 'auto', color: 'inherit', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                >
                  Clear
                </button>
              </div>
            )}
            {audit.isLoading && <DirectorySkeleton />}
            {audit.isError && <div className="error-banner" style={{ margin: '0 18px 18px' }}>{errorMessage(audit.error)}</div>}
            {audit.data && (
              <DataTable
                columns={columns}
                rows={rows}
                variant="bare"
                empty={<EmptyState icon={<ShieldCheck size={18} />} title="No audit events found." subtitle="No staff actions match the current filters." />}
              />
            )}
          </DirectoryCard>
        </div>
      </PermissionGate>
    </Layout>
  )
}
