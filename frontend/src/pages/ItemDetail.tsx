import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CircleDollarSign, ImageIcon, Package, Save, Tags, Trash2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import { deleteItem, getItem, listCategories, updateItem } from '@/api/inventory'
import { useAuth } from '@/auth/AuthContext'
import ActionFooter from '@/components/ActionFooter'
import DetailMeta from '@/components/DetailMeta'
import FormSection, { FieldLabel, FormGrid } from '@/components/FormSection'
import Layout from '@/components/Layout'
import MoneyDisplay from '@/components/MoneyDisplay'
import PageHeader from '@/components/PageHeader'
import PermissionGate from '@/components/PermissionGate'
import StatusBadge from '@/components/StatusBadge'
import SummaryCard from '@/components/SummaryCard'
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
import type { Item, ItemCondition, ItemStatus } from '@/types/inventory'

interface DetailForm {
  title: string
  description: string
  category: string
  listed_price: string
  quantity: string
  condition: ItemCondition
  location: string
  status: ItemStatus
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

function apiErrorMessage(error: unknown) {
  if (!(error instanceof AxiosError)) {
    return 'Item could not be updated.'
  }
  const data = error.response?.data
  if (data && typeof data === 'object') {
    return Object.entries(data)
      .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : String(messages)}`)
      .join(' ')
  }
  return error.response?.status ? `Item could not be updated (${error.response.status}).` : 'Item could not be updated.'
}

function formFromItem(item: Item): DetailForm {
  return {
    title: item.title,
    description: item.description,
    category: String(item.category),
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
  const [form, setForm] = useState<DetailForm | null>(null)
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({})

  const item = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => getItem(itemId),
    enabled: validItemId,
  })

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: () => listCategories({ ordering: 'name' }),
  })

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
    },
  })

  const withdraw = useMutation({
    mutationFn: () => updateItem(itemId, { status: 'WITHDRAWN' }),
    onSuccess: updatedItem => {
      void queryClient.invalidateQueries({ queryKey: ['items'] })
      queryClient.setQueryData(['item', itemId], updatedItem)
    },
  })

  const remove = useMutation({
    mutationFn: () => deleteItem(itemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['items'] })
      navigate('/items')
    },
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form || !canEdit) return
    save.mutate(form)
  }

  if (!validItemId) {
    return <Layout><div className="app-page"><div className="error-banner">Item not found.</div></div></Layout>
  }

  if (item.isLoading || !form) {
    return (
      <Layout>
        <div className="app-page">
          <section className="card" style={{ padding: 22, display: 'grid', gap: 14 }}>
            <span className="skeleton-row" style={{ width: '38%' }} />
            <span className="skeleton-row" style={{ width: '74%' }} />
          </section>
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
                {canEdit && currentItem.status !== 'WITHDRAWN' && (
                  <button type="button" onClick={() => withdraw.mutate()} disabled={withdraw.isPending} className="secondary-button" style={{ opacity: withdraw.isPending ? .7 : 1 }}>
                    {withdraw.isPending ? 'Withdrawing...' : 'Withdraw'}
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
            <SummaryCard label="Expected profit" value={currentItem.expected_profit_per_unit ? <MoneyDisplay value={currentItem.expected_profit_per_unit} /> : '-'} caption="Per unit before sale" icon={<CircleDollarSign size={18} />} tone="primary" valueColor="var(--success)" />
          </div>

          <div className="content-sidebar-grid">
            <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
              <FormSection icon={<Package size={18} />} title="Listing details" description={canEdit ? 'Update inventory metadata and listing state.' : 'This record is read-only for your role.'}>
                <FormGrid>
                  <FieldLabel label="Title">
                    <input disabled={!canEdit} className="control" value={form.title} onChange={event => setForm(current => current && ({ ...current, title: event.target.value }))} style={{ width: '100%', padding: '0 12px' }} />
                  </FieldLabel>
                  <FieldLabel label="Category">
                    <select disabled={!canEdit} className="control" value={form.category} onChange={event => setForm(current => current && ({ ...current, category: event.target.value }))} style={{ width: '100%', padding: '0 12px' }}>
                      {(categories.data?.results ?? []).map(category => (
                        <option key={category.id} value={category.id}>{category.name} - {CATEGORY_KIND_LABELS[category.kind]}</option>
                      ))}
                    </select>
                  </FieldLabel>
                  <FieldLabel label="Listed price">
                    <span style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--muted)' }}>$</span>
                      <input disabled={!canEdit} className="control" value={form.listed_price} onChange={event => setForm(current => current && ({ ...current, listed_price: event.target.value }))} inputMode="decimal" style={{ width: '100%', padding: '0 12px 0 32px' }} />
                    </span>
                  </FieldLabel>
                  <FieldLabel label="Quantity">
                    <input disabled={!canEdit} className="control" value={form.quantity} onChange={event => setForm(current => current && ({ ...current, quantity: event.target.value }))} inputMode="numeric" style={{ width: '100%', padding: '0 12px' }} />
                  </FieldLabel>
                  <FieldLabel label="Condition">
                    <select disabled={!canEdit} className="control" value={form.condition} onChange={event => setForm(current => current && ({ ...current, condition: event.target.value as ItemCondition }))} style={{ width: '100%', padding: '0 12px' }}>
                      {ITEM_CONDITIONS.map(condition => (
                        <option key={condition} value={condition}>{CONDITION_LABELS[condition]}</option>
                      ))}
                    </select>
                  </FieldLabel>
                  <FieldLabel label="Location">
                    <input disabled={!canEdit} className="control" value={form.location} onChange={event => setForm(current => current && ({ ...current, location: event.target.value }))} style={{ width: '100%', padding: '0 12px' }} />
                  </FieldLabel>
                  <PermissionGate minRole="MANAGER">
                    <FieldLabel label="Status">
                      <select className="control" value={form.status} onChange={event => setForm(current => current && ({ ...current, status: event.target.value as ItemStatus }))} style={{ width: '100%', padding: '0 12px' }}>
                        {ITEM_STATUSES.map(status => (
                          <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                        ))}
                      </select>
                    </FieldLabel>
                  </PermissionGate>
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
                            <select disabled={!canEdit} className="control" value={attributeValues[field.key] ?? ''} onChange={event => setAttributeValues(current => ({ ...current, [field.key]: event.target.value }))} style={{ width: '100%', padding: '0 12px' }}>
                              <option value="">Choose</option>
                              {(field.options ?? []).map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : (
                            <input disabled={!canEdit} className="control" value={attributeValues[field.key] ?? ''} onChange={event => setAttributeValues(current => ({ ...current, [field.key]: event.target.value }))} inputMode={field.type === 'number' ? 'numeric' : undefined} style={{ width: '100%', padding: '0 12px' }} />
                          )}
                        </FieldLabel>
                      ))}
                    </FormGrid>
                  </div>
                )}

                <FieldLabel label="Description">
                  <textarea disabled={!canEdit} className="control" value={form.description} onChange={event => setForm(current => current && ({ ...current, description: event.target.value }))} rows={4} style={{ width: '100%', height: 'auto', padding: 12, resize: 'vertical' }} />
                </FieldLabel>
              </FormSection>

              {(save.isError || withdraw.isError || remove.isError) && (
                <div className="error-banner">{apiErrorMessage(save.error ?? withdraw.error ?? remove.error)}</div>
              )}

              {canEdit && (
                <ActionFooter>
                  <Link to="/items" className="secondary-button">Cancel</Link>
                  <button type="submit" disabled={save.isPending} className="primary-button" style={{ opacity: save.isPending ? .7 : 1 }}>
                    <Save size={16} />
                    {save.isPending ? 'Saving...' : 'Save changes'}
                  </button>
                </ActionFooter>
              )}
            </form>

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

              <section className="card" style={{ padding: 20 }}>
                <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700 }}>Images</h2>
                {currentItem.images.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
                    {currentItem.images.map(image => (
                      <img key={image.id} src={image.image} alt={currentItem.title} style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 12, border: '1px solid var(--border)' }} />
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'grid', placeItems: 'center', gap: 8, minHeight: 140, color: 'var(--muted)', textAlign: 'center' }}>
                    <span style={{ width: 42, height: 42, borderRadius: 999, display: 'grid', placeItems: 'center', background: 'var(--neutral-bg)', color: 'var(--neutral)' }}>
                      <ImageIcon size={18} />
                    </span>
                    No images uploaded.
                  </div>
                )}
              </section>
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  )
}
