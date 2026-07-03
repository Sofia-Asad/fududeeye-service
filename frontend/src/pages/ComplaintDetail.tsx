import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, MessageSquareWarning, Save, ShieldAlert } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import { getComplaint, updateComplaint } from '@/api/service'
import ActivityFeed from '@/components/ActivityFeed'
import DetailMeta from '@/components/DetailMeta'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import SummaryCard from '@/components/SummaryCard'
import {
  COMPLAINT_PRIORITIES,
  COMPLAINT_PRIORITY_LABELS,
  COMPLAINT_STATUSES,
  COMPLAINT_STATUS_LABELS,
  formatDate,
} from '@/lib/service'
import type { ComplaintPriority, ComplaintStatus } from '@/types/service'

function errorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    if (status === 403) return 'You do not have permission to do that.'
    if (status === 401) return 'Please sign in again.'
    return status ? `Request failed (${status}).` : 'Request failed.'
  }
  return 'Request failed.'
}

export default function ComplaintDetail() {
  const { id } = useParams()
  const complaintId = Number(id)
  const validComplaintId = Number.isFinite(complaintId) && complaintId > 0
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<ComplaintStatus>('OPEN')
  const [priority, setPriority] = useState<ComplaintPriority>('MEDIUM')
  const [resolutionNotes, setResolutionNotes] = useState('')

  const complaint = useQuery({
    queryKey: ['complaint', complaintId],
    queryFn: () => getComplaint(complaintId),
    enabled: validComplaintId,
  })

  useEffect(() => {
    if (!complaint.data) return
    setStatus(complaint.data.status)
    setPriority(complaint.data.priority)
    setResolutionNotes(complaint.data.resolution_notes)
  }, [complaint.data])

  const save = useMutation({
    mutationFn: () => updateComplaint(complaintId, {
      status,
      priority,
      resolution_notes: resolutionNotes,
    }),
    onSuccess: updated => {
      queryClient.setQueryData(['complaint', complaintId], updated)
      void queryClient.invalidateQueries({ queryKey: ['complaints'] })
    },
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    save.mutate()
  }

  if (!validComplaintId) {
    return <Layout><div className="app-page"><div className="error-banner">Complaint not found.</div></div></Layout>
  }

  if (complaint.isLoading) {
    return (
      <Layout>
        <div className="app-page">
          <section className="card" style={{ padding: 22, display: 'grid', gap: 14 }}>
            <span className="skeleton-row" style={{ width: '36%' }} />
            <span className="skeleton-row" style={{ width: '68%' }} />
          </section>
        </div>
      </Layout>
    )
  }

  if (complaint.isError || !complaint.data) {
    return <Layout><div className="app-page"><div className="error-banner">{errorMessage(complaint.error)}</div></div></Layout>
  }

  const current = complaint.data

  return (
    <Layout>
      <div className="app-page">
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <Link to="/complaints" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--primary-hover)', fontSize: 13, fontWeight: 700, textDecoration: 'none', marginBottom: 14 }}>
            <ArrowLeft size={16} />
            Complaints
          </Link>

          <PageHeader
            eyebrow="Complaint detail"
            title={current.ticket_number}
            subtitle={`${current.subject} · opened ${formatDate(current.created_at)}`}
            actions={(
              <>
                <StatusBadge status={current.status} />
                <StatusBadge status={current.priority} />
              </>
            )}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 16 }}>
            <SummaryCard label="Status" value={COMPLAINT_STATUS_LABELS[current.status]} caption="Current workflow state" icon={<MessageSquareWarning size={18} />} />
            <SummaryCard label="Priority" value={COMPLAINT_PRIORITY_LABELS[current.priority]} caption="Support urgency" icon={<ShieldAlert size={18} />} tone={current.priority === 'HIGH' || current.priority === 'URGENT' ? 'red' : 'amber'} valueColor={current.priority === 'HIGH' || current.priority === 'URGENT' ? 'var(--money-owed)' : undefined} />
            <SummaryCard label="Assignee" value={current.assigned_to_name || '-'} caption="Responsible staff" icon={<AlertTriangle size={18} />} tone="blue" />
            <SummaryCard label="Resolved" value={current.resolved_at ? 'Yes' : 'No'} caption={current.resolved_at ? formatDate(current.resolved_at) : 'Still open'} icon={<MessageSquareWarning size={18} />} tone={current.resolved_at ? 'primary' : 'neutral'} />
          </div>

          <div className="content-sidebar-grid">
            <DetailMeta
              title="Ticket details"
              rows={[
                { label: 'Customer', value: <Link to={`/customers/${current.customer}`} style={{ color: 'var(--primary-hover)' }}>{current.customer_name}</Link> },
                { label: 'Related sale', value: current.related_sale ? <Link to={`/sales/${current.related_sale}`} style={{ color: 'var(--primary-hover)' }}>{current.related_sale_label}</Link> : '-' },
                { label: 'Related item', value: current.related_sale_item_title || '-' },
                { label: 'Assigned to', value: current.assigned_to_name || '-' },
                { label: 'Updated', value: formatDate(current.updated_at) },
                { label: 'Description', value: current.description },
                { label: 'Resolution', value: current.resolution_notes || '-' },
              ]}
            />

            <aside style={{ display: 'grid', gap: 16 }}>
              <section className="card" style={{ padding: 20 }}>
                <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700 }}>Workflow</h2>
                <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
                  <label className="field-label">
                    <span className="field-title">Status</span>
                    <select className="control" value={status} onChange={event => setStatus(event.target.value as ComplaintStatus)}>
                      {COMPLAINT_STATUSES.map(nextStatus => (
                        <option key={nextStatus} value={nextStatus}>{COMPLAINT_STATUS_LABELS[nextStatus]}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field-label">
                    <span className="field-title">Priority</span>
                    <select className="control" value={priority} onChange={event => setPriority(event.target.value as ComplaintPriority)}>
                      {COMPLAINT_PRIORITIES.map(nextPriority => (
                        <option key={nextPriority} value={nextPriority}>{COMPLAINT_PRIORITY_LABELS[nextPriority]}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field-label">
                    <span className="field-title">Resolution notes</span>
                    <textarea className="control" value={resolutionNotes} onChange={event => setResolutionNotes(event.target.value)} rows={6} />
                  </label>
                  {save.isError && <div className="error-banner">{errorMessage(save.error)}</div>}
                  <button type="submit" disabled={save.isPending} className="primary-button" style={{ opacity: save.isPending ? .7 : 1 }}>
                    <Save size={16} />
                    {save.isPending ? 'Saving...' : 'Save workflow'}
                  </button>
                </form>
              </section>

              <ActivityFeed
                items={[
                  { title: 'Complaint opened', caption: `${current.customer_name} · ${formatDate(current.created_at)}`, icon: <MessageSquareWarning size={15} />, tone: 'red' },
                  { title: current.assigned_to_name ? 'Assigned' : 'Unassigned', caption: current.assigned_to_name || 'No staff member assigned', icon: <AlertTriangle size={15} />, tone: current.assigned_to_name ? 'blue' : 'neutral' },
                  { title: current.resolved_at ? 'Resolved' : 'Awaiting resolution', caption: current.resolved_at ? formatDate(current.resolved_at) : 'Resolution notes will appear here', icon: <Save size={15} />, tone: current.resolved_at ? 'primary' : 'amber' },
                ]}
              />
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  )
}
