import { useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CircleDollarSign, Globe, Lock, Package, Save, Tags } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { listCustomers } from '@/api/customers'
import { createItem, listCategories } from '@/api/inventory'
import { useAuth } from '@/auth/AuthContext'
import ActionFooter from '@/components/ActionFooter'
import FormSection, { FieldLabel, FormGrid, MetricCallout, MoneyInput, SegmentedControl } from '@/components/FormSection'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import PermissionGate from '@/components/PermissionGate'
import { formErrorMessage } from '@/lib/errors'
import {
  ATTRIBUTE_FIELDS,
  CATEGORY_KIND_LABELS,
  CONDITION_LABELS,
  ITEM_CONDITIONS,
  compactAttributes,
} from '@/lib/inventory'
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

export default function NewItem() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const formRef = useRef<HTMLFormElement>(null)
  const canManageInventory = user?.role === 'ADMIN' || user?.role === 'MANAGER'
  const [form, setForm] = useState<ItemFormValues>(emptyForm)
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useFocusFirstError(errors, formRef)

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: () => listCategories({ ordering: 'name' }),
  })

  const customers = useQuery({
    queryKey: ['customers', 'item-owner-picker'],
    queryFn: () => listCustomers({ is_active: true, ordering: 'full_name' }),
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
      notifySuccess('Item saved')
      navigate(`/items/${item.id}`)
    },
    onError: error => notifyError(formErrorMessage(error, 'Item could not be saved.')),
  })

  const basePrice = form.owner_type === 'CONSIGNMENT' ? Number(form.owner_asking_price || 0) : Number(form.cost_price || 0)
  const listedPrice = Number(form.listed_price || 0)
  const expectedMarkup = listedPrice - basePrice
  const markupReady = listedPrice > 0 && basePrice >= 0

  function updateField<K extends keyof ItemFormValues>(field: K, value: ItemFormValues[K]) {
    setForm(current => {
      const next = { ...current, [field]: value }
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

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = itemSchema.safeParse(form)
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }

    const value = parsed.data
    const ownerType = value.owner_type as OwnerType
    create.mutate({
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
      status: (canManageInventory ? value.status : 'DRAFT') as ItemStatus,
      location: value.location,
      attributes: compactAttributes(attributeValues, attributeFields),
    })
  }

  return (
    <Layout>
      <div className="app-page">
        <div className="app-page-narrow">
          <Link to="/items" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--primary-hover)', fontSize: 13, fontWeight: 700, textDecoration: 'none', marginBottom: 14 }}>
            <ArrowLeft size={16} />
            Items
          </Link>

          <PageHeader
            eyebrow="Manage"
            title="New item"
            subtitle="Category and owner type control the fields below."
          />

          <form ref={formRef} onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
            <FormSection icon={<Package size={18} />} title="Item basics" description="Describe the inventory record and where it will be tracked.">
              <FormGrid>
                <FieldLabel label="Title" required error={errors.title} name="title">
                  <input className="control" value={form.title} onChange={event => updateField('title', event.target.value)} style={{ width: '100%', padding: '0 12px' }} />
                </FieldLabel>
                <FieldLabel label="Category" required error={errors.category} name="category">
                  <select className="control" value={form.category} onChange={event => updateField('category', event.target.value)} style={{ width: '100%', padding: '0 12px' }}>
                    <option value="">Choose category</option>
                    {(categories.data?.results ?? []).map(category => (
                      <option key={category.id} value={category.id}>{category.name} - {CATEGORY_KIND_LABELS[category.kind]}</option>
                    ))}
                  </select>
                </FieldLabel>
                <FieldLabel label="Quantity" required error={errors.quantity} name="quantity">
                  <input className="control" value={form.quantity} onChange={event => updateField('quantity', event.target.value)} inputMode="numeric" style={{ width: '100%', padding: '0 12px' }} />
                </FieldLabel>
                <FieldLabel label="Condition">
                  <select className="control" value={form.condition} onChange={event => updateField('condition', event.target.value as ItemCondition)} style={{ width: '100%', padding: '0 12px' }}>
                    {ITEM_CONDITIONS.map(condition => (
                      <option key={condition} value={condition}>{CONDITION_LABELS[condition]}</option>
                    ))}
                  </select>
                </FieldLabel>
                <FieldLabel label="Location">
                  <input className="control" value={form.location} onChange={event => updateField('location', event.target.value)} style={{ width: '100%', padding: '0 12px' }} />
                </FieldLabel>
              </FormGrid>
              <FieldLabel label="Description" helper="Optional customer-facing notes for this item.">
                <textarea className="control" value={form.description} onChange={event => updateField('description', event.target.value)} rows={4} style={{ width: '100%', height: 'auto', padding: 12, resize: 'vertical' }} />
              </FieldLabel>
            </FormSection>

            <FormSection icon={<Tags size={18} />} title="Ownership" description="Choose whether this is company stock or a customer consignment." tone="amber">
              <div style={{ display: 'grid', gap: 16 }}>
                <FieldLabel label="Owner type">
                  <SegmentedControl
                    value={form.owner_type}
                    onChange={value => updateField('owner_type', value)}
                    options={[
                      { value: 'COMPANY', label: 'Company stock' },
                      { value: 'CONSIGNMENT', label: 'Consignment' },
                    ]}
                  />
                </FieldLabel>

                <FormGrid>
                  {form.owner_type === 'CONSIGNMENT' ? (
                    <>
                      <FieldLabel label="Owner" required error={errors.owner} name="owner">
                        <select className="control" value={form.owner} onChange={event => updateField('owner', event.target.value)} style={{ width: '100%', padding: '0 12px' }}>
                          <option value="">Choose customer</option>
                          {(customers.data?.results ?? []).map(customer => (
                            <option key={customer.id} value={customer.id}>{customer.full_name} - {customer.phone}</option>
                          ))}
                        </select>
                      </FieldLabel>
                      <FieldLabel label="Owner asking price" required error={errors.owner_asking_price} name="owner_asking_price">
                        <MoneyInput value={form.owner_asking_price} onChange={event => updateField('owner_asking_price', event.target.value)} />
                      </FieldLabel>
                    </>
                  ) : (
                    <FieldLabel label="Cost price" required error={errors.cost_price} name="cost_price">
                      <MoneyInput value={form.cost_price} onChange={event => updateField('cost_price', event.target.value)} />
                    </FieldLabel>
                  )}

                  <FieldLabel label="Listed price" required error={errors.listed_price} name="listed_price">
                    <MoneyInput value={form.listed_price} onChange={event => updateField('listed_price', event.target.value)} />
                  </FieldLabel>
                </FormGrid>

                <MetricCallout
                  icon={<CircleDollarSign size={17} />}
                  label="Expected markup"
                  value={markupReady ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expectedMarkup) : '$0.00'}
                  valueColor={expectedMarkup >= 0 ? undefined : 'var(--danger)'}
                  hint="API values are authoritative after save."
                />
              </div>
            </FormSection>

            <PermissionGate minRole="MANAGER" fallback={(
              <FormSection icon={<Lock size={18} />} title="Visibility" description="Sales staff submit as Draft — a Manager or Admin can publish it." tone="neutral">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>
                  <Lock size={16} />
                  Saved as Draft — not visible to the public
                </div>
              </FormSection>
            )}>
              <FormSection icon={form.status === 'ACTIVE' ? <Globe size={18} /> : <Lock size={18} />} title="Visibility" description="Control whether this listing is public on the marketplace." tone={form.status === 'ACTIVE' ? 'primary' : 'neutral'}>
                <FieldLabel label="Publish status">
                  <SegmentedControl
                    value={form.status}
                    onChange={value => updateField('status', value)}
                    options={[
                      { value: 'DRAFT', label: 'Save as Draft' },
                      { value: 'ACTIVE', label: 'Publish Now' },
                    ]}
                  />
                </FieldLabel>
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: form.status === 'ACTIVE' ? 'var(--success)' : 'var(--muted)' }}>
                  {form.status === 'ACTIVE' ? <Globe size={16} /> : <Lock size={16} />}
                  {form.status === 'ACTIVE' ? 'Will be visible on the public marketplace immediately' : 'Kept private until you publish it'}
                </div>
              </FormSection>
            </PermissionGate>

            {attributeFields.length > 0 && (
              <FormSection icon={<Tags size={18} />} title={`${selectedCategory ? CATEGORY_KIND_LABELS[selectedCategory.kind] : ''} fields`} description="Category-specific attributes improve matching and filtering." tone="blue">
                <FormGrid>
                  {attributeFields.map(field => (
                    <FieldLabel key={field.key} label={field.label}>
                      {field.type === 'select' ? (
                        <select className="control" value={attributeValues[field.key] ?? ''} onChange={event => setAttributeValues(current => ({ ...current, [field.key]: event.target.value }))} style={{ width: '100%', padding: '0 12px' }}>
                          <option value="">Choose</option>
                          {(field.options ?? []).map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input className="control" value={attributeValues[field.key] ?? ''} onChange={event => setAttributeValues(current => ({ ...current, [field.key]: event.target.value }))} inputMode={field.type === 'number' ? 'numeric' : undefined} style={{ width: '100%', padding: '0 12px' }} />
                      )}
                    </FieldLabel>
                  ))}
                </FormGrid>
              </FormSection>
            )}

            {create.isError && <div className="error-banner">{formErrorMessage(create.error, 'Item could not be saved.')}</div>}

            <ActionFooter
              note={(
                <>
                  {!canManageInventory && 'Sales role can only submit as Draft. '}
                  You can add photos on the next screen once this item is created.
                </>
              )}
            >
              <Link to="/items" className="secondary-button">Cancel</Link>
              <button type="submit" disabled={create.isPending || categories.isLoading} className="primary-button" style={{ opacity: create.isPending ? .7 : 1 }}>
                <Save size={16} />
                {create.isPending ? 'Saving...' : 'Create item'}
              </button>
            </ActionFooter>
          </form>
        </div>
      </div>
    </Layout>
  )
}
