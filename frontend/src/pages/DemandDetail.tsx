import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, ClipboardList, PackageCheck, Save, Target } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import { getDemand, listSuggestedMatches, updateDemand } from '@/api/service'
import ActivityFeed from '@/components/ActivityFeed'
import DataTable, { type Column } from '@/components/DataTable'
import DetailMeta from '@/components/DetailMeta'
import DirectoryCard, { DirectorySkeleton } from '@/components/DirectoryCard'
import Layout from '@/components/Layout'
import MoneyDisplay from '@/components/MoneyDisplay'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import SummaryCard from '@/components/SummaryCard'
import { DEMAND_STATUS_LABELS, DEMAND_STATUSES, formatDate } from '@/lib/service'
import type { Item } from '@/types/inventory'
import type { DemandStatus } from '@/types/service'

function errorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    if (status === 403) return 'You do not have permission to do that.'
    if (status === 401) return 'Please sign in again.'
    return status ? `Request failed (${status}).` : 'Request failed.'
  }
  return 'Request failed.'
}

function targetPrice(min: string | null, max: string | null) {
  if (min && max) {
    return (
      <>
        <MoneyDisplay value={min} /> - <MoneyDisplay value={max} />
      </>
    )
  }
  if (min) return <MoneyDisplay value={min} />
  if (max) return <MoneyDisplay value={max} />
  return '-'
}

