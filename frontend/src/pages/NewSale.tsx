import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CircleDollarSign, Save, ShoppingCart } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { z } from 'zod'

import { listCustomers } from '@/api/customers'
import { listItems } from '@/api/inventory'
import { createSale } from '@/api/sales'
import { useAuth } from '@/auth/AuthContext'
import ActionFooter from '@/components/ActionFooter'
import FormSection, { FieldLabel, FormGrid } from '@/components/FormSection'
import Layout from '@/components/Layout'
import MoneyDisplay from '@/components/MoneyDisplay'
import PageHeader from '@/components/PageHeader'
import PermissionGate from '@/components/PermissionGate'
import { PAYMENT_METHOD_LABELS, PAYMENT_METHODS, decimalString, todayISO } from '@/lib/sales'
import type { Item } from '@/types/inventory'
import type { PaymentMethod } from '@/types/sales'

const moneyPattern = /^\d+(\.\d{1,2})?$/

const saleSchema = z.object({
  item: z.string().trim().min(1, 'Item is required.'),
  buyer: z.string().trim().min(1, 'Buyer is required.'),
  quantity_sold: z.string().trim().regex(/^[1-9]\d*$/, 'Quantity must be at least 1.'),
  sale_price: z.string().trim().regex(moneyPattern, 'Use a valid amount.'),
  sale_date: z.string().trim().min(1, 'Date is required.'),
  payment_method: z.enum(['CASH', 'EVC_PLUS', 'ZAAD', 'BANK_TRANSFER', 'OTHER']),
  notes: z.string().trim(),
})

type SaleForm = z.infer<typeof saleSchema>

const emptyForm: SaleForm = {
  item: '',
  buyer: '',
  quantity_sold: '1',
  sale_price: '',
  sale_date: todayISO(),
  payment_method: 'CASH',
  notes: '',
}

