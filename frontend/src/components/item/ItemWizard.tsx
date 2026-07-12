import { useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Camera, CircleDollarSign, Eye, ImageIcon, Package, Save, Tags, UserRound } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { listCustomers } from '@/api/customers'
import { createItem, listCategories } from '@/api/inventory'
import { useAuth } from '@/auth/AuthContext'
import ActionFooter from '@/components/ActionFooter'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import AccordionCard from '@/components/wizard/AccordionCard'
import CategoryFieldRenderer from '@/components/wizard/CategoryFieldRenderer'
import FormPageHeader from '@/components/wizard/FormPageHeader'
import InfoCard from '@/components/wizard/InfoCard'
import StickySummaryPanel, { type SummaryRow } from '@/components/wizard/StickySummaryPanel'
import ItemBasicsFields from '@/components/item/ItemBasicsFields'
import OwnershipFields from '@/components/item/OwnershipFields'
import PricingFields from '@/components/item/PricingFields'
import VisibilityFields from '@/components/item/VisibilityFields'
import QuickAddCustomerModal from '@/components/wizard/QuickAddCustomerModal'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { formErrorMessage } from '@/lib/errors'
import { ATTRIBUTE_FIELDS, CATEGORY_KIND_LABELS, CONDITION_LABELS, compactAttributes } from '@/lib/inventory'
import { notifyError, notifySuccess } from '@/lib/toast'
import { fieldErrors, useFocusFirstError } from '@/lib/validation'
import type { ItemCondition, ItemStatus, OwnerType } from '@/types/inventory'

const moneyPattern = /^\d+(\.\d{1,2})?$/

const itemSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.'),
  category: z.string().trim().min(1, 'Category is required.'),
  owner_type: z.enum(['COMPANY', 'CONSIGNMENT']),
  owner: z.string().trim(),
  owner_asking_price: z.string().trim(),
  cost_price: z.string().trim(),
  listed_price: z.string().trim().regex(moneyPattern, 'Use a valid amount.'),
  quantity: z.string().trim().regex(/^[1-9]\d*$/, 'Quantity must be at least 1.'),
  condition: z.enum(['NEW', 'USED', 'REFURBISHED']),
  status: z.enum(['DRAFT', 'ACTIVE']),
  location: z.string().trim(),
  description: z.string().trim(),
}).superRefine((value, ctx) => {
  if (value.owner_type === 'CONSIGNMENT') {
    if (!value.owner) {
      ctx.addIssue({ code: 'custom', path: ['owner'], message: 'Owner is required for consignment.' })
    }
    if (!moneyPattern.test(value.owner_asking_price)) {
      ctx.addIssue({ code: 'custom', path: ['owner_asking_price'], message: 'Use a valid asking price.' })
    }
  }
  if (value.owner_type === 'COMPANY' && !moneyPattern.test(value.cost_price)) {
    ctx.addIssue({ code: 'custom', path: ['cost_price'], message: 'Use a valid cost price.' })
  }
})

type ItemFormValues = z.infer<typeof itemSchema>

const emptyForm: ItemFormValues = {
  title: '',
  category: '',
  owner_type: 'COMPANY',
  owner: '',
  owner_asking_price: '',
  cost_price: '',
  listed_price: '',
  quantity: '1',
  condition: 'USED',
  status: 'DRAFT',
  location: '',
  description: '',
}

type SectionKey = 'basics' | 'attributes' | 'ownership' | 'pricing' | 'visibility'

