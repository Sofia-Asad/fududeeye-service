import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertTriangle, MessageSquareWarning, PlusCircle, Save, ShieldAlert, ArrowLeft } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getComplaint, getComplaintHistory, updateComplaint } from '@/api/service'
import ActivityFeed, { type ActivityFeedItem } from '@/components/ActivityFeed'
import DetailMeta from '@/components/DetailMeta'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import { SkeletonLines } from '@/components/Skeleton'
import StatusBadge from '@/components/StatusBadge'
import SummaryCard from '@/components/SummaryCard'
import { changeLabel, formatDateTime } from '@/lib/auditLog'
import { errorMessage } from '@/lib/errors'
import {
  COMPLAINT_PRIORITIES,
  COMPLAINT_PRIORITY_LABELS,
  COMPLAINT_STATUSES,
  COMPLAINT_STATUS_LABELS,
  formatDate,
} from '@/lib/service'
import { notifyError, notifySuccess } from '@/lib/toast'
import type { AuditLogRow } from '@/types/reports'
import type { Complaint, ComplaintPriority, ComplaintStatus } from '@/types/service'

const COMPLAINT_FIELD_LABELS: Record<string, string> = {
  status: 'Status',
  priority: 'Priority',
  assigned_to: 'Assignee',
  resolution_notes: 'Resolution notes',
  resolved_at: 'Resolved at',
}

function buildTimeline(current: Complaint, logs: AuditLogRow[]): ActivityFeedItem[] {
  const items: ActivityFeedItem[] = [
    {
      title: 'Complaint opened',
      caption: `${current.customer_name} - ${formatDate(current.created_at)}`,
      icon: <MessageSquareWarning size={15} />,
      tone: 'red',
    },
  ]

  logs.forEach(log => {
    const fields = Object.keys(log.changes).filter(field => field in COMPLAINT_FIELD_LABELS)
    if (fields.length === 0) return
    fields.forEach(field => {
      const isStatus = field === 'status'
      const isPriority = field === 'priority'
      const valueLabels = isStatus ? COMPLAINT_STATUS_LABELS : isPriority ? COMPLAINT_PRIORITY_LABELS : {}
      items.push({
        title: `${COMPLAINT_FIELD_LABELS[field]} updated`,
        caption: `${changeLabel(field, log.changes[field], COMPLAINT_FIELD_LABELS, valueLabels)} - ${formatDateTime(log.timestamp)}${log.user ? ` - ${log.user}` : ''}`,
        icon: field === 'assigned_to' ? <AlertTriangle size={15} /> : field === 'resolution_notes' ? <Save size={15} /> : <ShieldAlert size={15} />,
        tone: isStatus ? 'primary' : isPriority ? 'amber' : 'blue',
      })
    })
  })

  return items
}

export default function ComplaintDetail() {
  const { id } = useParams()
  const complaintId = Number(id)
  const validComplaintId = Number.isFinite(complaintId) && complaintId > 0
  const queryClient = useQueryClient()
  const formRef = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState<ComplaintStatus>('OPEN')
  const [priority, setPriority] = useState<ComplaintPriority>('MEDIUM')
  const [resolutionNotes, setResolutionNotes] = useState('')

  const complaint = useQuery({
    queryKey: ['complaint', complaintId],
    queryFn: () => getComplaint(complaintId),
    enabled: validComplaintId,
  })

  const history = useQuery({
    queryKey: ['complaint-history', complaintId],
    queryFn: () => getComplaintHistory(complaintId),
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
      void queryClient.invalidateQueries({ queryKey: ['complaint-history', complaintId] })
      notifySuccess('Complaint updated')
    },
    onError: error => notifyError(errorMessage(error)),
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
          <SkeletonLines />
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
            subtitle={`${current.subject} - opened ${formatDate(current.created_at)}`}
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
                <form ref={formRef} onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
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

              {history.isLoading && <SkeletonLines widths={['50%', '70%']} />}
              {history.data && <ActivityFeed items={buildTimeline(current, history.data)} />}
              {history.isError && (
                <ActivityFeed items={[{ title: 'Complaint opened', caption: `${current.customer_name} - ${formatDate(current.created_at)}`, icon: <PlusCircle size={15} />, tone: 'red' }]} />
              )}
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  )
}
