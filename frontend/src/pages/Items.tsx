import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Filter, Package, Plus, Tags, Warehouse } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createCategory, listCategories, listItems } from '@/api/inventory'
import DataTable, { type Column } from '@/components/DataTable'
import DirectoryCard, { DirectorySelect, DirectorySkeleton, DirectoryToolbar, SearchBox } from '@/components/DirectoryCard'
import EmptyState from '@/components/EmptyState'
import Layout from '@/components/Layout'
import MoneyDisplay from '@/components/MoneyDisplay'
import PageHeader from '@/components/PageHeader'
import PaginationFooter from '@/components/PaginationFooter'
import PermissionGate from '@/components/PermissionGate'
import StatusBadge from '@/components/StatusBadge'
import SummaryCard from '@/components/SummaryCard'
import { errorMessage } from '@/lib/errors'
import {
  CATEGORY_KIND_LABELS,
  ITEM_STATUSES,
  OWNER_TYPE_LABELS,
  STATUS_LABELS,
  formatDate,
} from '@/lib/inventory'
import { notifyError, notifySuccess } from '@/lib/toast'
import type { CategoryKind, Item, ItemStatus, OwnerType } from '@/types/inventory'

type StatusFilter = 'all' | ItemStatus
type OwnerFilter = 'all' | OwnerType

function itemIcon(title: string) {
  return title.trim().slice(0, 1).toUpperCase() || 'I'
}

