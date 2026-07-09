import { useMemo, useRef, useState, useEffect, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CreditCard, Eye, FileText, ShoppingCart } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { listCustomers } from '@/api/customers'
import { listItems } from '@/api/inventory'
import { createSale } from '@/api/sales'
import { useAuth } from '@/auth/AuthContext'
import ActionFooter from '@/components/ActionFooter'
import FormSection, { FieldLabel, FormGrid, MoneyInput } from '@/components/FormSection'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import FormPageHeader from '@/components/wizard/FormPageHeader'
import PricingSummary from '@/components/wizard/PricingSummary'
import StickySummaryPanel, { type SummaryRow } from '@/components/wizard/StickySummaryPanel'
import BuyerPickerPanel from '@/components/sale/BuyerPickerPanel'
import InventoryPanel from '@/components/sale/InventoryPanel'
import ItemPickerPanel from '@/components/sale/ItemPickerPanel'
import SaleConfirmModal from '@/components/sale/SaleConfirmModal'
import SaleSuccessScreen from '@/components/sale/SaleSuccessScreen'
import { formErrorMessage } from '@/lib/errors'
import { PAYMENT_METHOD_LABELS, PAYMENT_METHODS, decimalString, formatDate, todayISO } from '@/lib/sales'
import { notifyError, notifySuccess } from '@/lib/toast'
import { fieldErrors, useFocusFirstError } from '@/lib/validation'
import type { Item } from '@/types/inventory'
import type { PaymentMethod, Sale } from '@/types/sales'

const moneyPattern = /^\d+(\.\d{1,2})?$/

