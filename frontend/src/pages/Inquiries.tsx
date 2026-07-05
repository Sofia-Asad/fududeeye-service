import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Filter, MessageCircleQuestion, PackageSearch, Tag } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { listInquiries } from '@/api/inquiries'
import DataTable, { type Column } from '@/components/DataTable'
import DirectoryCard, { DirectorySelect, DirectorySkeleton, DirectoryToolbar, SearchBox } from '@/components/DirectoryCard'
import EmptyState from '@/components/EmptyState'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import PaginationFooter from '@/components/PaginationFooter'
import StatusBadge from '@/components/StatusBadge'
import SummaryCard from '@/components/SummaryCard'
import { errorMessage } from '@/lib/errors'
import { INQUIRY_KIND_LABELS, INQUIRY_STATUS_LABELS, INQUIRY_STATUSES } from '@/lib/inquiry'
import { formatDate } from '@/lib/service'
import type { Inquiry, InquiryKind, InquiryStatus } from '@/types/inquiry'

type StatusFilter = 'all' | InquiryStatus
type KindFilter = 'all' | InquiryKind

export default function Inquiries() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [kind, setKind] = useState<KindFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [search, status, kind])

  const inquiries = useQuery({
    queryKey: ['inquiries', search, status, kind, currentPage],
    queryFn: () => listInquiries({
      search: search.trim() || undefined,
      status: status === 'all' ? undefined : status,
      kind: kind === 'all' ? undefined : kind,
      ordering: '-created_at',
      page: currentPage,
    }),
  })

  const rows = inquiries.data?.results ?? []
  const newOnPage = rows.filter(inquiry => inquiry.status === 'NEW').length
  const interestOnPage = rows.filter(inquiry => inquiry.kind === 'ITEM_INTEREST').length
  const requestOnPage = rows.filter(inquiry => inquiry.kind === 'ITEM_REQUEST').length

  const columns: Column<Inquiry>[] = [
    {
      key: 'contact',
      header: 'Contact',
      render: inquiry => (
        <Link to={`/inquiries/${inquiry.id}`} style={{ display: 'flex', alignItems: 'center', gap: 11, color: 'var(--text)', textDecoration: 'none' }}>
          <span style={{ width: 38, height: 38, borderRadius: 999, display: 'grid', placeItems: 'center', background: 'var(--info-bg)', color: 'var(--info)' }}>
            <MessageCircleQuestion size={16} />
          </span>
          <span>
            <strong style={{ display: 'block', fontWeight: 700 }}>{inquiry.full_name}</strong>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>{inquiry.phone}</span>
          </span>
        </Link>
      ),
    },
    { key: 'kind', header: 'Type', render: inquiry => INQUIRY_KIND_LABELS[inquiry.kind] },
    {
      key: 'about',
      header: 'About',
      render: inquiry => inquiry.item
        ? <Link to={`/items/${inquiry.item}`} style={{ color: 'var(--primary-hover)', fontWeight: 600 }}>{inquiry.item_title}</Link>
        : (inquiry.item_needed || '-'),
    },
    { key: 'status', header: 'Status', render: inquiry => <StatusBadge status={inquiry.status} /> },
    { key: 'handled_by', header: 'Handled by', render: inquiry => inquiry.handled_by_name || '-' },
    { key: 'created_at', header: 'Received', render: inquiry => formatDate(inquiry.created_at) },
  ]

  return (
    <Layout>
      <div className="app-page">
        <PageHeader
          eyebrow="Manage"
          title="Inquiries"
          subtitle="Leads submitted from the public marketplace site — item interest and item requests."
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 16 }}>
          <SummaryCard label="Total inquiries" value={inquiries.data?.count ?? rows.length} caption="All leads" icon={<MessageCircleQuestion size={18} />} />
          <SummaryCard label="New on page" value={newOnPage} caption="Not yet contacted" icon={<MessageCircleQuestion size={18} />} tone="amber" />
          <SummaryCard label="Item interest" value={interestOnPage} caption="Asking about a listing" icon={<Tag size={18} />} tone="blue" />
          <SummaryCard label="Item requests" value={requestOnPage} caption="Looking for something" icon={<PackageSearch size={18} />} tone="primary" />
        </div>

        <DirectoryCard
          title="Inquiry directory"
          count={inquiries.data ? `${inquiries.data.count} total records` : 'Loading records'}
          toolbar={(
            <DirectoryToolbar>
              <SearchBox value={search} onChange={setSearch} placeholder="Search name, phone, email" />
              <DirectorySelect value={kind} onChange={value => setKind(value as KindFilter)} ariaLabel="Inquiry type">
                <option value="all">All types</option>
                <option value="ITEM_INTEREST">{INQUIRY_KIND_LABELS.ITEM_INTEREST}</option>
                <option value="ITEM_REQUEST">{INQUIRY_KIND_LABELS.ITEM_REQUEST}</option>
                <option value="GENERAL">{INQUIRY_KIND_LABELS.GENERAL}</option>
              </DirectorySelect>
              <DirectorySelect value={status} onChange={value => setStatus(value as StatusFilter)} ariaLabel="Inquiry status">
                <option value="all">All statuses</option>
                {INQUIRY_STATUSES.map(nextStatus => (
                  <option key={nextStatus} value={nextStatus}>{INQUIRY_STATUS_LABELS[nextStatus]}</option>
                ))}
              </DirectorySelect>
              <button type="button" className="primary-button" onClick={() => setCurrentPage(1)}>
                <Filter size={16} />
                Filter
              </button>
            </DirectoryToolbar>
          )}
          footer={inquiries.data && (
            <PaginationFooter
              page={currentPage}
              total={inquiries.data.count}
              hasPrevious={!!inquiries.data.previous}
              hasNext={!!inquiries.data.next}
              onPrevious={() => setCurrentPage(page => Math.max(1, page - 1))}
              onNext={() => setCurrentPage(page => page + 1)}
            />
          )}
        >
          {inquiries.isLoading && <DirectorySkeleton />}
          {inquiries.isError && <div className="error-banner" style={{ margin: '0 18px 18px' }}>{errorMessage(inquiries.error)}</div>}
          {inquiries.data && (
            <DataTable
              columns={columns}
              rows={rows}
              variant="bare"
              empty={(
                <EmptyState
                  icon={<MessageCircleQuestion size={18} />}
                  title="No inquiries found."
                  subtitle="No leads from the marketplace site match the current filters."
                />
              )}
            />
          )}
        </DirectoryCard>
      </div>
    </Layout>
  )
}