export default function DemandDetail() {
  const { id } = useParams()
  const demandId = Number(id)
  const validDemandId = Number.isFinite(demandId) && demandId > 0
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<DemandStatus>('OPEN')
  const [notes, setNotes] = useState('')

  const demand = useQuery({
    queryKey: ['demand', demandId],
    queryFn: () => getDemand(demandId),
    enabled: validDemandId,
  })

  const matches = useQuery({
    queryKey: ['demand-matches', demandId],
    queryFn: () => listSuggestedMatches(demandId),
    enabled: validDemandId,
  })

  const save = useMutation({
    mutationFn: () => updateDemand(demandId, { status, notes }),
    onSuccess: updated => {
      queryClient.setQueryData(['demand', demandId], updated)
      setStatus(updated.status)
      setNotes(updated.notes)
      void queryClient.invalidateQueries({ queryKey: ['demands'] })
    },
  })

  const matchItem = useMutation({
    mutationFn: (itemId: number) => updateDemand(demandId, {
      matched_item: itemId,
      status: 'MATCHED',
    }),
    onSuccess: updated => {
      queryClient.setQueryData(['demand', demandId], updated)
      setStatus(updated.status)
      setNotes(updated.notes)
      void queryClient.invalidateQueries({ queryKey: ['demands'] })
    },
  })

  useEffect(() => {
    if (!demand.data) return
    setStatus(demand.data.status)
    setNotes(demand.data.notes)
  }, [demand.data])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    save.mutate()
  }

  const matchColumns: Column<Item>[] = [
    {
      key: 'title',
      header: 'Item',
      render: item => (
        <Link to={`/items/${item.id}`} style={{ display: 'flex', alignItems: 'center', gap: 11, color: 'var(--text)', textDecoration: 'none' }}>
          <span style={{ width: 38, height: 38, borderRadius: 999, display: 'grid', placeItems: 'center', background: 'var(--primary-soft)', color: 'var(--primary-hover)' }}>
            <PackageCheck size={16} />
          </span>
          <span>
            <strong style={{ display: 'block', fontWeight: 700 }}>{item.title}</strong>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>{item.category_name || 'Inventory'}</span>
          </span>
        </Link>
      ),
    },
    { key: 'listed_price', header: 'Listed', align: 'right', render: item => <MoneyDisplay value={item.listed_price} /> },
    { key: 'quantity', header: 'Available', align: 'right', render: item => item.quantity_available },
    { key: 'status', header: 'Status', render: item => <StatusBadge status={item.status} /> },
    {
      key: 'action',
      header: '',
      align: 'right',
      render: item => (
        <button
          type="button"
          onClick={() => matchItem.mutate(item.id)}
          disabled={matchItem.isPending}
          className="primary-button"
          style={{ height: 34, padding: '0 11px', fontSize: 12.5, opacity: matchItem.isPending ? .7 : 1 }}
        >
          <CheckCircle2 size={14} />
          Match
        </button>
      ),
    },
  ]

  if (!validDemandId) {
    return <Layout><div className="app-page"><div className="error-banner">Demand not found.</div></div></Layout>
  }

  if (demand.isLoading) {
    return (
      <Layout>
        <div className="app-page">
          <section className="card" style={{ padding: 22, display: 'grid', gap: 14 }}>
            <span className="skeleton-row" style={{ width: '42%' }} />
            <span className="skeleton-row" style={{ width: '72%' }} />
          </section>
        </div>
      </Layout>
    )
  }

  if (demand.isError || !demand.data) {
    return <Layout><div className="app-page"><div className="error-banner">{errorMessage(demand.error)}</div></div></Layout>
  }

  const current = demand.data
  const matchRows = matches.data ?? []

  return (
    <Layout>
      <div className="app-page">
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <Link to="/demands" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--primary-hover)', fontSize: 13, fontWeight: 700, textDecoration: 'none', marginBottom: 14 }}>
            <ArrowLeft size={16} />
            Demands
          </Link>

          <PageHeader
            eyebrow="Demand detail"
            title={current.title}
            subtitle={`${current.customer_name} · ${current.category_name || 'Any category'} · created ${formatDate(current.created_at)}`}
            actions={<StatusBadge status={current.status} />}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 16 }}>
            <SummaryCard label="Target price" value={targetPrice(current.target_price_min, current.target_price_max)} caption="Customer budget" icon={<Target size={18} />} tone="amber" />
            <SummaryCard label="Matches found" value={matchRows.length} caption="Suggested active items" icon={<PackageCheck size={18} />} tone="blue" />
            <SummaryCard label="Category" value={current.category_name || 'Any'} caption="Requested type" icon={<ClipboardList size={18} />} tone="neutral" />
            <SummaryCard label="Status" value={DEMAND_STATUS_LABELS[current.status]} caption="Current workflow state" icon={<ClipboardList size={18} />} />
          </div>

          <div className="content-sidebar-grid">
            <div style={{ display: 'grid', gap: 16 }}>
              <DetailMeta
                title="Demand details"
                rows={[
                  { label: 'Customer', value: <Link to={`/customers/${current.customer}`} style={{ color: 'var(--primary-hover)' }}>{current.customer_name}</Link> },
                  { label: 'Category', value: current.category_name || '-' },
                  { label: 'Matched item', value: current.matched_item ? <Link to={`/items/${current.matched_item}`} style={{ color: 'var(--primary-hover)' }}>{current.matched_item_title}</Link> : '-' },
                  { label: 'Updated', value: formatDate(current.updated_at) },
                  { label: 'Description', value: current.description || '-' },
                ]}
              />

              <DirectoryCard title="Suggested matches" count={`${matchRows.length} active item matches`}>
                {matches.isLoading && <DirectorySkeleton rows={4} />}
                {matches.isError && <div className="error-banner" style={{ margin: '0 18px 18px' }}>{errorMessage(matches.error)}</div>}
                {matches.data && <DataTable variant="bare" columns={matchColumns} rows={matchRows} empty="No matching active items found." />}
              </DirectoryCard>
            </div>

            <aside style={{ display: 'grid', gap: 16 }}>
              <section className="card" style={{ padding: 20 }}>
                <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700 }}>Workflow</h2>
                <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
                  <label className="field-label">
                    <span className="field-title">Status</span>
                    <select className="control" value={status} onChange={event => setStatus(event.target.value as DemandStatus)}>
                      {DEMAND_STATUSES.map(nextStatus => (
                        <option key={nextStatus} value={nextStatus}>{DEMAND_STATUS_LABELS[nextStatus]}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field-label">
                    <span className="field-title">Notes</span>
                    <textarea className="control" value={notes} onChange={event => setNotes(event.target.value)} rows={5} />
                  </label>
                  {(save.isError || matchItem.isError) && <div className="error-banner">{errorMessage(save.error ?? matchItem.error)}</div>}
                  <button type="submit" disabled={save.isPending} className="primary-button" style={{ opacity: save.isPending ? .7 : 1 }}>
                    <Save size={16} />
                    {save.isPending ? 'Saving...' : 'Save workflow'}
                  </button>
                </form>
              </section>

              <ActivityFeed
                items={[
                  { title: 'Demand opened', caption: `${current.customer_name} · ${formatDate(current.created_at)}`, icon: <ClipboardList size={15} />, tone: 'amber' },
                  { title: current.matched_item ? 'Item matched' : 'Waiting for a match', caption: current.matched_item_title || 'Use suggested matches when inventory is ready', icon: <PackageCheck size={15} />, tone: current.matched_item ? 'primary' : 'neutral' },
                  { title: 'Last updated', caption: formatDate(current.updated_at), icon: <Save size={15} />, tone: 'blue' },
                ]}
              />
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  )
}
