import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, FileText, Filter, MessageSquareWarning, Plus, ShieldAlert, Users } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { listCustomers } from '@/api/customers'
import { listSales } from '@/api/sales'
import { createComplaint, listComplaints } from '@/api/service'
import { useAuth } from '@/auth/AuthContext'
import DataTable, { type Column } from '@/components/DataTable'
import DirectoryCard, { DirectorySelect, DirectorySkeleton, DirectoryToolbar, SearchBox } from '@/components/DirectoryCard'
import EmptyState from '@/components/EmptyState'
import { CompactTextarea, Field, SegmentedControl } from '@/components/FormSection'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import PageHeader from '@/components/PageHeader'
import PaginationFooter from '@/components/PaginationFooter'
import StatusBadge from '@/components/StatusBadge'
import SummaryCard from '@/components/SummaryCard'
import AccordionCard from '@/components/wizard/AccordionCard'
import CustomerSelector from '@/components/wizard/CustomerSelector'
import SearchableSelect from '@/components/wizard/SearchableSelect'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { errorMessage } from '@/lib/errors'
import {
  COMPLAINT_PRIORITIES,
  COMPLAINT_PRIORITY_LABELS,
  COMPLAINT_STATUSES,
  COMPLAINT_STATUS_LABELS,
  formatDate,
} from '@/lib/service'
import { notifyError, notifySuccess } from '@/lib/toast'
import { useEscapeToClose } from '@/lib/useEscapeToClose'
import { fieldErrors, useFocusFirstError } from '@/lib/validation'
import type { Complaint, ComplaintPriority, ComplaintStatus } from '@/types/service'

type StatusFilter = 'all' | ComplaintStatus
type PriorityFilter = 'all' | ComplaintPriority
type ComplaintSectionKey = 'customer' | 'details' | 'priority' | 'description'

const complaintSchema = z.object({
  customer: z.string().trim().min(1, 'Customer is required.'),
  related_sale: z.string().trim(),
  subject: z.string().trim().min(1, 'Subject is required.'),
  description: z.string().trim().min(1, 'Please enter a complaint description.'),
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

export default function Complaints() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const formRef = useRef<HTMLFormElement>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [priority, setPriority] = useState<PriorityFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<ComplaintForm>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [openSection, setOpenSection] = useState<ComplaintSectionKey | null>('customer')
  const [customerSearch, setCustomerSearch] = useState('')
  const debouncedCustomerSearch = useDebouncedValue(customerSearch)

  useFocusFirstError(errors, formRef)
  useEscapeToClose(modalOpen, () => setModalOpen(false))

  function toggleSection(key: ComplaintSectionKey) {
    setOpenSection(current => (current === key ? null : key))
  }

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
    queryKey: ['customers', 'complaint-picker', debouncedCustomerSearch],
    queryFn: () => listCustomers({ is_active: true, ordering: 'full_name', search: debouncedCustomerSearch || undefined }),
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
      setOpenSection('customer')
      void queryClient.invalidateQueries({ queryKey: ['complaints'] })
      notifySuccess('Complaint created')
      navigate(`/complaints/${complaint.id}`)
    },
    onError: error => notifyError(errorMessage(error)),
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
      setErrors(fieldErrors(parsed.error))
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
            <button type="button" onClick={() => { setOpenSection('customer'); setModalOpen(true) }} className="primary-button">
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
          {complaints.data && (
            <DataTable
              columns={columns}
              rows={rows}
              variant="bare"
              empty={(
                <EmptyState
                  icon={<MessageSquareWarning size={18} />}
                  title="No complaints found."
                  subtitle="No customer issues match the current filters."
                  action={<button type="button" onClick={() => { setOpenSection('customer'); setModalOpen(true) }} className="primary-button"><Plus size={16} />New complaint</button>}
                />
              )}
            />
          )}
        </DirectoryCard>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New complaint"
        description="Create a customer support ticket."
        width={640}
        formRef={formRef}
        onSubmit={submit}
        footer={(
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="secondary-button">Cancel</button>
            <button type="submit" disabled={create.isPending} className="primary-button" style={{ opacity: create.isPending ? .7 : 1 }}>
              {create.isPending ? 'Saving...' : 'Create complaint'}
            </button>
          </>
        )}
      >
        <div style={{ display: 'grid', gap: 8 }}>
          <AccordionCard
            icon={<Users size={17} />}
            title="Customer"
            description="Who is this ticket for?"
            isOpen={openSection === 'customer'}
            isDone={!!form.customer}
            onToggle={() => toggleSection('customer')}
          >
            <Field label="Customer" required error={errors.customer} name="customer">
              <CustomerSelector
                customers={customers.data?.results ?? []}
                value={form.customer}
                onSelect={customer => updateField('customer', String(customer.id))}
                onSearch={setCustomerSearch}
                error={!!errors.customer}
              />
            </Field>
          </AccordionCard>

          <AccordionCard
            icon={<MessageSquareWarning size={17} />}
            title="Complaint Details"
            description="Subject and any related sale."
            isOpen={openSection === 'details'}
            isDone={!!form.subject}
            onToggle={() => toggleSection('details')}
          >
            <Field label="Subject" required error={errors.subject} name="subject">
              <input className="control" value={form.subject} onChange={event => updateField('subject', event.target.value)} style={{ width: '100%', padding: '0 12px' }} />
            </Field>
            <Field label="Related sale" name="related_sale">
              <SearchableSelect
                options={sales.data?.results ?? []}
                value={form.related_sale}
                getId={sale => String(sale.id)}
                getLabel={sale => `Sale #${sale.id} - ${sale.item_title} - ${sale.buyer_name}`}
                renderOption={sale => (
                  <span>
                    <strong style={{ display: 'block', fontSize: 13 }}>Sale #{sale.id} — {sale.item_title}</strong>
                    <span style={{ color: 'var(--muted)', fontSize: 11.5 }}>{sale.buyer_name}</span>
                  </span>
                )}
                onSelect={sale => updateField('related_sale', String(sale.id))}
                placeholder="No related sale"
                emptyLabel="No sales found."
              />
            </Field>
          </AccordionCard>

          <AccordionCard
            icon={<ShieldAlert size={17} />}
            title="Priority"
            description="How urgent is this issue?"
            isOpen={openSection === 'priority'}
            isDone
            onToggle={() => toggleSection('priority')}
          >
            <Field label="Priority" name="priority">
              <SegmentedControl
                value={form.priority}
                options={COMPLAINT_PRIORITIES.map(nextPriority => ({ value: nextPriority, label: COMPLAINT_PRIORITY_LABELS[nextPriority] }))}
                onChange={value => updateField('priority', value as ComplaintPriority)}
              />
            </Field>
          </AccordionCard>

          <AccordionCard
            icon={<FileText size={17} />}
            title="Description"
            description="What happened, in detail."
            isOpen={openSection === 'description'}
            isDone={!!form.description}
            onToggle={() => toggleSection('description')}
          >
            <Field label="Description" required error={errors.description} name="description">
              <CompactTextarea rows={3} value={form.description} onChange={event => updateField('description', event.target.value)} />
            </Field>
          </AccordionCard>
        </div>

        {create.isError && <div className="error-banner">{errorMessage(create.error)}</div>}
      </Modal>
    </Layout>
  )
}