function apiErrorMessage(error: unknown) {
  if (!(error instanceof AxiosError)) {
    return 'Sale could not be saved.'
  }
  const data = error.response?.data
  if (data && typeof data === 'object') {
    return Object.entries(data)
      .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : String(messages)}`)
      .join(' ')
  }
  return error.response?.status ? `Sale could not be saved (${error.response.status}).` : 'Sale could not be saved.'
}

function recommendedTotal(item: Item, quantity: number) {
  return Number(item.listed_price) * quantity
}

export default function NewSale() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState<SaleForm>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const items = useQuery({
    queryKey: ['items', 'sale-picker'],
    queryFn: () => listItems({ status: 'ACTIVE', ordering: 'title' }),
  })

  const buyers = useQuery({
    queryKey: ['customers', 'sale-buyer-picker'],
    queryFn: () => listCustomers({ is_active: true, ordering: 'full_name' }),
  })

  const selectedItem = useMemo(
    () => (items.data?.results ?? []).find(item => String(item.id) === form.item),
    [form.item, items.data?.results],
  )
  const quantity = Number(form.quantity_sold) || 1
  const saleTotal = Number(form.sale_price) || 0
  const baseUnit = selectedItem?.owner_type === 'CONSIGNMENT'
    ? Number(selectedItem.owner_asking_price ?? 0)
    : Number(selectedItem?.cost_price ?? 0)
  const ownerPayout = selectedItem?.owner_type === 'CONSIGNMENT' ? baseUnit * quantity : 0
  const companyProfit = saleTotal - baseUnit * quantity
  const margin = saleTotal > 0 ? (companyProfit / saleTotal) * 100 : 0

  const create = useMutation({
    mutationFn: createSale,
    onSuccess: sale => {
      navigate(`/sales/${sale.id}`)
    },
  })

  function updateField<K extends keyof SaleForm>(field: K, value: SaleForm[K]) {
    setForm(current => {
      const next = { ...current, [field]: value }
      if (field === 'item') {
        const item = (items.data?.results ?? []).find(candidate => String(candidate.id) === value)
        if (item) next.sale_price = decimalString(recommendedTotal(item, Number(next.quantity_sold) || 1))
      }
      if (field === 'quantity_sold') {
        const qty = Number(value) || 1
        const item = (items.data?.results ?? []).find(candidate => String(candidate.id) === next.item)
        if (item) next.sale_price = decimalString(recommendedTotal(item, qty))
      }
      return next
    })
    setErrors(current => ({ ...current, [field]: '' }))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return
    const parsed = saleSchema.safeParse(form)
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
      item: Number(value.item),
      buyer: Number(value.buyer),
      quantity_sold: Number(value.quantity_sold),
      sale_price: value.sale_price,
      sale_date: value.sale_date,
      payment_method: value.payment_method as PaymentMethod,
      handled_by: user.id,
      notes: value.notes,
    })
  }

  return (
    <Layout>
      <div className="app-page">
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <Link to="/sales" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--primary-hover)', fontSize: 13, fontWeight: 700, textDecoration: 'none', marginBottom: 14 }}>
            <ArrowLeft size={16} />
            Sales
          </Link>

          <PageHeader
            eyebrow="Manage"
            title="New sale"
            subtitle="Record a completed sale. Stored payout and profit values come back from the API."
          />

          <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
            <div className="content-sidebar-grid">
              <FormSection icon={<ShoppingCart size={18} />} title="Sale details" description="Select the item, buyer, price, date, and payment method.">
                <div style={{ display: 'grid', gap: 16 }}>
                  <FieldLabel label="Item" required error={errors.item}>
                    <select className="control" value={form.item} onChange={event => updateField('item', event.target.value)} style={{ width: '100%', padding: '0 12px', borderColor: errors.item ? 'var(--danger)' : undefined, background: errors.item ? '#fffbfa' : undefined }}>
                      <option value="">Choose active item</option>
                      {(items.data?.results ?? []).filter(item => item.quantity_available > 0).map(item => (
                        <option key={item.id} value={item.id}>
                          {item.title} - {item.quantity_available} available - ${item.listed_price}
                        </option>
                      ))}
                    </select>
                  </FieldLabel>

                  <FieldLabel label="Buyer" required error={errors.buyer}>
                    <select className="control" value={form.buyer} onChange={event => updateField('buyer', event.target.value)} style={{ width: '100%', padding: '0 12px', borderColor: errors.buyer ? 'var(--danger)' : undefined, background: errors.buyer ? '#fffbfa' : undefined }}>
                      <option value="">Choose customer</option>
                      {(buyers.data?.results ?? []).map(customer => (
                        <option key={customer.id} value={customer.id}>{customer.full_name} - {customer.phone}</option>
                      ))}
                    </select>
                  </FieldLabel>

                  <FormGrid>
                    <FieldLabel label="Quantity" required error={errors.quantity_sold}>
                      <input className="control" value={form.quantity_sold} min={1} max={selectedItem?.quantity_available} onChange={event => updateField('quantity_sold', event.target.value)} inputMode="numeric" style={{ width: '100%', padding: '0 12px', borderColor: errors.quantity_sold ? 'var(--danger)' : undefined, background: errors.quantity_sold ? '#fffbfa' : undefined }} />
                    </FieldLabel>
                    <FieldLabel label="Sale price total" required error={errors.sale_price}>
                      <span style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--muted)' }}>$</span>
                        <input className="control" value={form.sale_price} onChange={event => updateField('sale_price', event.target.value)} inputMode="decimal" style={{ width: '100%', padding: '0 12px 0 32px', borderColor: errors.sale_price ? 'var(--danger)' : undefined, background: errors.sale_price ? '#fffbfa' : undefined }} />
                      </span>
                    </FieldLabel>
                    <FieldLabel label="Date" required error={errors.sale_date}>
                      <input className="control" type="date" value={form.sale_date} onChange={event => updateField('sale_date', event.target.value)} style={{ width: '100%', padding: '0 12px', borderColor: errors.sale_date ? 'var(--danger)' : undefined, background: errors.sale_date ? '#fffbfa' : undefined }} />
                    </FieldLabel>
                    <FieldLabel label="Payment method">
                      <select className="control" value={form.payment_method} onChange={event => updateField('payment_method', event.target.value as PaymentMethod)} style={{ width: '100%', padding: '0 12px' }}>
                        {PAYMENT_METHODS.map(method => (
                          <option key={method} value={method}>{PAYMENT_METHOD_LABELS[method]}</option>
                        ))}
                      </select>
                    </FieldLabel>
                  </FormGrid>

                  <FieldLabel label="Notes">
                    <textarea className="control" rows={3} value={form.notes} onChange={event => updateField('notes', event.target.value)} style={{ width: '100%', height: 'auto', padding: 12, resize: 'vertical' }} />
                  </FieldLabel>
                </div>
              </FormSection>

              <aside className="sticky-side-panel" style={{ display: 'grid', gap: 14 }}>
                <section className="card" style={{ padding: 20 }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Sale summary</h2>
                  <p style={{ margin: '4px 0 16px', color: 'var(--muted)', fontSize: 12.5 }}>{selectedItem?.title ?? 'No item selected'}</p>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <span style={{ color: 'var(--muted)' }}>Listed total</span>
                      <strong>{selectedItem ? <MoneyDisplay value={recommendedTotal(selectedItem, quantity)} /> : '-'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <span style={{ color: 'var(--muted)' }}>Sale total</span>
                      <strong><MoneyDisplay value={saleTotal} /></strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <span style={{ color: 'var(--muted)' }}>Handled by</span>
                      <strong>{user?.username}</strong>
                    </div>

                    <PermissionGate minRole="MANAGER" fallback={
                      <div style={{ background: 'var(--neutral-bg)', borderRadius: 12, padding: '10px 12px', color: 'var(--muted)', fontSize: 13 }}>
                        Profit preview hidden for this role.
                      </div>
                    }>
                      <>
                        {selectedItem?.owner_type === 'CONSIGNMENT' && (
                          <div style={{ background: 'var(--warning-bg)', border: '1px solid #f0d3a4', borderRadius: 12, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                            <span style={{ color: 'var(--warning)', fontWeight: 700 }}>Owner payout</span>
                            <strong style={{ color: 'var(--warning)' }}><MoneyDisplay value={ownerPayout} /></strong>
                          </div>
                        )}
                        <div style={{ border: '1px dashed #bcd6c9', borderRadius: 14, background: '#f3f7f4', padding: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary-hover)', fontWeight: 700 }}>
                            <CircleDollarSign size={17} />
                            Company profit
                          </div>
                          <div className="serif" style={{ marginTop: 7, color: companyProfit >= 0 ? 'var(--primary-hover)' : 'var(--danger)', fontSize: 27, fontWeight: 700 }}>
                            <MoneyDisplay value={companyProfit} />
                          </div>
                          <div style={{ color: 'var(--muted)', fontSize: 12 }}>{margin.toFixed(2)}% margin</div>
                        </div>
                      </>
                    </PermissionGate>
                  </div>
                </section>
              </aside>
            </div>

            {create.isError && <div className="error-banner">{apiErrorMessage(create.error)}</div>}

            <ActionFooter>
              <Link to="/sales" className="secondary-button">Cancel</Link>
              <button type="submit" disabled={create.isPending || !selectedItem} className="primary-button" style={{ opacity: create.isPending || !selectedItem ? .7 : 1 }}>
                <Save size={16} />
                {create.isPending ? 'Saving...' : 'Save sale'}
              </button>
            </ActionFooter>
          </form>
        </div>
      </div>
    </Layout>
  )
}