export default function Items() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<number | null>(null)
  const [status, setStatus] = useState<StatusFilter>('all')
  const [ownerType, setOwnerType] = useState<OwnerFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [categoryName, setCategoryName] = useState('')
  const [categoryKind, setCategoryKind] = useState<CategoryKind>('GENERIC')

  useEffect(() => {
    setCurrentPage(1)
  }, [search, category, status, ownerType])

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: () => listCategories({ ordering: 'name' }),
  })

  const items = useQuery({
    queryKey: ['items', search, category, status, ownerType, currentPage],
    queryFn: () => listItems({
      search: search.trim() || undefined,
      category: category ?? undefined,
      status: status === 'all' ? undefined : status,
      owner_type: ownerType === 'all' ? undefined : ownerType,
      ordering: '-created_at',
      page: currentPage,
    }),
  })

  const addCategory = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      setCategoryName('')
      setCategoryKind('GENERIC')
      void queryClient.invalidateQueries({ queryKey: ['categories'] })
      notifySuccess('Category saved')
    },
    onError: error => notifyError(errorMessage(error)),
  })

  const rows = items.data?.results ?? []
  const activeCount = rows.filter(item => item.status === 'ACTIVE').length
  const reservedCount = rows.filter(item => item.status === 'RESERVED').length
  const consignmentCount = rows.filter(item => item.owner_type === 'CONSIGNMENT').length

  const columns: Column<Item>[] = [
    {
      key: 'title',
      header: 'Item',
      render: item => (
        <Link to={`/items/${item.id}`} style={{ display: 'flex', alignItems: 'center', gap: 11, color: 'var(--text)', textDecoration: 'none' }}>
          <span style={{ width: 38, height: 38, borderRadius: 999, display: 'grid', placeItems: 'center', background: 'var(--primary-soft)', color: 'var(--primary-hover)', fontWeight: 700 }}>
            {itemIcon(item.title)}
          </span>
          <span>
            <strong style={{ display: 'block', fontWeight: 700 }}>{item.title}</strong>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>{item.category_name || 'Uncategorized'}</span>
          </span>
        </Link>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      render: item => (
        <div style={{ display: 'grid', gap: 4 }}>
          <span>{item.owner_type === 'CONSIGNMENT' ? item.owner_name || `Customer #${item.owner}` : 'Fududeeye stock'}</span>
          <span
            style={{
              width: 'fit-content',
              fontSize: 11.5,
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 999,
              background: item.owner_type === 'CONSIGNMENT' ? 'var(--warning-bg)' : 'var(--primary-soft)',
              color: item.owner_type === 'CONSIGNMENT' ? 'var(--warning)' : 'var(--primary-hover)',
            }}
          >
            {item.owner_type === 'CONSIGNMENT' ? 'Consignment' : 'Company stock'}
          </span>
        </div>
      ),
    },
    { key: 'listed_price', header: 'Listed', align: 'right', render: item => <MoneyDisplay value={item.listed_price} /> },
    {
      key: 'markup',
      header: 'Expected profit',
      align: 'right',
      render: item => item.expected_profit_per_unit
        ? <span style={{ color: 'var(--success)' }}><MoneyDisplay value={item.expected_profit_per_unit} /></span>
        : '-',
    },
    { key: 'quantity', header: 'Qty', align: 'right', render: item => `${item.quantity_available}/${item.quantity}` },
    { key: 'status', header: 'Status', render: item => <StatusBadge status={item.status} /> },
    { key: 'created_at', header: 'Created', render: item => formatDate(item.created_at) },
  ]

  function submitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = categoryName.trim()
    if (!name) return
    addCategory.mutate({ name, parent: null, kind: categoryKind })
  }

  return (
    <Layout>
      <div className="app-page">
        <PageHeader
          eyebrow="Manage"
          title="Items"
          subtitle="Inventory listed for sale, reserved stock, and consignment owner records."
          actions={(
            <Link to="/items/new" className="primary-button">
              <Plus size={16} />
              Add item
            </Link>
          )}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 16 }}>
          <SummaryCard label="Total items" value={items.data?.count ?? rows.length} caption="Inventory records" icon={<Package size={18} />} />
          <SummaryCard label="Active on page" value={activeCount} caption="Listed and live" icon={<Warehouse size={18} />} tone="blue" />
          <SummaryCard label="Reserved" value={reservedCount} caption="Held for a buyer" icon={<Package size={18} />} tone="amber" />
          <SummaryCard label="Consignment" value={consignmentCount} caption="Customer-owned items" icon={<Tags size={18} />} tone="neutral" />
        </div>

        <DirectoryCard
          title="Item directory"
          count={items.data ? `${items.data.count} total records` : 'Loading records'}
          toolbar={(
            <DirectoryToolbar>
              <SearchBox value={search} onChange={setSearch} placeholder="Search title, owner, location" />
              <DirectorySelect value={category ?? 'all'} onChange={value => setCategory(value === 'all' ? null : Number(value))} ariaLabel="Category">
                <option value="all">All categories</option>
                {(categories.data?.results ?? []).map(nextCategory => (
                  <option key={nextCategory.id} value={nextCategory.id}>{nextCategory.name}</option>
                ))}
              </DirectorySelect>
              <DirectorySelect value={status} onChange={value => setStatus(value as StatusFilter)} ariaLabel="Item status">
                <option value="all">All statuses</option>
                {ITEM_STATUSES.map(nextStatus => (
                  <option key={nextStatus} value={nextStatus}>{STATUS_LABELS[nextStatus]}</option>
                ))}
              </DirectorySelect>
              <DirectorySelect value={ownerType} onChange={value => setOwnerType(value as OwnerFilter)} ariaLabel="Owner type">
                <option value="all">All owners</option>
                {(['COMPANY', 'CONSIGNMENT'] as OwnerType[]).map(nextOwnerType => (
                  <option key={nextOwnerType} value={nextOwnerType}>{OWNER_TYPE_LABELS[nextOwnerType]}</option>
                ))}
              </DirectorySelect>
              <button type="button" className="primary-button" onClick={() => setCurrentPage(1)}>
                <Filter size={16} />
                Filter
              </button>
            </DirectoryToolbar>
          )}
          footer={items.data && (
            <PaginationFooter
              page={currentPage}
              total={items.data.count}
              hasPrevious={!!items.data.previous}
              hasNext={!!items.data.next}
              onPrevious={() => setCurrentPage(page => Math.max(1, page - 1))}
              onNext={() => setCurrentPage(page => page + 1)}
            />
          )}
        >
          {categories.isError && <div className="error-banner" style={{ margin: '0 18px 12px' }}>{errorMessage(categories.error)}</div>}
          {items.isLoading && <DirectorySkeleton />}
          {items.isError && <div className="error-banner" style={{ margin: '0 18px 18px' }}>{errorMessage(items.error)}</div>}
          {items.data && (
            <DataTable
              columns={columns}
              rows={rows}
              variant="bare"
              empty={(
                <EmptyState
                  icon={<Package size={18} />}
                  title="No items found."
                  subtitle="Add your first inventory item or adjust the current filters."
                  action={<Link to="/items/new" className="primary-button"><Plus size={16} />Add item</Link>}
                />
              )}
            />
          )}
        </DirectoryCard>

        <PermissionGate minRole="MANAGER">
          <form onSubmit={submitCategory} className="card inline-form-grid">
            <label className="field-label">
              <span className="field-title">Category name</span>
              <input
                className="control"
                value={categoryName}
                onChange={event => setCategoryName(event.target.value)}
                placeholder="Category name"
              />
            </label>
            <label className="field-label">
              <span className="field-title">Kind</span>
              <select className="control" value={categoryKind} onChange={event => setCategoryKind(event.target.value as CategoryKind)}>
                {Object.entries(CATEGORY_KIND_LABELS).map(([kind, label]) => (
                  <option key={kind} value={kind}>{label}</option>
                ))}
              </select>
            </label>
            <button type="submit" disabled={addCategory.isPending} className="primary-button" style={{ opacity: addCategory.isPending ? .7 : 1 }}>
              {addCategory.isPending ? 'Adding...' : 'Add category'}
            </button>
            {addCategory.isError && (
              <div className="error-banner" style={{ gridColumn: '1 / -1' }}>{errorMessage(addCategory.error)}</div>
            )}
          </form>
        </PermissionGate>
      </div>
    </Layout>
  )
}
