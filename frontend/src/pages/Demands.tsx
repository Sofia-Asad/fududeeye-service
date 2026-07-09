import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ClipboardList, FileText, Filter, PackageCheck, Plus, Target, Users } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { listCustomers } from '@/api/customers'
import { listCategories } from '@/api/inventory'
import { createDemand, listDemands } from '@/api/service'
import DataTable, { type Column } from '@/components/DataTable'
import DirectoryCard, { DirectorySelect, DirectorySkeleton, DirectoryToolbar, SearchBox } from '@/components/DirectoryCard'
import EmptyState from '@/components/EmptyState'
import { CompactTextarea, Field, FormGrid } from '@/components/FormSection'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import MoneyDisplay from '@/components/MoneyDisplay'
import PageHeader from '@/components/PageHeader'
import PaginationFooter from '@/components/PaginationFooter'
import StatusBadge from '@/components/StatusBadge'
import SummaryCard from '@/components/SummaryCard'
import AccordionCard from '@/components/wizard/AccordionCard'
import CustomerSelector from '@/components/wizard/CustomerSelector'
import { errorMessage } from '@/lib/errors'
import { DEMAND_STATUS_LABELS, DEMAND_STATUSES, formatDate } from '@/lib/service'
import { notifyError, notifySuccess } from '@/lib/toast'
import { useEscapeToClose } from '@/lib/useEscapeToClose'
import { fieldErrors, useFocusFirstError } from '@/lib/validation'
import type { Demand, DemandStatus } from '@/types/service'

type DemandSectionKey = 'customer' | 'info' | 'budget' | 'notes'

type StatusFilter = 'all' | DemandStatus

const moneyPattern = /^$|^\d+(\.\d{1,2})?$/
const demandSchema = z.object({
  customer: z.string().trim().min(1, 'Customer is required.'),
  title: z.string().trim().min(1, 'Title is required.'),
  description: z.string().trim(),
  category: z.string().trim(),
  target_price_min: z.string().trim().regex(moneyPattern, 'Use a valid amount.'),
  target_price_max: z.string().trim().regex(moneyPattern, 'Use a valid amount.'),
  notes: z.string().trim(),
}).superRefine((value, ctx) => {
  const min = value.target_price_min ? Number(value.target_price_min) : null
  const max = value.target_price_max ? Number(value.target_price_max) : null
  if (min !== null && max !== null && min > max) {
    ctx.addIssue({ code: 'custom', path: ['target_price_max'], message: 'Maximum must be greater than minimum.' })
  }
})

type DemandForm = z.infer<typeof demandSchema>

const emptyForm: DemandForm = {
  customer: '',
  title: '',
  description: '',
  category: '',
  target_price_min: '',
  target_price_max: '',
  notes: '',
}

function targetPrice(demand: Demand) {
  if (demand.target_price_min && demand.target_price_max) {
    return (
      <>
        <MoneyDisplay value={demand.target_price_min} /> - <MoneyDisplay value={demand.target_price_max} />
      </>
    )
  }
  if (demand.target_price_min) return <MoneyDisplay value={demand.target_price_min} />
  if (demand.target_price_max) return <MoneyDisplay value={demand.target_price_max} />
  return '-'
}

