import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CircleDollarSign, Globe, Lock, Package, Pencil, Plus, Save, Tags, Trash2, X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getCustomer, listCustomers } from '@/api/customers'
import { deleteItem, getItem, listCategories, updateItem } from '@/api/inventory'
import { useAuth } from '@/auth/AuthContext'
import ActionFooter from '@/components/ActionFooter'
import DetailMeta from '@/components/DetailMeta'
import FormSection, { FieldLabel, FormGrid, MetricCallout, MoneyInput, SegmentedControl } from '@/components/FormSection'
import ItemImageManager from '@/components/ItemImageManager'
import Layout from '@/components/Layout'
import MoneyDisplay from '@/components/MoneyDisplay'
import PageHeader from '@/components/PageHeader'
import PermissionGate from '@/components/PermissionGate'
import { SkeletonLines } from '@/components/Skeleton'
import StatusBadge from '@/components/StatusBadge'
import SummaryCard from '@/components/SummaryCard'
import CustomerSelector from '@/components/wizard/CustomerSelector'
import QuickAddCustomerModal from '@/components/wizard/QuickAddCustomerModal'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { errorMessage, formErrorMessage } from '@/lib/errors'
import {
  ATTRIBUTE_FIELDS,
  CATEGORY_KIND_LABELS,
  CONDITION_LABELS,
  ITEM_CONDITIONS,
  ITEM_STATUSES,
  OWNER_TYPE_LABELS,
  STATUS_LABELS,
  attributesToFormValues,
  compactAttributes,
  formatDate,
} from '@/lib/inventory'
import { notifyError, notifySuccess } from '@/lib/toast'
import type { Item, ItemCondition, ItemStatus, OwnerType } from '@/types/inventory'

// Sold/Completed/Refunded are system-controlled (via the Sales workflow) and never
// manually selectable here — only these four remain under staff control.
const MANUAL_STATUSES = ['ACTIVE', 'RESERVED', 'DRAFT', 'WITHDRAWN'] as const

interface DetailForm {
  title: string
  description: string
  category: string
  owner_type: OwnerType
  owner: string
  owner_asking_price: string
  cost_price: string
  listed_price: string
  quantity: string
  condition: ItemCondition
  location: string
  status: ItemStatus
}

function formFromItem(item: Item): DetailForm {
  return {
    title: item.title,
    description: item.description,
    category: String(item.category),
    owner_type: item.owner_type,
    owner: item.owner ? String(item.owner) : '',
    owner_asking_price: item.owner_asking_price ?? '',
    cost_price: item.cost_price ?? '',
    listed_price: item.listed_price,
    quantity: String(item.quantity),
    condition: item.condition,
    location: item.location,
    status: item.status,
  }
}

