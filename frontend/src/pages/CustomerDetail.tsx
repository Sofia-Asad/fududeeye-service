import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ClipboardList, Mail, MapPin, MessageSquareWarning, Package, Pencil, Phone, ShoppingCart, Smartphone, Trash2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  deleteCustomer,
  getCustomer,
  listCustomerComplaints,
  listCustomerDemands,
  listCustomerItems,
  listCustomerPurchases,
  updateCustomer,
} from '@/api/customers'
import { useAuth } from '@/auth/AuthContext'
import DataTable, { type Column } from '@/components/DataTable'
import EmptyState from '@/components/EmptyState'
import { Field, IconInput } from '@/components/FormSection'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import MoneyDisplay from '@/components/MoneyDisplay'
import PageHeader from '@/components/PageHeader'
import PermissionGate from '@/components/PermissionGate'
import { SkeletonLines } from '@/components/Skeleton'
import StatusBadge from '@/components/StatusBadge'
import SummaryCard from '@/components/SummaryCard'
import type { CustomerFormValues } from '@/lib/customerSchema'
import { customerSchema } from '@/lib/customerSchema'
import { errorMessage, formErrorMessage } from '@/lib/errors'
import { formatDate, initials } from '@/lib/sales'
import { notifyError, notifySuccess } from '@/lib/toast'
import { useEscapeToClose } from '@/lib/useEscapeToClose'
import { fieldErrors, useFocusFirstError } from '@/lib/validation'
import type { ComplaintSummary, Customer, DemandSummary, ItemSummary, SaleSummary } from '@/types/customer'

function formFromCustomer(customer: Customer): CustomerFormValues {
  return {
    full_name: customer.full_name,
    phone: customer.phone,
    alternate_phone: customer.alternate_phone,
    email: customer.email,
    address: customer.address,
    notes: customer.notes,
    is_active: customer.is_active,
  }
}

const TABS = ['Profile', 'Items owned', 'Purchases', 'Demands', 'Complaints'] as const
type Tab = typeof TABS[number]

function targetRange(demand: DemandSummary) {
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

function ContactPill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: '1px solid var(--border)', borderRadius: 999, background: '#fff', padding: '7px 10px', color: 'var(--muted)', fontSize: 12.5 }}>
      {icon}
      {text || '-'}
    </span>
  )
}