const saleSchema = z.object({
  item: z.string().trim().min(1, 'Item is required.'),
  buyer: z.string().trim().min(1, 'Buyer is required.'),
  quantity_sold: z.string().trim().regex(/^[1-9]\d*$/, 'Quantity must be at least 1.'),
  sale_price: z.string().trim().regex(moneyPattern, 'Use a valid amount.'),
  sale_date: z.string().trim().min(1, 'Date is required.'),
  payment_method: z.enum(['CASH', 'EVC_PLUS', 'ZAAD', 'SAHAL', 'BANK_TRANSFER', 'OTHER']),
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

const DRAFT_KEY = 'fududeeye:new-sale-draft'

function recommendedTotal(item: Item, quantity: number) {
  return Number(item.listed_price) * quantity
}

export default function SaleWizard() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  // Prefill from a "Convert to Sale" lead action (see InquiryDetail) — an
  // explicit hand-off, so it takes priority over any locally-saved draft.
  const prefillItem = searchParams.get('item') ?? ''
  const prefillBuyer = searchParams.get('buyer') ?? ''
  const formRef = useRef<HTMLFormElement>(null)
  const [form, setForm] = useState<SaleForm>(() => ({
    ...emptyForm,
    item: prefillItem || emptyForm.item,
    buyer: prefillBuyer || emptyForm.buyer,
  }))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewOpen, setPreviewOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [completedSale, setCompletedSale] = useState<Sale | null>(null)

  useFocusFirstError(errors, formRef)

  useEffect(() => {
    if (prefillItem || prefillBuyer) return
    const saved = localStorage.getItem(DRAFT_KEY)
    if (!saved) return
    try {
      setForm(JSON.parse(saved) as SaleForm)
      notifySuccess('Restored your saved draft.')
    } catch {
      localStorage.removeItem(DRAFT_KEY)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const items = useQuery({
    queryKey: ['items', 'sale-picker'],
    queryFn: () => listItems({ status: 'ACTIVE', ordering: 'title' }),
  })

  useEffect(() => {
    if (!prefillItem) return
    const item = (items.data?.results ?? []).find(candidate => String(candidate.id) === prefillItem)
    if (!item) return
    setForm(current => (current.sale_price ? current : { ...current, sale_price: decimalString(recommendedTotal(item, Number(current.quantity_sold) || 1)) }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.data])

  const buyers = useQuery({
    queryKey: ['customers', 'sale-buyer-picker'],
    queryFn: () => listCustomers({ is_active: true, ordering: 'full_name' }),
  })

  const selectedItem = useMemo(
    () => (items.data?.results ?? []).find(item => String(item.id) === form.item),
    [form.item, items.data?.results],
  )
  const selectedBuyer = useMemo(
    () => (buyers.data?.results ?? []).find(customer => String(customer.id) === form.buyer),
    [form.buyer, buyers.data?.results],
  )

  const canViewFinance = user?.role === 'ADMIN' || user?.role === 'MANAGER'
  const quantity = Number(form.quantity_sold) || 1
  const saleTotal = Number(form.sale_price) || 0
  const unitPrice = quantity > 0 ? saleTotal / quantity : 0
  const baseUnit = selectedItem?.owner_type === 'CONSIGNMENT'
    ? Number(selectedItem.owner_asking_price ?? 0)
    : Number(selectedItem?.cost_price ?? 0)
  const ownerPayout = selectedItem?.owner_type === 'CONSIGNMENT' ? baseUnit * quantity : 0
  const companyProfit = saleTotal - baseUnit * quantity
  const predictedPayoutStatus = selectedItem?.owner_type === 'CONSIGNMENT' ? 'PENDING' : 'NA'

  const create = useMutation({
    mutationFn: createSale,
    onSuccess: sale => {
      localStorage.removeItem(DRAFT_KEY)
      setConfirmOpen(false)
      setCompletedSale(sale)
    },
    onError: error => {
      setConfirmOpen(false)
      notifyError(formErrorMessage(error, 'Sale could not be saved.'))
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

  function validateOrShowErrors() {
    const parsed = saleSchema.safeParse(form)
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return null
    }
    return parsed.data
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validateOrShowErrors()) return
    setConfirmOpen(true)
  }

  function confirmSale() {
    if (!user) return
    const value = validateOrShowErrors()
    if (!value) return
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

  function saveDraft() {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
    notifySuccess('Draft saved on this device.')
  }

  if (completedSale) {
    return <SaleSuccessScreen sale={completedSale} />
  }

  const today = new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date())
  const createdByName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username || 'Staff'

  const summaryRows: SummaryRow[] = [
    { label: 'Item', value: selectedItem?.title ?? 'Not selected' },
    { label: 'Buyer', value: selectedBuyer?.full_name ?? 'Not selected' },
    { label: 'Unit price', value: unitPrice > 0 ? `$${unitPrice.toFixed(2)}` : '—' },
    { label: 'Quantity', value: String(quantity) },
    { label: 'Sale total', value: saleTotal > 0 ? `$${saleTotal.toFixed(2)}` : '—', emphasis: true },
    ...(canViewFinance ? [
      { label: 'Company profit', value: selectedItem ? `$${companyProfit.toFixed(2)}` : '—' },
      { label: 'Owner payout', value: selectedItem ? `$${ownerPayout.toFixed(2)}` : '—' },
    ] : []),
    { label: 'Payment method', value: PAYMENT_METHOD_LABELS[form.payment_method] },
    { label: 'Sale status', value: <StatusBadge status={predictedPayoutStatus} /> },
  ]

  return (
    <div className="app-page">
      <div className="app-page-narrow" style={{ maxWidth: 1120 }}>
        <FormPageHeader
          backTo="/sales"
          icon={<ShoppingCart size={18} />}
          title="New Sale"
          breadcrumb={[{ label: 'Sales', to: '/sales' }, { label: 'New Sale' }]}
          createdBy={createdByName}
          date={today}
        />

        <form ref={formRef} onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
          <div className="content-sidebar-grid">
            <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
              <FormSection icon={<ShoppingCart size={18} />} title="Sale Information" description="Choose the item, buyer, and quantity being sold.">
                <div style={{ display: 'grid', gap: 14 }}>
                  <FieldLabel label="Item" required error={errors.item} name="item">
                    <ItemPickerPanel
                      items={(items.data?.results ?? []).filter(item => item.quantity_available > 0)}
                      value={form.item}
                      error={!!errors.item}
                      onSelect={item => updateField('item', String(item.id))}
                    />
                  </FieldLabel>

                  <FieldLabel label="Buyer" required error={errors.buyer} name="buyer">
                    <BuyerPickerPanel
                      customers={buyers.data?.results ?? []}
                      value={form.buyer}
                      error={!!errors.buyer}
                      onSelect={customer => updateField('buyer', String(customer.id))}
                    />
                  </FieldLabel>

                  <FieldLabel label="Quantity" required error={errors.quantity_sold} name="quantity_sold">
                    <input className="control" value={form.quantity_sold} onChange={event => updateField('quantity_sold', event.target.value)} inputMode="numeric" style={{ width: '100%', padding: '0 12px' }} />
                  </FieldLabel>

                  {selectedItem && (
                    <InventoryPanel available={selectedItem.quantity_available} requested={quantity} />
                  )}
                </div>
              </FormSection>

              <FormSection icon={<CreditCard size={18} />} title="Payment Information" description="Sale price, payment method, and date." tone="blue">
                <FormGrid>
                  <FieldLabel label="Sale price total" required error={errors.sale_price} name="sale_price">
                    <MoneyInput value={form.sale_price} onChange={event => updateField('sale_price', event.target.value)} />
                  </FieldLabel>
                  <FieldLabel label="Payment method">
                    <select className="control" value={form.payment_method} onChange={event => updateField('payment_method', event.target.value as PaymentMethod)} style={{ width: '100%', padding: '0 12px' }}>
                      {PAYMENT_METHODS.map(method => (
                        <option key={method} value={method}>{PAYMENT_METHOD_LABELS[method]}</option>
                      ))}
                    </select>
                  </FieldLabel>
                  <FieldLabel label="Sale date" required error={errors.sale_date} name="sale_date">
                    <input className="control" type="date" value={form.sale_date} onChange={event => updateField('sale_date', event.target.value)} style={{ width: '100%', padding: '0 12px' }} />
                  </FieldLabel>
                </FormGrid>

                {selectedItem && (
                  <div style={{ marginTop: 14 }}>
                    <PricingSummary
                      basePrice={baseUnit * quantity}
                      listedPrice={saleTotal}
                      profitLabel="Company profit"
                      extraRows={canViewFinance ? [
                        { label: 'Cost / asking price', value: `$${(baseUnit * quantity).toFixed(2)}` },
                        { label: 'Owner payout', value: `$${ownerPayout.toFixed(2)}` },
                        { label: 'Company earnings', value: `$${companyProfit.toFixed(2)}` },
                      ] : undefined}
                    />
                  </div>
                )}
              </FormSection>

              <FormSection icon={<FileText size={18} />} title="Additional Notes" description="Optional context for this sale." tone="neutral">
                <textarea className="control" rows={3} value={form.notes} onChange={event => updateField('notes', event.target.value)} style={{ width: '100%', height: 'auto', padding: 10, resize: 'vertical' }} />
              </FormSection>
            </div>

            <StickySummaryPanel icon={<Eye size={18} />} title="Sale Summary" subtitle="Updates live as you fill the form" rows={summaryRows} />
          </div>

          {create.isError && <div className="error-banner">{formErrorMessage(create.error, 'Sale could not be saved.')}</div>}

          <ActionFooter>
            <Link to="/sales" className="secondary-button">Cancel</Link>
            <button type="button" onClick={saveDraft} className="secondary-button">Save Draft</button>
            <button type="button" onClick={() => setPreviewOpen(true)} className="secondary-button">
              <Eye size={16} />
              Preview Sale
            </button>
            <button type="submit" disabled={create.isPending || !selectedItem} className="wizard-gold-button" style={{ opacity: create.isPending || !selectedItem ? .7 : 1 }}>
              Complete Sale
            </button>
          </ActionFooter>
        </form>
      </div>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Sale preview" description="How this sale will look once completed — nothing is saved yet.">
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Item</span><strong>{selectedItem?.title ?? '—'}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Buyer</span><strong>{selectedBuyer?.full_name ?? '—'}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Quantity</span><strong>{quantity}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Total</span><strong>${saleTotal.toFixed(2)}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Payment</span><strong>{PAYMENT_METHOD_LABELS[form.payment_method]}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Date</span><strong>{formatDate(form.sale_date)}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={() => setPreviewOpen(false)} className="secondary-button">Close preview</button>
          </div>
        </div>
      </Modal>

      <SaleConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmSale}
        isPending={create.isPending}
        showFinance={canViewFinance}
        details={{
          itemTitle: selectedItem?.title ?? '—',
          buyerName: selectedBuyer?.full_name ?? '—',
          quantity,
          total: `$${saleTotal.toFixed(2)}`,
          companyProfit: `$${companyProfit.toFixed(2)}`,
          ownerPayout: `$${ownerPayout.toFixed(2)}`,
          paymentMethodLabel: PAYMENT_METHOD_LABELS[form.payment_method],
          date: formatDate(form.sale_date),
        }}
      />
    </div>
  )
}
