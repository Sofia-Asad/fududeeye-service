import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, Filter, MessageSquareWarning, Plus, ShieldAlert, X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { z } from 'zod'

import { listCustomers } from '@/api/customers'
import { listSales } from '@/api/sales'
import { createComplaint, listComplaints } from '@/api/service'
import { useAuth } from '@/auth/AuthContext'
import DataTable, { type Column } from '@/components/DataTable'
import DirectoryCard, { DirectorySelect, DirectorySkeleton, DirectoryToolbar, SearchBox } from '@/components/DirectoryCard'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import PaginationFooter from '@/components/PaginationFooter'
import StatusBadge from '@/components/StatusBadge'
import SummaryCard from '@/components/SummaryCard'
import {
  COMPLAINT_PRIORITIES,
  COMPLAINT_PRIORITY_LABELS,
  COMPLAINT_STATUSES,
  COMPLAINT_STATUS_LABELS,
  formatDate,
} from '@/lib/service'
import type { Complaint, ComplaintPriority, ComplaintStatus } from '@/types/service'

type StatusFilter = 'all' | ComplaintStatus
type PriorityFilter = 'all' | ComplaintPriority

const complaintSchema = z.object({
  customer: z.string().trim().min(1, 'Customer is required.'),
  related_sale: z.string().trim(),
  subject: z.string().trim().min(1, 'Subject is required.'),
  description: z.string().trim().min(1, 'Description is required.'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
})

type ComplaintForm = z.infer<typeof complaintSchema>

const emptyForm: ComplaintForm = {
  customer: '',
  related_sale: '',
  subject: '',
  description: '',
  priority: 'MEDIUM',
}

function errorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    if (status === 403) return 'You do not have permission to do that.'
    if (status === 401) return 'Please sign in again.'
    return status ? `Request failed (${status}).` : 'Request failed.'
  }
  return 'Request failed.'
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="field-label" data-error={!!error}>
      <span className="field-title">{label}</span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}