export default function ItemDetail() {
  const { id } = useParams()
  const itemId = Number(id)
  const validItemId = Number.isFinite(itemId) && itemId > 0
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [form, setForm] = useState<DetailForm | null>(null)
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({})
  const [customerSearch, setCustomerSearch] = useState('')
  const debouncedCustomerSearch = useDebouncedValue(customerSearch)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [quickAddQuery, setQuickAddQuery] = useState('')

  const item = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => getItem(itemId),
    enabled: validItemId,
  })

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: () => listCategories({ ordering: 'name' }),
  })

  const customers = useQuery({
    queryKey: ['customers', 'item-owner-picker', debouncedCustomerSearch],
    queryFn: () => listCustomers({ is_active: true, ordering: 'full_name', search: debouncedCustomerSearch || undefined }),
    enabled: mode === 'edit' && form?.owner_type === 'CONSIGNMENT',
  })

  // The item's current owner may not be on the first page of results (or may
  // not match an in-progress search) — fetch it directly so the picker can
  // always render the existing selection and its preview card.
  const currentOwner = useQuery({
    queryKey: ['customer', item.data?.owner],
    queryFn: () => getCustomer(item.data!.owner!),
    enabled: mode === 'edit' && item.data?.owner_type === 'CONSIGNMENT' && !!item.data?.owner,
  })

  const ownerOptions = useMemo(() => {
    const results = customers.data?.results ?? []
    if (currentOwner.data && !results.some(customer => customer.id === currentOwner.data!.id)) {
      return [currentOwner.data, ...results]
    }
    return results
  }, [customers.data?.results, currentOwner.data])

  const currentItem = item.data
  const canManageInventory = user?.role === 'ADMIN' || user?.role === 'MANAGER'
  const canEdit = Boolean(currentItem && user && (canManageInventory || currentItem.created_by === user.id))

  const selectedCategory = useMemo(() => {
    if (!form) return undefined
    return (categories.data?.results ?? []).find(category => String(category.id) === form.category)
  }, [categories.data?.results, form])

  const categoryKind = selectedCategory?.kind ?? currentItem?.category_kind
  const attributeFields = categoryKind ? ATTRIBUTE_FIELDS[categoryKind] : []

  useEffect(() => {
    if (!currentItem) return
    setForm(formFromItem(currentItem))
    setAttributeValues(attributesToFormValues(currentItem.attributes, ATTRIBUTE_FIELDS[currentItem.category_kind]))
  }, [currentItem])

  const save = useMutation({
    mutationFn: (payload: DetailForm) => updateItem(itemId, {
      title: payload.title,
      description: payload.description,
      category: Number(payload.category),
      owner_type: payload.owner_type,
      owner: payload.owner_type === 'CONSIGNMENT' ? Number(payload.owner) : null,
      owner_asking_price: payload.owner_type === 'CONSIGNMENT' ? payload.owner_asking_price : null,
      cost_price: payload.owner_type === 'COMPANY' ? payload.cost_price : null,
      listed_price: payload.listed_price,
      quantity: Number(payload.quantity),
      condition: payload.condition,
      location: payload.location,
      status: canManageInventory ? payload.status : undefined,
      attributes: compactAttributes(attributeValues, attributeFields),
    }),
    onSuccess: updatedItem => {
      void queryClient.invalidateQueries({ queryKey: ['items'] })
      queryClient.setQueryData(['item', itemId], updatedItem)
      notifySuccess('Item updated')
      setMode('view')
    },
    onError: error => notifyError(formErrorMessage(error, 'Item could not be updated.')),
  })

  const changeStatus = useMutation({
    mutationFn: (status: ItemStatus) => updateItem(itemId, { status }),
    onSuccess: updatedItem => {
      void queryClient.invalidateQueries({ queryKey: ['items'] })
      queryClient.setQueryData(['item', itemId], updatedItem)
      notifySuccess('Item updated')
    },
    onError: error => notifyError(formErrorMessage(error, 'Item could not be updated.')),
  })

  const remove = useMutation({
    mutationFn: () => deleteItem(itemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['items'] })
      notifySuccess('Deleted successfully')
      navigate('/items')
    },
    onError: error => notifyError(formErrorMessage(error, 'Item could not be deleted.')),
  })

  function updateField<K extends keyof DetailForm>(field: K, value: DetailForm[K]) {
    setForm(current => {
      if (!current) return current
      const next = { ...current, [field]: value }
      if (field === 'owner_type') {
        next.owner = ''
        next.owner_asking_price = ''
        next.cost_price = ''
      }
      return next
    })
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form || !canEdit) return
    save.mutate(form)
  }

  function cancelEdit() {
    if (currentItem) {
      setForm(formFromItem(currentItem))
      setAttributeValues(attributesToFormValues(currentItem.attributes, ATTRIBUTE_FIELDS[currentItem.category_kind]))
    }
    setMode('view')
  }

  if (!validItemId) {
    return <Layout><div className="app-page"><div className="error-banner">Item not found.</div></div></Layout>
  }

  if (item.isLoading || !form) {
    return (
      <Layout>
        <div className="app-page">
          <SkeletonLines widths={['38%', '74%']} />
        </div>
      </Layout>
    )
  }

  if (item.isError || !currentItem) {
    return <Layout><div className="app-page"><div className="error-banner">{errorMessage(item.error)}</div></div></Layout>
  }

  const ownerLabel = currentItem.owner_type === 'CONSIGNMENT'
    ? currentItem.owner_name || `Customer #${currentItem.owner}`
    : 'Fududeeye company stock'
  const basePrice = currentItem.owner_type === 'CONSIGNMENT'
    ? currentItem.owner_asking_price
    : currentItem.cost_price

  const formBasePrice = form.owner_type === 'CONSIGNMENT' ? Number(form.owner_asking_price || 0) : Number(form.cost_price || 0)
  const formListedPrice = Number(form.listed_price || 0)
  const formMarkup = formListedPrice - formBasePrice

  const isPublic = form.status === 'ACTIVE'

  return (
    <Layout>
      <div className="app-page">
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <Link to="/items" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--primary-hover)', fontSize: 13, fontWeight: 700, textDecoration: 'none', marginBottom: 14 }}>
            <ArrowLeft size={16} />
            Items
          </Link>

          <PageHeader
            eyebrow="Item detail"
            title={currentItem.title}
            subtitle={`${currentItem.category_name} · ${CATEGORY_KIND_LABELS[currentItem.category_kind]} · created ${formatDate(currentItem.created_at)}`}
            actions={(
              <>
                <StatusBadge status={currentItem.status} />
                {mode === 'view' && canEdit && MANUAL_STATUSES.includes(currentItem.status as typeof MANUAL_STATUSES[number]) && (
                  <select
                    className="control"
                    value={currentItem.status}
                    onChange={event => changeStatus.mutate(event.target.value as ItemStatus)}
                    disabled={changeStatus.isPending}
                    style={{ width: 'auto', padding: '0 30px 0 12px' }}
                    aria-label="Change item status"
                  >
                    <option value="ACTIVE" disabled={!canManageInventory}>Active</option>
                    <option value="RESERVED" disabled={!canManageInventory}>Reserved</option>
                    <option value="DRAFT">Inactive</option>
                    <option value="WITHDRAWN">Withdrawn</option>
                  </select>
                )}
                {mode === 'view' && (
                  <Link to="/items/new" className="secondary-button">
                    <Plus size={16} />
                    New Item
                  </Link>
                )}
                {mode === 'view' && canEdit && (
                  <button type="button" onClick={() => setMode('edit')} className="secondary-button">
                    <Pencil size={16} />
                    Edit
                  </button>
                )}
                <PermissionGate minRole="ADMIN">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Delete this item?')) remove.mutate()
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
            <SummaryCard label="Listed price" value={<MoneyDisplay value={currentItem.listed_price} />} caption="Customer-facing price" icon={<CircleDollarSign size={18} />} />
            <SummaryCard label="Available" value={`${currentItem.quantity_available}/${currentItem.quantity}`} caption={`${currentItem.quantity_sold} sold`} icon={<Package size={18} />} tone="blue" />
            <SummaryCard label={currentItem.owner_type === 'CONSIGNMENT' ? 'Owner ask' : 'Cost'} value={basePrice ? <MoneyDisplay value={basePrice} /> : '-'} caption={OWNER_TYPE_LABELS[currentItem.owner_type]} icon={<Tags size={18} />} tone="amber" />
            <SummaryCard
              label="Marketplace visibility"
              value={currentItem.status === 'ACTIVE' ? 'Public' : 'Private'}
              caption={currentItem.status === 'ACTIVE' ? 'Visible to shoppers' : 'Not shown publicly'}
              icon={currentItem.status === 'ACTIVE' ? <Globe size={18} /> : <Lock size={18} />}
              tone={currentItem.status === 'ACTIVE' ? 'primary' : 'neutral'}
              valueColor={currentItem.status === 'ACTIVE' ? 'var(--success)' : undefined}
            />
          </div>

          <div className="content-sidebar-grid">
            {mode === 'edit' ? (
            <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
              <FormSection icon={<Package size={18} />} title="Listing details" description="Update inventory metadata and listing state.">
                <FormGrid>
                  <FieldLabel label="Title">
                    <input className="control" value={form.title} onChange={event => updateField('title', event.target.value)} style={{ width: '100%', padding: '0 12px' }} />
                  </FieldLabel>
                  <FieldLabel label="Category">
                    <select className="control" value={form.category} onChange={event => updateField('category', event.target.value)} style={{ width: '100%', padding: '0 12px' }}>
                      {(categories.data?.results ?? []).map(category => (
                        <option key={category.id} value={category.id}>{category.name} - {CATEGORY_KIND_LABELS[category.kind]}</option>
                      ))}
                    </select>
                  </FieldLabel>
                  <FieldLabel label="Quantity">
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

                {attributeFields.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ color: 'var(--muted)', fontSize: 10.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 12 }}>
                      {categoryKind ? CATEGORY_KIND_LABELS[categoryKind] : ''} fields
                    </div>
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
                  </div>
                )}

                <FieldLabel label="Description">
                  <textarea className="control" value={form.description} onChange={event => updateField('description', event.target.value)} rows={4} style={{ width: '100%', height: 'auto', padding: 12, resize: 'vertical' }} />
                </FieldLabel>
              </FormSection>

              <FormSection icon={<Tags size={18} />} title="Ownership & pricing" description="Choose whether this is company stock or a customer consignment." tone="amber">
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
                        <FieldLabel label="Owner">
                          <CustomerSelector
                            customers={ownerOptions}
                            value={form.owner}
                            onSelect={customer => updateField('owner', String(customer.id))}
                            onSearch={setCustomerSearch}
                            allowQuickAdd
                            onQuickAdd={query => { setQuickAddQuery(query); setQuickAddOpen(true) }}
                          />
                        </FieldLabel>
                        <FieldLabel label="Owner asking price">
                          <MoneyInput value={form.owner_asking_price} onChange={event => updateField('owner_asking_price', event.target.value)} />
                        </FieldLabel>
                      </>
                    ) : (
                      <FieldLabel label="Cost price">
                        <MoneyInput value={form.cost_price} onChange={event => updateField('cost_price', event.target.value)} />
                      </FieldLabel>
                    )}

                    <FieldLabel label="Listed price">
                      <MoneyInput value={form.listed_price} onChange={event => updateField('listed_price', event.target.value)} />
                    </FieldLabel>
                  </FormGrid>

                  <MetricCallout
                    icon={<CircleDollarSign size={17} />}
                    label="Expected markup"
                    value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(formMarkup)}
                    valueColor={formMarkup >= 0 ? undefined : 'var(--danger)'}
                    hint="API values are authoritative after save."
                  />
                </div>
              </FormSection>

              <PermissionGate minRole="MANAGER">
                <FormSection icon={isPublic ? <Globe size={18} /> : <Lock size={18} />} title="Visibility" description="Control whether this listing is public on the marketplace." tone={isPublic ? 'primary' : 'neutral'}>
                  <FieldLabel label="Status">
                    <select className="control" value={form.status} onChange={event => updateField('status', event.target.value as ItemStatus)} style={{ width: '100%', padding: '0 12px' }}>
                      {ITEM_STATUSES.map(status => (
                        <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                      ))}
                    </select>
                  </FieldLabel>
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: isPublic ? 'var(--success)' : 'var(--muted)' }}>
                    {isPublic ? <Globe size={16} /> : <Lock size={16} />}
                    {isPublic ? 'Visible on the public marketplace' : 'Not visible to the public'}
                  </div>
                </FormSection>
              </PermissionGate>

              {(save.isError || changeStatus.isError || remove.isError) && (
                <div className="error-banner">{formErrorMessage(save.error ?? changeStatus.error ?? remove.error, 'Item could not be updated.')}</div>
              )}

              <ActionFooter>
                <button type="button" onClick={cancelEdit} className="secondary-button">
                  <X size={16} />
                  Cancel
                </button>
                <button type="submit" disabled={save.isPending} className="primary-button" style={{ opacity: save.isPending ? .7 : 1 }}>
                  <Save size={16} />
                  {save.isPending ? 'Saving...' : 'Save changes'}
                </button>
              </ActionFooter>
            </form>
            ) : (
              <div style={{ display: 'grid', gap: 16 }}>
                <DetailMeta
                  title="Listing details"
                  rows={[
                    { label: 'Title', value: currentItem.title },
                    { label: 'Category', value: currentItem.category_name },
                    { label: 'Listed price', value: <MoneyDisplay value={currentItem.listed_price} /> },
                    { label: 'Quantity', value: `${currentItem.quantity_available}/${currentItem.quantity} available (${currentItem.quantity_sold} sold)` },
                    { label: 'Condition', value: CONDITION_LABELS[currentItem.condition] },
                    { label: 'Location', value: currentItem.location || '-' },
                    { label: 'Status', value: <StatusBadge status={currentItem.status} /> },
                    ...attributeFields.map(field => ({ label: field.label, value: attributeValues[field.key] || '-' })),
                    { label: 'Description', value: currentItem.description || '-' },
                  ]}
                />
              </div>
            )}

            <aside style={{ display: 'grid', gap: 16 }}>
              <DetailMeta
                title="Ownership"
                rows={[
                  { label: 'Owner type', value: OWNER_TYPE_LABELS[currentItem.owner_type] },
                  { label: 'Owner', value: ownerLabel },
                  { label: 'Category', value: currentItem.category_name },
                  { label: 'Location', value: currentItem.location || '-' },
                  { label: 'Created', value: formatDate(currentItem.created_at) },
                  { label: 'Updated', value: formatDate(currentItem.updated_at) },
                ]}
              />

              <ItemImageManager itemId={itemId} images={currentItem.images} canEdit={canEdit} />
            </aside>
          </div>
        </div>
      </div>

      <QuickAddCustomerModal
        open={quickAddOpen}
        initialQuery={quickAddQuery}
        onClose={() => setQuickAddOpen(false)}
        onCreated={customer => updateField('owner', String(customer.id))}
      />
    </Layout>
  )
}