export default function CustomerDetail() {
  const { id } = useParams()
  const customerId = Number(id)
  const validCustomerId = Number.isFinite(customerId) && customerId > 0
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('Profile')
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState<CustomerFormValues | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const formRef = useRef<HTMLFormElement>(null)

  useFocusFirstError(errors, formRef)
  useEscapeToClose(editOpen, () => setEditOpen(false))

  const customer = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => getCustomer(customerId),
    enabled: validCustomerId,
  })
  const items = useQuery({
    queryKey: ['customer-items', customerId],
    queryFn: () => listCustomerItems(customerId),
    enabled: validCustomerId,
  })
  const purchases = useQuery({
    queryKey: ['customer-purchases', customerId],
    queryFn: () => listCustomerPurchases(customerId),
    enabled: validCustomerId,
  })
  const demands = useQuery({
    queryKey: ['customer-demands', customerId],
    queryFn: () => listCustomerDemands(customerId),
    enabled: validCustomerId,
  })
  const complaints = useQuery({
    queryKey: ['customer-complaints', customerId],
    queryFn: () => listCustomerComplaints(customerId),
    enabled: validCustomerId,
  })

  const save = useMutation({
    mutationFn: (payload: CustomerFormValues) => updateCustomer(customerId, payload),
    onSuccess: updated => {
      queryClient.setQueryData(['customer', customerId], updated)
      void queryClient.invalidateQueries({ queryKey: ['customers'] })
      setEditOpen(false)
      notifySuccess('Customer updated')
    },
    onError: error => notifyError(formErrorMessage(error, 'Customer could not be saved.')),
  })

  const remove = useMutation({
    mutationFn: () => deleteCustomer(customerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customers'] })
      notifySuccess('Customer deleted')
      navigate('/customers')
    },
    onError: error => notifyError(errorMessage(error)),
  })

  function openEdit() {
    if (!customer.data) return
    setForm(formFromCustomer(customer.data))
    setErrors({})
    setEditOpen(true)
  }

  function updateField<K extends keyof CustomerFormValues>(field: K, value: CustomerFormValues[K]) {
    setForm(current => current && { ...current, [field]: value })
    setErrors(current => ({ ...current, [field]: '' }))
  }

  function submitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form) return
    const parsed = customerSchema.safeParse(form)
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    save.mutate(parsed.data)
  }

  const canEdit = Boolean(user && (user.role === 'ADMIN' || user.role === 'MANAGER' || customer.data?.created_by === user.id))

  const itemRows = items.data?.results ?? []
  const purchaseRows = purchases.data?.results ?? []
  const demandRows = demands.data?.results ?? []
  const complaintRows = complaints.data?.results ?? []

  const itemColumns: Column<ItemSummary>[] = [
    { key: 'title', header: 'Item', render: item => <strong style={{ color: 'var(--text)' }}>{item.title}</strong> },
    { key: 'listed_price', header: 'Listed', align: 'right', render: item => <MoneyDisplay value={item.listed_price} /> },
    { key: 'owner_asking_price', header: 'Owner ask', align: 'right', render: item => item.owner_asking_price ? <MoneyDisplay value={item.owner_asking_price} /> : '-' },
    { key: 'quantity_available', header: 'Available', align: 'right', render: item => item.quantity_available },
    { key: 'status', header: 'Status', render: item => <StatusBadge status={item.status} /> },
  ]

  const purchaseColumns: Column<SaleSummary>[] = [
    { key: 'id', header: 'Sale', render: sale => <Link to={`/sales/${sale.id}`} style={{ color: 'var(--primary-hover)', fontWeight: 700, textDecoration: 'none' }}>#{sale.id}</Link> },
    { key: 'item', header: 'Item', render: sale => `Item #${sale.item}` },
    { key: 'quantity_sold', header: 'Qty', align: 'right', render: sale => sale.quantity_sold },
    { key: 'sale_price', header: 'Amount', align: 'right', render: sale => <MoneyDisplay value={sale.sale_price} /> },
    { key: 'sale_date', header: 'Date', render: sale => formatDate(sale.sale_date) },
  ]

  const demandColumns: Column<DemandSummary>[] = [
    { key: 'title', header: 'Demand', render: demand => <strong style={{ color: 'var(--text)' }}>{demand.title}</strong> },
    { key: 'target', header: 'Target price', align: 'right', render: demand => targetRange(demand) },
    { key: 'status', header: 'Status', render: demand => <StatusBadge status={demand.status} /> },
    { key: 'created_at', header: 'Created', render: demand => formatDate(demand.created_at) },
  ]

  const complaintColumns: Column<ComplaintSummary>[] = [
    { key: 'ticket_number', header: 'Ticket', render: complaint => complaint.ticket_number },
    { key: 'subject', header: 'Subject', render: complaint => <strong style={{ color: 'var(--text)' }}>{complaint.subject}</strong> },
    { key: 'priority', header: 'Priority', render: complaint => <StatusBadge status={complaint.priority} /> },
    { key: 'status', header: 'Status', render: complaint => <StatusBadge status={complaint.status} /> },
  ]

  if (!validCustomerId) {
    return <Layout><div className="app-page"><div className="error-banner">Customer not found.</div></div></Layout>
  }

  if (customer.isLoading) {
    return (
      <Layout>
        <div className="app-page">
          <SkeletonLines widths={['38%', '72%']} />
        </div>
      </Layout>
    )
  }

  if (customer.isError || !customer.data) {
    return <Layout><div className="app-page"><div className="error-banner">{errorMessage(customer.error)}</div></div></Layout>
  }

  const current = customer.data

  return (
    <Layout>
      <div className="app-page">
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <Link to="/customers" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--primary-hover)', fontSize: 13, fontWeight: 700, textDecoration: 'none', marginBottom: 14 }}>
            <ArrowLeft size={16} />
            Customers
          </Link>

          <PageHeader
            eyebrow="Customer detail"
            title={current.full_name}
            subtitle={(
              <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                <ContactPill icon={<Phone size={14} />} text={current.phone} />
                <ContactPill icon={<Mail size={14} />} text={current.email} />
                <ContactPill icon={<MapPin size={14} />} text={current.address} />
              </span>
            )}
            actions={(
              <>
                <StatusBadge status={current.is_active ? 'ACTIVE' : 'INACTIVE'} />
                {current.is_buyer && <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: 'var(--info-bg)', color: 'var(--info)' }}>Buyer</span>}
                {current.is_seller && <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: 'var(--warning-bg)', color: 'var(--warning)' }}>Seller</span>}
                {canEdit && (
                  <button type="button" onClick={openEdit} className="secondary-button">
                    <Pencil size={16} />
                    Edit
                  </button>
                )}
                <PermissionGate minRole="ADMIN">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete ${current.full_name}? This cannot be undone.`)) remove.mutate()
                    }}
                    disabled={remove.isPending}
                    className="danger-button"
                    style={{ opacity: remove.isPending ? .7 : 1 }}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </PermissionGate>
              </>
            )}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 16 }}>
            <SummaryCard label="Items owned" value={items.data?.count ?? itemRows.length} caption="Consignment inventory" icon={<Package size={18} />} />
            <SummaryCard label="Purchases" value={purchases.data?.count ?? purchaseRows.length} caption="Buyer history" icon={<ShoppingCart size={18} />} tone="blue" />
            <SummaryCard label="Demands" value={demands.data?.count ?? demandRows.length} caption="Open and past requests" icon={<ClipboardList size={18} />} tone="amber" />
            <SummaryCard label="Complaints" value={complaints.data?.count ?? complaintRows.length} caption="Support tickets" icon={<MessageSquareWarning size={18} />} tone={complaintRows.length > 0 ? 'red' : 'neutral'} />
          </div>

          <section className="card" style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', borderBottom: '1px solid var(--row-line)' }}>
              <div style={{ width: 46, height: 46, borderRadius: 999, background: 'var(--primary-soft)', color: 'var(--primary-hover)', display: 'grid', placeItems: 'center', fontSize: 15, fontWeight: 800, flexShrink: 0 }}>
                {initials(current.full_name)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700 }}>{current.full_name}</div>
                <div style={{ color: 'var(--muted)', fontSize: 12.5 }}>Customer since {formatDate(current.created_at)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid var(--row-line)', padding: '0 18px', overflowX: 'auto' }}>
              {TABS.map(nextTab => (
                <button
                  key={nextTab}
                  type="button"
                  onClick={() => setTab(nextTab)}
                  style={{ height: 50, padding: '0 16px', border: 'none', background: 'none', fontSize: 13.5, fontFamily: 'inherit', fontWeight: tab === nextTab ? 700 : 500, color: tab === nextTab ? 'var(--primary-hover)' : 'var(--muted)', cursor: 'pointer', borderBottom: tab === nextTab ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -1, whiteSpace: 'nowrap' }}
                >
                  {nextTab}
                </button>
              ))}
            </div>

            {tab === 'Profile' && (
              <div style={{ padding: 20 }}>
                <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Profile</h2>
                <div style={{ display: 'grid', gap: 12 }}>
                  {[
                    ['Phone', current.phone],
                    ['Alternate', current.alternate_phone || '-'],
                    ['Email', current.email || '-'],
                    ['Address', current.address || '-'],
                    ['Notes', current.notes || '-'],
                    ['Updated', formatDate(current.updated_at)],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'grid', gridTemplateColumns: '130px minmax(0, 1fr)', gap: 12, alignItems: 'baseline' }}>
                      <div style={{ color: 'var(--muted)', fontSize: 12.5 }}>{label}</div>
                      <div style={{ color: 'var(--text)', fontSize: 13.5, fontWeight: 700 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'Items owned' && (
              <>
                <div style={{ padding: '16px 18px 12px' }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Owned item records</h2>
                  <div style={{ marginTop: 3, color: 'var(--muted)', fontSize: 12.5 }}>{itemRows.length} rows</div>
                </div>
                {items.isLoading && <SkeletonLines widths={['50%', '70%']} />}
                {!items.isLoading && <DataTable variant="bare" columns={itemColumns} rows={itemRows} empty={<EmptyState icon={<Package size={18} />} title="No owned items yet." />} />}
              </>
            )}
            {tab === 'Purchases' && (
              <>
                <div style={{ padding: '16px 18px 12px' }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Purchase records</h2>
                  <div style={{ marginTop: 3, color: 'var(--muted)', fontSize: 12.5 }}>{purchaseRows.length} rows</div>
                </div>
                {purchases.isLoading && <SkeletonLines widths={['50%', '70%']} />}
                {!purchases.isLoading && <DataTable variant="bare" columns={purchaseColumns} rows={purchaseRows} empty={<EmptyState icon={<ShoppingCart size={18} />} title="No purchases yet." />} />}
              </>
            )}
            {tab === 'Demands' && (
              <>
                <div style={{ padding: '16px 18px 12px' }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Demand records</h2>
                  <div style={{ marginTop: 3, color: 'var(--muted)', fontSize: 12.5 }}>{demandRows.length} rows</div>
                </div>
                {demands.isLoading && <SkeletonLines widths={['50%', '70%']} />}
                {!demands.isLoading && <DataTable variant="bare" columns={demandColumns} rows={demandRows} empty={<EmptyState icon={<ClipboardList size={18} />} title="No matching demands." />} />}
              </>
            )}
            {tab === 'Complaints' && (
              <>
                <div style={{ padding: '16px 18px 12px' }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Complaint records</h2>
                  <div style={{ marginTop: 3, color: 'var(--muted)', fontSize: 12.5 }}>{complaintRows.length} rows</div>
                </div>
                {complaints.isLoading && <SkeletonLines widths={['50%', '70%']} />}
                {!complaints.isLoading && <DataTable variant="bare" columns={complaintColumns} rows={complaintRows} empty={<EmptyState icon={<MessageSquareWarning size={18} />} title="No complaints found." />} />}
              </>
            )}
          </section>
        </div>
      </div>

      {form && (
        <Modal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          title="Edit customer"
          description="Update contact profile details."
          formRef={formRef}
          onSubmit={submitEdit}
          footer={(
            <>
              <button type="button" onClick={() => setEditOpen(false)} className="secondary-button">Cancel</button>
              <button type="submit" disabled={save.isPending} className="primary-button" style={{ opacity: save.isPending ? .7 : 1 }}>
                {save.isPending ? 'Saving...' : 'Save customer'}
              </button>
            </>
          )}
        >
          <Field label="Full name" error={errors.full_name} name="full_name">
            <input autoFocus className="control" value={form.full_name} onChange={event => updateField('full_name', event.target.value)} style={{ width: '100%', padding: '0 12px' }} />
          </Field>
          <div className="modal-grid-2" style={{ gap: 14 }}>
            <Field label="Phone" error={errors.phone} name="phone">
              <IconInput icon={<Phone size={15} />} value={form.phone} onChange={event => updateField('phone', event.target.value)} />
            </Field>
            <Field label="Alternate phone" error={errors.alternate_phone} name="alternate_phone">
              <IconInput icon={<Smartphone size={15} />} value={form.alternate_phone} onChange={event => updateField('alternate_phone', event.target.value)} />
            </Field>
          </div>
          <Field label="Email" error={errors.email} name="email">
            <IconInput icon={<Mail size={15} />} type="email" value={form.email} onChange={event => updateField('email', event.target.value)} />
          </Field>
          <Field label="Address" error={errors.address} name="address">
            <span style={{ position: 'relative', display: 'block' }}>
              <span style={{ position: 'absolute', left: 13, top: 12, color: 'var(--muted)', pointerEvents: 'none' }}>
                <MapPin size={15} />
              </span>
              <textarea className="control" value={form.address} onChange={event => updateField('address', event.target.value)} rows={3} style={{ width: '100%', height: 'auto', padding: '11px 12px 11px 38px', resize: 'vertical' }} />
            </span>
          </Field>
          <Field label="Notes" error={errors.notes} name="notes">
            <textarea className="control" value={form.notes} onChange={event => updateField('notes', event.target.value)} rows={3} style={{ width: '100%', height: 'auto', padding: 12, resize: 'vertical' }} />
          </Field>
          <label className="checkbox-row">
            <input checked={form.is_active} onChange={event => updateField('is_active', event.target.checked)} type="checkbox" />
            Active customer
          </label>
          {save.isError && <div className="error-banner">{formErrorMessage(save.error, 'Customer could not be saved.')}</div>}
        </Modal>
      )}
    </Layout>
  )
}