export default function Complaints() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [priority, setPriority] = useState<PriorityFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<ComplaintForm>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setCurrentPage(1)
  }, [search, status, priority])

  const complaints = useQuery({
    queryKey: ['complaints', search, status, priority, currentPage],
    queryFn: () => listComplaints({
      search: search.trim() || undefined,
      status: status === 'all' ? undefined : status,
      priority: priority === 'all' ? undefined : priority,
      ordering: '-created_at',
      page: currentPage,
    }),
  })

  const customers = useQuery({
    queryKey: ['customers', 'complaint-picker'],
    queryFn: () => listCustomers({ is_active: true, ordering: 'full_name' }),
    enabled: modalOpen,
  })

  const sales = useQuery({
    queryKey: ['sales', 'complaint-related-picker'],
    queryFn: () => listSales({ ordering: '-sale_date' }),
    enabled: modalOpen,
  })

  const create = useMutation({
    mutationFn: createComplaint,
    onSuccess: complaint => {
      setModalOpen(false)
      setForm(emptyForm)
      setErrors({})
      void queryClient.invalidateQueries({ queryKey: ['complaints'] })
      navigate(`/complaints/${complaint.id}`)
    },
  })

  const rows = complaints.data?.results ?? []
  const activeOnPage = rows.filter(complaint => complaint.status === 'OPEN' || complaint.status === 'IN_PROGRESS').length
  const highOnPage = rows.filter(complaint => complaint.priority === 'HIGH' || complaint.priority === 'URGENT').length
  const resolvedOnPage = rows.filter(complaint => complaint.status === 'RESOLVED' || complaint.status === 'CLOSED').length

  const columns: Column<Complaint>[] = [
    {
      key: 'ticket',
      header: 'Ticket',
      render: complaint => (
        <Link to={`/complaints/${complaint.id}`} style={{ display: 'flex', alignItems: 'center', gap: 11, color: 'var(--text)', textDecoration: 'none' }}>
          <span style={{ width: 38, height: 38, borderRadius: 999, display: 'grid', placeItems: 'center', background: 'var(--danger-bg)', color: 'var(--danger)' }}>
            <MessageSquareWarning size={16} />
          </span>
          <span>
            <strong style={{ display: 'block', fontWeight: 700 }}>{complaint.ticket_number}</strong>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>{complaint.customer_name}</span>
          </span>
        </Link>
      ),
    },
    { key: 'subject', header: 'Subject', render: complaint => <strong style={{ color: 'var(--text)' }}>{complaint.subject}</strong> },
    {
      key: 'related_sale',
      header: 'Related',
      render: complaint => complaint.related_sale
        ? <Link to={`/sales/${complaint.related_sale}`} style={{ color: 'var(--primary-hover)', fontWeight: 600 }}>{complaint.related_sale_item_title || complaint.related_sale_label}</Link>
        : '-',
    },
    { key: 'priority', header: 'Priority', render: complaint => <StatusBadge status={complaint.priority} /> },
    { key: 'status', header: 'Status', render: complaint => <StatusBadge status={complaint.status} /> },
    { key: 'assigned_to', header: 'Assignee', render: complaint => complaint.assigned_to_name || '-' },
    { key: 'created_at', header: 'Opened', render: complaint => formatDate(complaint.created_at) },
  ]

  function updateField<K extends keyof ComplaintForm>(field: K, value: ComplaintForm[K]) {
    setForm(current => ({ ...current, [field]: value }))
    setErrors(current => ({ ...current, [field]: '' }))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = complaintSchema.safeParse(form)
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {}
      parsed.error.issues.forEach(issue => {
        const field = String(issue.path[0] ?? 'form')
        if (!nextErrors[field]) nextErrors[field] = issue.message
      })
      setErrors(nextErrors)
      return
    }
    const value = parsed.data
    create.mutate({
      customer: Number(value.customer),
      related_sale: value.related_sale ? Number(value.related_sale) : null,
      subject: value.subject,
      description: value.description,
      priority: value.priority,
      assigned_to: user?.id ?? null,
    })
  }

  return (
    <Layout>
      <div className="app-page">
        <PageHeader
          eyebrow="Manage"
          title="Complaints"
          subtitle="Customer issues, priorities, assignments, and resolution progress."
          actions={(
            <button type="button" onClick={() => setModalOpen(true)} className="primary-button">
              <Plus size={16} />
              New complaint
            </button>
          )}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 16 }}>
          <SummaryCard label="Total complaints" value={complaints.data?.count ?? rows.length} caption="Ticket records" icon={<MessageSquareWarning size={18} />} tone="red" />
          <SummaryCard label="Active on page" value={activeOnPage} caption="Open or in progress" icon={<AlertTriangle size={18} />} tone="amber" />
          <SummaryCard label="High priority" value={highOnPage} caption="High or urgent" icon={<ShieldAlert size={18} />} tone="red" valueColor="var(--money-owed)" />
          <SummaryCard label="Resolved" value={resolvedOnPage} caption="Resolved or closed" icon={<MessageSquareWarning size={18} />} tone="primary" />
        </div>

        <DirectoryCard
          title="Complaint directory"
          count={complaints.data ? `${complaints.data.count} total records` : 'Loading records'}
          toolbar={(
            <DirectoryToolbar>
              <SearchBox value={search} onChange={setSearch} placeholder="Search ticket, subject, customer" />
              <DirectorySelect value={status} onChange={value => setStatus(value as StatusFilter)} ariaLabel="Complaint status">
                <option value="all">All statuses</option>
                {COMPLAINT_STATUSES.map(nextStatus => (
                  <option key={nextStatus} value={nextStatus}>{COMPLAINT_STATUS_LABELS[nextStatus]}</option>
                ))}
              </DirectorySelect>
              <DirectorySelect value={priority} onChange={value => setPriority(value as PriorityFilter)} ariaLabel="Priority">
                <option value="all">All priorities</option>
                {COMPLAINT_PRIORITIES.map(nextPriority => (
                  <option key={nextPriority} value={nextPriority}>{COMPLAINT_PRIORITY_LABELS[nextPriority]}</option>
                ))}
              </DirectorySelect>
              <button type="button" className="primary-button" onClick={() => setCurrentPage(1)}>
                <Filter size={16} />
                Filter
              </button>
            </DirectoryToolbar>
          )}
          footer={complaints.data && (
            <PaginationFooter
              page={currentPage}
              total={complaints.data.count}
              hasPrevious={!!complaints.data.previous}
              hasNext={!!complaints.data.next}
              onPrevious={() => setCurrentPage(page => Math.max(1, page - 1))}
              onNext={() => setCurrentPage(page => page + 1)}
            />
          )}
        >
          {complaints.isLoading && <DirectorySkeleton />}
          {complaints.isError && <div className="error-banner" style={{ margin: '0 18px 18px' }}>{errorMessage(complaints.error)}</div>}
          {complaints.data && <DataTable columns={columns} rows={rows} empty="No complaints match the current filters." variant="bare" />}
        </DirectoryCard>
      </div>

      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'grid', placeItems: 'center', background: 'rgba(34,48,42,.34)', padding: 20 }} onClick={() => setModalOpen(false)}>
          <form onSubmit={submit} className="card" style={{ width: 'min(560px, 100%)', maxHeight: '88vh', overflow: 'auto' }} onClick={event => event.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '20px 22px', borderBottom: '1px solid var(--row-line)' }}>
              <div>
                <h2 className="serif" style={{ margin: 0, fontSize: 25, lineHeight: 1.1 }}>New complaint</h2>
                <p style={{ margin: '5px 0 0', color: 'var(--muted)', fontSize: 13 }}>Create a customer ticket.</p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="secondary-button" style={{ width: 38, padding: 0 }} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: 22, display: 'grid', gap: 16 }}>
              <Field label="Customer" error={errors.customer}>
                <select className="control" value={form.customer} onChange={event => updateField('customer', event.target.value)} style={{ width: '100%', padding: '0 12px' }}>
                  <option value="">Choose customer</option>
                  {(customers.data?.results ?? []).map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.full_name} - {customer.phone}</option>
                  ))}
                </select>
              </Field>

              <Field label="Related sale">
                <select className="control" value={form.related_sale} onChange={event => updateField('related_sale', event.target.value)} style={{ width: '100%', padding: '0 12px' }}>
                  <option value="">No related sale</option>
                  {(sales.data?.results ?? []).map(sale => (
                    <option key={sale.id} value={sale.id}>Sale #{sale.id} - {sale.item_title} - {sale.buyer_name}</option>
                  ))}
                </select>
              </Field>

              <div className="modal-grid-2" style={{ gridTemplateColumns: 'minmax(0, 1fr) 180px', gap: 14 }}>
                <Field label="Subject" error={errors.subject}>
                  <input className="control" value={form.subject} onChange={event => updateField('subject', event.target.value)} style={{ width: '100%', padding: '0 12px' }} />
                </Field>
                <Field label="Priority">
                  <select className="control" value={form.priority} onChange={event => updateField('priority', event.target.value as ComplaintPriority)} style={{ width: '100%', padding: '0 12px' }}>
                    {COMPLAINT_PRIORITIES.map(nextPriority => (
                      <option key={nextPriority} value={nextPriority}>{COMPLAINT_PRIORITY_LABELS[nextPriority]}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Description" error={errors.description}>
                <textarea className="control" value={form.description} onChange={event => updateField('description', event.target.value)} rows={4} style={{ width: '100%', height: 'auto', padding: 12, resize: 'vertical' }} />
              </Field>

              {create.isError && <div className="error-banner">{errorMessage(create.error)}</div>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 22px', borderTop: '1px solid var(--row-line)' }}>
              <button type="button" onClick={() => setModalOpen(false)} className="secondary-button">Cancel</button>
              <button type="submit" disabled={create.isPending} className="primary-button" style={{ opacity: create.isPending ? .7 : 1 }}>
                {create.isPending ? 'Saving...' : 'Create complaint'}
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  )
}
