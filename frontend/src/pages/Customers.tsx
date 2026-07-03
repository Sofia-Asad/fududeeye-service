import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Filter, Plus, UserPlus, UsersRound } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import { listCustomers } from '@/api/customers'
import DataTable, { type Column } from '@/components/DataTable'
import DirectoryCard, { DirectorySelect, DirectorySkeleton, DirectoryToolbar, SearchBox } from '@/components/DirectoryCard'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import PaginationFooter from '@/components/PaginationFooter'
import StatusBadge from '@/components/StatusBadge'
import SummaryCard from '@/components/SummaryCard'
import type { Customer } from '@/types/customer'

type ActiveFilter = 'all' | 'active' | 'inactive'

function customerStatus(customer: Customer) {
  return customer.is_active ? 'ACTIVE' : 'INACTIVE'
}

function customerRoles(customer: Customer) {
  const roles = []
  if (customer.is_buyer) roles.push('Buyer')
  if (customer.is_seller) roles.push('Seller')
  return roles.length ? roles : ['New']
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

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

export default function Customers() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [search, activeFilter])

  const customers = useQuery({
    queryKey: ['customers', search, activeFilter, currentPage],
    queryFn: () => listCustomers({
      search: search.trim() || undefined,
      is_active: activeFilter === 'all' ? undefined : activeFilter === 'active',
      ordering: 'full_name',
      page: currentPage,
    }),
  })

  const rows = customers.data?.results ?? []
  const activeOnPage = rows.filter(customer => customer.is_active).length
  const buyerOnPage = rows.filter(customer => customer.is_buyer).length
  const sellerOnPage = rows.filter(customer => customer.is_seller).length

  const columns: Column<Customer>[] = [
    {
      key: 'full_name',
      header: 'Customer',
      render: customer => (
        <Link to={`/customers/${customer.id}`} style={{ display: 'flex', alignItems: 'center', gap: 11, color: 'var(--text)', textDecoration: 'none' }}>
          <span style={{ width: 38, height: 38, borderRadius: 999, display: 'grid', placeItems: 'center', background: 'var(--primary-soft)', color: 'var(--primary-hover)', fontSize: 12, fontWeight: 700 }}>
            {initials(customer.full_name)}
          </span>
          <span>
            <strong style={{ display: 'block', fontWeight: 700 }}>{customer.full_name}</strong>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>{customer.phone}</span>
          </span>
        </Link>
      ),
    },
    { key: 'email', header: 'Email', render: customer => customer.email || '-' },
    {
      key: 'roles',
      header: 'Relationship',
      render: customer => (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {customerRoles(customer).map(role => (
            <span
              key={role}
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: 999,
                background: role === 'Buyer' ? 'var(--info-bg)' : role === 'Seller' ? 'var(--warning-bg)' : 'var(--neutral-bg)',
                color: role === 'Buyer' ? 'var(--info)' : role === 'Seller' ? 'var(--warning)' : 'var(--neutral)',
              }}
            >
              {role}
            </span>
          ))}
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: customer => <StatusBadge status={customerStatus(customer)} /> },
    {
      key: 'updated_at',
      header: 'Updated',
      render: customer => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(customer.updated_at)),
    },
  ]

  return (
    <Layout>
      <div className="app-page">
        <PageHeader
          eyebrow="Manage"
          title="Customers"
          subtitle="Buyers, sellers, and consignment owners in one directory."
          actions={(
            <Link to="/customers/new" className="primary-button">
              <Plus size={16} />
              New customer
            </Link>
          )}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 16 }}>
          <SummaryCard label="Total customers" value={customers.data?.count ?? rows.length} caption="Directory records" icon={<UsersRound size={18} />} />
          <SummaryCard label="Active on page" value={activeOnPage} caption="Available for new records" icon={<UserPlus size={18} />} tone="blue" />
          <SummaryCard label="Buyer profiles" value={buyerOnPage} caption="On current page" icon={<UsersRound size={18} />} tone="amber" />
          <SummaryCard label="Seller profiles" value={sellerOnPage} caption="On current page" icon={<UsersRound size={18} />} tone="neutral" />
        </div>

        <DirectoryCard
          title="Customer directory"
          count={customers.data ? `${customers.data.count} total records` : 'Loading records'}
          toolbar={(
            <DirectoryToolbar>
              <SearchBox value={search} onChange={setSearch} placeholder="Search name, phone, email" />
              <DirectorySelect value={activeFilter} onChange={value => setActiveFilter(value as ActiveFilter)} ariaLabel="Customer status">
                <option value="all">All customers</option>
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
              </DirectorySelect>
              <button type="button" className="primary-button" onClick={() => setCurrentPage(1)}>
                <Filter size={16} />
                Filter
              </button>
            </DirectoryToolbar>
          )}
          footer={customers.data && (
            <PaginationFooter
              page={currentPage}
              total={customers.data.count}
              hasPrevious={!!customers.data.previous}
              hasNext={!!customers.data.next}
              onPrevious={() => setCurrentPage(page => Math.max(1, page - 1))}
              onNext={() => setCurrentPage(page => page + 1)}
            />
          )}
        >
          {customers.isLoading && <DirectorySkeleton />}
          {customers.isError && <div className="error-banner" style={{ margin: '0 18px 18px' }}>{errorMessage(customers.error)}</div>}
          {customers.data && <DataTable columns={columns} rows={rows} empty="No customers found." variant="bare" />}
        </DirectoryCard>
      </div>
    </Layout>
  )
}