export default function Demands() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const formRef = useRef<HTMLFormElement>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [category, setCategory] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<DemandForm>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [openSection, setOpenSection] = useState<DemandSectionKey | null>('customer')

  useFocusFirstError(errors, formRef)
  useEscapeToClose(modalOpen, () => setModalOpen(false))

  function toggleSection(key: DemandSectionKey) {
    setOpenSection(current => (current === key ? null : key))
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [search, status, category])

  const demands = useQuery({
    queryKey: ['demands', search, status, category, currentPage],
    queryFn: () => listDemands({
      search: search.trim() || undefined,
      status: status === 'all' ? undefined : status,
      category: category ?? undefined,
      ordering: '-created_at',
      page: currentPage,
    }),
  })

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: () => listCategories({ ordering: 'name' }),
  })

  const customers = useQuery({
    queryKey: ['customers', 'demand-picker'],
    queryFn: () => listCustomers({ is_active: true, ordering: 'full_name' }),
    enabled: modalOpen,
  })

  const create = useMutation({
    mutationFn: createDemand,
    onSuccess: demand => {
      setModalOpen(false)
      setForm(emptyForm)
      setErrors({})
      setOpenSection('customer')
      void queryClient.invalidateQueries({ queryKey: ['demands'] })
      notifySuccess('Demand created')
      navigate(`/demands/${demand.id}`)
    },
    onError: error => notifyError(errorMessage(error)),
  })

  const rows = demands.data?.results ?? []
  const openOnPage = rows.filter(demand => demand.status === 'OPEN').length
  const matchedOnPage = rows.filter(demand => demand.status === 'MATCHED').length
  const fulfilledOnPage = rows.filter(demand => demand.status === 'FULFILLED').length

  const columns: Column<Demand>[] = [
    {
      key: 'customer',
      header: 'Customer',
      render: demand => (
        <Link to={`/customers/${demand.customer}`} style={{ display: 'flex', alignItems: 'center', gap: 11, color: 'var(--text)', textDecoration: 'none' }}>
          <span style={{ width: 38, height: 38, borderRadius: 999, display: 'grid', placeItems: 'center', background: 'var(--primary-soft)', color: 'var(--primary-hover)' }}>
            <ClipboardList size={16} />
          </span>
          <span>
            <strong style={{ display: 'block', fontWeight: 700 }}>{demand.customer_name}</strong>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>{demand.category_name || 'Any category'}</span>
          </span>
        </Link>
      ),
    },
    {
      key: 'title',
      header: 'What they want',
      render: demand => (
        <Link to={`/demands/${demand.id}`} style={{ color: 'var(--text)', fontWeight: 700, textDecoration: 'none' }}>
          {demand.title}
        </Link>
      ),
    },
    { key: 'target', header: 'Target', align: 'right', render: demand => targetPrice(demand) },
    { key: 'status', header: 'Status', render: demand => <StatusBadge status={demand.status} /> },
    { key: 'matched_item', header: 'Matched item', render: demand => demand.matched_item_title || '-' },
    { key: 'created_at', header: 'Created', render: demand => formatDate(demand.created_at) },
  ]

  function updateField<K extends keyof DemandForm>(field: K, value: DemandForm[K]) {
    setForm(current => ({ ...current, [field]: value }))
    setErrors(current => ({ ...current, [field]: '' }))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = demandSchema.safeParse(form)
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    const value = parsed.data
    create.mutate({
      customer: Number(value.customer),
      title: value.title,
      description: value.description,
      category: value.category ? Number(value.category) : null,
      target_price_min: value.target_price_min || null,
      target_price_max: value.target_price_max || null,
      notes: value.notes,
    })
  }

  return (
    <Layout>
      <div className="app-page">
        <PageHeader
          eyebrow="Manage"
          title="Demands"
          subtitle="Customer requests waiting for inventory matches."
          actions={(
            <button type="button" onClick={() => { setOpenSection('customer'); setModalOpen(true) }} className="primary-button">
              <Plus size={16} />
              New demand
            </button>
          )}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 16 }}>
          <SummaryCard label="Total demands" value={demands.data?.count ?? rows.length} caption="Request records" icon={<ClipboardList size={18} />} />
          <SummaryCard label="Open on page" value={openOnPage} caption="Needs matching" icon={<Target size={18} />} tone="amber" />
          <SummaryCard label="Matched" value={matchedOnPage} caption="Item proposed" icon={<PackageCheck size={18} />} tone="blue" />
          <SummaryCard label="Fulfilled" value={fulfilledOnPage} caption="Closed with supply" icon={<PackageCheck size={18} />} tone="primary" />
        </div>

        <DirectoryCard
          title="Demand directory"
          count={demands.data ? `${demands.data.count} total records` : 'Loading records'}
          toolbar={(
            <DirectoryToolbar>
              <SearchBox value={search} onChange={setSearch} placeholder="Search demands, customers, notes" />
              <DirectorySelect value={status} onChange={value => setStatus(value as StatusFilter)} ariaLabel="Demand status">
                <option value="all">All statuses</option>
                {DEMAND_STATUSES.map(nextStatus => (
                  <option key={nextStatus} value={nextStatus}>{DEMAND_STATUS_LABELS[nextStatus]}</option>
                ))}
              </DirectorySelect>
              <DirectorySelect value={category ?? 'all'} onChange={value => setCategory(value === 'all' ? null : Number(value))} ariaLabel="Category">
                <option value="all">All categories</option>
                {(categories.data?.results ?? []).map(nextCategory => (
                  <option key={nextCategory.id} value={nextCategory.id}>{nextCategory.name}</option>
                ))}
              </DirectorySelect>
              <button type="button" className="primary-button" onClick={() => setCurrentPage(1)}>
                <Filter size={16} />
                Filter
              </button>
            </DirectoryToolbar>
          )}
          footer={demands.data && (
            <PaginationFooter
              page={currentPage}
              total={demands.data.count}
              hasPrevious={!!demands.data.previous}
              hasNext={!!demands.data.next}
              onPrevious={() => setCurrentPage(page => Math.max(1, page - 1))}
              onNext={() => setCurrentPage(page => page + 1)}
            />
          )}
        >
          {demands.isLoading && <DirectorySkeleton />}
          {demands.isError && <div className="error-banner" style={{ margin: '0 18px 18px' }}>{errorMessage(demands.error)}</div>}
          {demands.data && (
            <DataTable
              columns={columns}
              rows={rows}
              variant="bare"
              empty={(
                <EmptyState
                  icon={<ClipboardList size={18} />}
                  title="No matching demands."
                  subtitle="No customer requests match the current filters."
                  action={<button type="button" onClick={() => { setOpenSection('customer'); setModalOpen(true) }} className="primary-button"><Plus size={16} />New demand</button>}
                />
              )}
            />
          )}
        </DirectoryCard>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New demand"
        description="Create a customer request for the matching engine to track."
        width={640}
        formRef={formRef}
        onSubmit={submit}
        footer={(
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="secondary-button">Cancel</button>
            <button type="submit" disabled={create.isPending} className="primary-button" style={{ opacity: create.isPending ? .7 : 1 }}>
              {create.isPending ? 'Saving...' : 'Create demand'}
            </button>
          </>
        )}
      >
        <div style={{ display: 'grid', gap: 8 }}>
          <AccordionCard
            icon={<Users size={17} />}
            title="Customer"
            description="Who is asking for this item?"
            isOpen={openSection === 'customer'}
            isDone={!!form.customer}
            onToggle={() => toggleSection('customer')}
          >
            <Field label="Customer" required error={errors.customer} name="customer">
              <CustomerSelector
                customers={customers.data?.results ?? []}
                value={form.customer}
                onSelect={customer => updateField('customer', String(customer.id))}
                error={!!errors.customer}
              />
            </Field>
          </AccordionCard>

          <AccordionCard
            icon={<ClipboardList size={17} />}
            title="Demand Information"
            description="What are they looking for?"
            isOpen={openSection === 'info'}
            isDone={!!form.title}
            onToggle={() => toggleSection('info')}
          >
            <Field label="Title" required error={errors.title} name="title">
              <input className="control" value={form.title} onChange={event => updateField('title', event.target.value)} style={{ width: '100%', padding: '0 12px' }} />
            </Field>
            <Field label="Category" name="category">
              <select className="control" value={form.category} onChange={event => updateField('category', event.target.value)} style={{ width: '100%', padding: '0 12px' }}>
                <option value="">Any category</option>
                {(categories.data?.results ?? []).map(nextCategory => (
                  <option key={nextCategory.id} value={nextCategory.id}>{nextCategory.name}</option>
                ))}
              </select>
            </Field>
          </AccordionCard>

          <AccordionCard
            icon={<Target size={17} />}
            title="Budget"
            description="Optional target price range."
            isOpen={openSection === 'budget'}
            isDone={Boolean(form.target_price_min || form.target_price_max)}
            onToggle={() => toggleSection('budget')}
          >
            <FormGrid>
              <Field label="Target min" error={errors.target_price_min} name="target_price_min">
                <input className="control" value={form.target_price_min} onChange={event => updateField('target_price_min', event.target.value)} inputMode="decimal" style={{ width: '100%', padding: '0 12px' }} />
              </Field>
              <Field label="Target max" error={errors.target_price_max} name="target_price_max">
                <input className="control" value={form.target_price_max} onChange={event => updateField('target_price_max', event.target.value)} inputMode="decimal" style={{ width: '100%', padding: '0 12px' }} />
              </Field>
            </FormGrid>
          </AccordionCard>

          <AccordionCard
            icon={<FileText size={17} />}
            title="Additional Notes"
            description="Optional description and internal notes."
            isOpen={openSection === 'notes'}
            isDone={Boolean(form.description || form.notes)}
            onToggle={() => toggleSection('notes')}
          >
            <Field label="Description" name="description">
              <CompactTextarea value={form.description} onChange={event => updateField('description', event.target.value)} />
            </Field>
            <Field label="Notes" name="notes">
              <CompactTextarea value={form.notes} onChange={event => updateField('notes', event.target.value)} />
            </Field>
          </AccordionCard>
        </div>

        {create.isError && <div className="error-banner">{errorMessage(create.error)}</div>}
      </Modal>
    </Layout>
  )
}