export default function ItemWizard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const formRef = useRef<HTMLFormElement>(null)
  const canManageInventory = user?.role === 'ADMIN' || user?.role === 'MANAGER'
  const [form, setForm] = useState<ItemFormValues>(emptyForm)
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [openSection, setOpenSection] = useState<SectionKey | null>('basics')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [forceDraft, setForceDraft] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const debouncedCustomerSearch = useDebouncedValue(customerSearch)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [quickAddQuery, setQuickAddQuery] = useState('')

  useFocusFirstError(errors, formRef)

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: () => listCategories({ ordering: 'name' }),
  })

  const customers = useQuery({
    queryKey: ['customers', 'item-owner-picker', debouncedCustomerSearch],
    queryFn: () => listCustomers({ is_active: true, ordering: 'full_name', search: debouncedCustomerSearch || undefined }),
    enabled: form.owner_type === 'CONSIGNMENT',
  })

  const selectedCategory = useMemo(
    () => (categories.data?.results ?? []).find(category => String(category.id) === form.category),
    [categories.data?.results, form.category],
  )
  const attributeFields = selectedCategory ? ATTRIBUTE_FIELDS[selectedCategory.kind] : []

  const create = useMutation({
    mutationFn: createItem,
    onSuccess: item => {
      notifySuccess(item.status === 'DRAFT' ? 'Item saved as draft' : 'Item saved')
      navigate(`/items/${item.id}`)
    },
    onError: error => notifyError(formErrorMessage(error, 'Item could not be saved.')),
  })

  function toggleSection(key: SectionKey) {
    setOpenSection(current => (current === key ? null : key))
  }

  // Non-generic on purpose: every field in this form is a string (or a string
  // union read from a <select>), and this is passed as a prop to child
  // section components — a generic `<K>` signature doesn't survive that
  // structurally, since each child only knows its own narrower field-key type.
  function updateField(field: keyof ItemFormValues, value: string) {
    setForm(current => {
      const next = { ...current, [field]: value } as ItemFormValues
      if (field === 'owner_type') {
        next.owner = ''
        next.owner_asking_price = ''
        next.cost_price = ''
      }
      if (field === 'category') {
        setAttributeValues({})
      }
      return next
    })
    setErrors(current => ({ ...current, [field]: '' }))
  }

  function buildPayload(value: ItemFormValues, statusOverride?: ItemStatus) {
    const ownerType = value.owner_type as OwnerType
    return {
      title: value.title,
      description: value.description,
      category: Number(value.category),
      owner_type: ownerType,
      owner: ownerType === 'CONSIGNMENT' ? Number(value.owner) : null,
      owner_asking_price: ownerType === 'CONSIGNMENT' ? value.owner_asking_price : null,
      cost_price: ownerType === 'COMPANY' ? value.cost_price : null,
      listed_price: value.listed_price,
      quantity: Number(value.quantity),
      condition: value.condition as ItemCondition,
      status: statusOverride ?? ((canManageInventory ? value.status : 'DRAFT') as ItemStatus),
      location: value.location,
      attributes: compactAttributes(attributeValues, attributeFields),
    }
  }

  function validateOrShowErrors(): ItemFormValues | null {
    const parsed = itemSchema.safeParse(form)
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return null
    }
    return parsed.data
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = validateOrShowErrors()
    if (!value) return
    create.mutate(buildPayload(value, forceDraft ? 'DRAFT' : undefined))
  }

  function saveDraft() {
    setForceDraft(true)
    const value = validateOrShowErrors()
    if (!value) return
    create.mutate(buildPayload(value, 'DRAFT'))
  }

  const basePriceValue = form.owner_type === 'CONSIGNMENT' ? form.owner_asking_price : form.cost_price
  const basePrice = Number(basePriceValue || 0)
  const listedPrice = Number(form.listed_price || 0)
  const profit = listedPrice - basePrice

  const basicsDone = Boolean(form.title && form.category && form.quantity)
  const attributesDone = Boolean(selectedCategory) && Object.values(attributeValues).some(Boolean)
  const ownershipDone = form.owner_type === 'CONSIGNMENT'
    ? Boolean(form.owner && form.owner_asking_price)
    : Boolean(form.cost_price)
  const pricingDone = Boolean(form.listed_price)

  const createdByName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username || 'Staff'
  const today = new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date())

  const summaryRows: SummaryRow[] = [
    { label: 'Title', value: form.title || '—' },
    { label: 'Category', value: selectedCategory ? `${selectedCategory.name}` : '—' },
    { label: 'Owner', value: form.owner_type === 'CONSIGNMENT' ? (customers.data?.results.find(c => String(c.id) === form.owner)?.full_name ?? 'Not selected') : 'Company' },
    { label: 'Status', value: <StatusBadge status={form.status} /> },
    { label: 'Expected profit', value: listedPrice > 0 ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(profit) : '—', emphasis: true },
    { label: 'Selling price', value: form.listed_price ? `$${form.listed_price}` : '—' },
    { label: 'Quantity', value: form.quantity || '—' },
    { label: 'Created by', value: createdByName },
  ]

  return (
    <div className="app-page">
      <div className="app-page-narrow" style={{ maxWidth: 1120 }}>
        <FormPageHeader
          backTo="/items"
          icon={<Package size={18} />}
          title="New Item"
          breadcrumb={[{ label: 'Items', to: '/items' }, { label: 'New Item' }]}
          createdBy={createdByName}
          date={today}
        />

        <form ref={formRef} onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
          <div className="content-sidebar-grid">
            <div style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
              <AccordionCard
                icon={<Package size={18} />}
                title="Item Basics"
                description="Title, category, condition, and quantity."
                isOpen={openSection === 'basics'}
                isDone={basicsDone}
                onToggle={() => toggleSection('basics')}
              >
                <ItemBasicsFields
                  values={form}
                  errors={errors}
                  categories={categories.data?.results ?? []}
                  onChange={updateField}
                />
              </AccordionCard>

              {selectedCategory && attributeFields.length > 0 && (
                <div className="fade-slide-in">
                  <AccordionCard
                    icon={<Tags size={18} />}
                    title="Category Details"
                    description={`${CATEGORY_KIND_LABELS[selectedCategory.kind]}-specific attributes.`}
                    isOpen={openSection === 'attributes'}
                    isDone={attributesDone}
                    onToggle={() => toggleSection('attributes')}
                  >
                    <CategoryFieldRenderer
                      fields={attributeFields}
                      values={attributeValues}
                      onChange={(key, value) => setAttributeValues(current => ({ ...current, [key]: value }))}
                    />
                  </AccordionCard>
                </div>
              )}

              <AccordionCard
                icon={<UserRound size={18} />}
                title="Ownership"
                description="Company stock or a customer consignment."
                isOpen={openSection === 'ownership'}
                isDone={ownershipDone}
                onToggle={() => toggleSection('ownership')}
              >
                <OwnershipFields
                  values={form}
                  errors={errors}
                  customers={customers.data?.results ?? []}
                  onChange={updateField}
                  onSearchCustomers={setCustomerSearch}
                  onQuickAddCustomer={query => {
                    setQuickAddQuery(query)
                    setQuickAddOpen(true)
                  }}
                />
              </AccordionCard>

              <AccordionCard
                icon={<CircleDollarSign size={18} />}
                title="Pricing"
                description="Cost or asking price against the selling price."
                isOpen={openSection === 'pricing'}
                isDone={pricingDone}
                onToggle={() => toggleSection('pricing')}
              >
                <PricingFields
                  ownerType={form.owner_type}
                  basePriceField={form.owner_type === 'CONSIGNMENT' ? 'owner_asking_price' : 'cost_price'}
                  basePriceValue={basePriceValue}
                  basePriceError={form.owner_type === 'CONSIGNMENT' ? errors.owner_asking_price : errors.cost_price}
                  listedPrice={form.listed_price}
                  listedPriceError={errors.listed_price}
                  onChangeBasePrice={value => updateField(form.owner_type === 'CONSIGNMENT' ? 'owner_asking_price' : 'cost_price', value)}
                  onChangeListedPrice={value => updateField('listed_price', value)}
                />
              </AccordionCard>

              <AccordionCard
                icon={form.status === 'ACTIVE' ? <Eye size={18} /> : <Package size={18} />}
                title="Marketplace Visibility"
                description="Control whether this listing is public."
                isOpen={openSection === 'visibility'}
                isDone
                onToggle={() => toggleSection('visibility')}
              >
                <VisibilityFields status={form.status} onChange={value => updateField('status', value)} />
              </AccordionCard>
            </div>

            <StickySummaryPanel icon={<Eye size={18} />} title="Item Preview" subtitle="Updates live as you fill the form" rows={summaryRows}>
              <InfoCard
                dashed
                icon={<ImageIcon size={20} />}
                title="Photos"
                description="Photos will be uploaded after saving this item."
              />
            </StickySummaryPanel>
          </div>

          {create.isError && <div className="error-banner">{formErrorMessage(create.error, 'Item could not be saved.')}</div>}

          <ActionFooter
            note={!canManageInventory && 'Sales role can only submit as Draft.'}
          >
            <Link to="/items" className="secondary-button">Cancel</Link>
            <button type="button" onClick={saveDraft} disabled={create.isPending} className="secondary-button">
              Save Draft
            </button>
            <button type="button" onClick={() => setPreviewOpen(true)} className="secondary-button">
              <Camera size={16} />
              Preview
            </button>
            <button type="submit" disabled={create.isPending || categories.isLoading} className="wizard-gold-button" style={{ opacity: create.isPending ? .7 : 1 }}>
              <Save size={16} />
              {create.isPending ? 'Saving...' : 'Create Item'}
            </button>
          </ActionFooter>
        </form>
      </div>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Listing preview" description="How this item will look once created — nothing is saved yet.">
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{form.title || 'Untitled item'}</h3>
            <StatusBadge status={form.status} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', color: 'var(--muted)', fontSize: 12.5 }}>
            <span>{selectedCategory?.name ?? 'No category'}</span>
            <span>·</span>
            <span>{CONDITION_LABELS[form.condition]}</span>
            <span>·</span>
            <span>Qty {form.quantity || 0}</span>
            {form.location && <><span>·</span><span>{form.location}</span></>}
          </div>
          <div className="serif" style={{ fontSize: 26, fontWeight: 700, color: 'var(--primary-hover)' }}>
            {form.listed_price ? `$${form.listed_price}` : 'No price set'}
          </div>
          {form.description && <p style={{ margin: 0, color: 'var(--text-mid)', fontSize: 13, lineHeight: 1.5 }}>{form.description}</p>}
          {Object.entries(compactAttributes(attributeValues, attributeFields)).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {Object.entries(compactAttributes(attributeValues, attributeFields)).map(([key, val]) => (
                <span key={key} style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: 'var(--neutral-bg)', color: 'var(--neutral)' }}>
                  {key}: {String(val)}
                </span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setPreviewOpen(false)} className="secondary-button">Close preview</button>
          </div>
        </div>
      </Modal>

      <QuickAddCustomerModal
        open={quickAddOpen}
        initialQuery={quickAddQuery}
        onClose={() => setQuickAddOpen(false)}
        onCreated={customer => updateField('owner', String(customer.id))}
      />
    </div>
  )
}
