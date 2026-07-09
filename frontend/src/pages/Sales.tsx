import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { isThisMonth, isThisWeek, isToday, parseISO } from 'date-fns'
import { Banknote, Download, FileSpreadsheet, HandCoins, Plus, Printer, ShoppingCart, TrendingUp } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { listSales } from '@/api/sales'
import { useAuth } from '@/auth/AuthContext'
import DataTable, { type Column } from '@/components/DataTable'
import DirectoryCard, { DirectorySkeleton, DirectoryToolbar, SearchBox } from '@/components/DirectoryCard'
import EmptyState from '@/components/EmptyState'
import Layout from '@/components/Layout'
import MoneyDisplay from '@/components/MoneyDisplay'
import PageHeader from '@/components/PageHeader'
import PaginationFooter from '@/components/PaginationFooter'
import ProfitBadge from '@/components/sale/ProfitBadge'
import StatusBadge from '@/components/StatusBadge'
import SummaryCard from '@/components/SummaryCard'
import { errorMessage } from '@/lib/errors'
import { PAYMENT_METHOD_LABELS, exportSalesToCsv, formatDate } from '@/lib/sales'
import type { PaymentMethod, PayoutStatus, Sale } from '@/types/sales'

type QuickFilter = 'all' | 'today' | 'week' | 'month' | 'cash' | 'mobile' | 'bank' | 'pending' | 'completed'

const QUICK_FILTERS: { key: QuickFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'cash', label: 'Cash' },
  { key: 'mobile', label: 'Mobile Money' },
  { key: 'bank', label: 'Bank' },
  { key: 'pending', label: 'Pending Payout' },
  { key: 'completed', label: 'Completed' },
]

// Which chips map to a real server-side filter (paginated correctly across all
// records) vs. a client-side refinement over just the currently loaded page
// (the API has no date-range filter and no "payment method is one of" filter).
const SERVER_PAYMENT: Partial<Record<QuickFilter, PaymentMethod>> = { cash: 'CASH', bank: 'BANK_TRANSFER' }
const SERVER_PAYOUT: Partial<Record<QuickFilter, PayoutStatus>> = { pending: 'PENDING' }

function matchesClientFilter(sale: Sale, filter: QuickFilter) {
  switch (filter) {
    case 'today': return isToday(parseISO(sale.sale_date))
    case 'week': return isThisWeek(parseISO(sale.sale_date), { weekStartsOn: 1 })
    case 'month': return isThisMonth(parseISO(sale.sale_date))
    case 'mobile': return sale.payment_method === 'EVC_PLUS' || sale.payment_method === 'ZAAD' || sale.payment_method === 'SAHAL'
    case 'completed': return sale.payout_status !== 'PENDING'
    default: return true
  }
}

const isClientOnlyFilter = (filter: QuickFilter) => ['today', 'week', 'month', 'mobile', 'completed'].includes(filter)

export default function Sales() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [search, quickFilter])

  const sales = useQuery({
    queryKey: ['sales', search, quickFilter, currentPage],
    queryFn: () => listSales({
      search: search.trim() || undefined,
      payment_method: SERVER_PAYMENT[quickFilter],
      payout_status: SERVER_PAYOUT[quickFilter],
      ordering: '-sale_date',
      page: currentPage,
    }),
  })

  const allRows = sales.data?.results ?? []
  const rows = useMemo(
    () => (isClientOnlyFilter(quickFilter) ? allRows.filter(sale => matchesClientFilter(sale, quickFilter)) : allRows),
    [allRows, quickFilter],
  )

  const columns = useMemo<Column<Sale>[]>(() => {
    const base: Column<Sale>[] = [
      {
        key: 'id',
        header: 'Sale',
        render: sale => (
          <Link to={`/sales/${sale.id}`} style={{ display: 'flex', alignItems: 'center', gap: 11, color: 'var(--text)', textDecoration: 'none' }}>
            <span style={{ width: 38, height: 38, borderRadius: 999, display: 'grid', placeItems: 'center', background: 'var(--primary-soft)', color: 'var(--primary-hover)' }}>
              <ShoppingCart size={16} />
            </span>
            <span>
              <strong style={{ display: 'block', fontWeight: 700 }}>Sale #{sale.id}</strong>
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>{formatDate(sale.sale_date)}</span>
            </span>
          </Link>
        ),
      },
      { key: 'item', header: 'Item', render: sale => <strong style={{ color: 'var(--text)' }}>{sale.item_title}</strong> },
      { key: 'buyer', header: 'Buyer', render: sale => sale.buyer_name },
      { key: 'quantity', header: 'Qty', align: 'right', render: sale => sale.quantity_sold },
      { key: 'sale_price', header: 'Amount', align: 'right', render: sale => <MoneyDisplay value={sale.sale_price} /> },
      { key: 'payment_method', header: 'Payment', render: sale => PAYMENT_METHOD_LABELS[sale.payment_method] },
    ]

    if (user?.can_view_finance) {
      base.push(
        { key: 'company_profit', header: 'Profit', align: 'right', render: sale => <ProfitBadge profit={Number(sale.company_profit)} saleTotal={Number(sale.sale_price)} /> },
        { key: 'payout_status', header: 'Payout', render: sale => <StatusBadge status={sale.payout_status} /> },
      )
    }

    base.push({ key: 'handled_by', header: 'Staff', render: sale => sale.handled_by_name })
    return base
  }, [user?.can_view_finance])

  const grossOnPage = rows.reduce((total, sale) => total + Number(sale.sale_price), 0)
  const profitOnPage = rows.reduce((total, sale) => total + Number(sale.company_profit), 0)
  const pendingOnPage = rows.filter(sale => sale.payout_status === 'PENDING').length

  return (
    <Layout>
      <div className="app-page">
        <PageHeader
          eyebrow="Manage"
          title="Sales"
          subtitle="Completed sale records, payment methods, and owner payout status."
          actions={(
            <>
              <button type="button" className="secondary-button" onClick={() => exportSalesToCsv(rows)} title="Exports the sales currently loaded on this page as a CSV file">
                <FileSpreadsheet size={16} />
                Export Excel
              </button>
              <button type="button" className="secondary-button" onClick={() => window.print()} title="Opens the browser print dialog — choose 'Save as PDF' to export">
                <Download size={16} />
                Export PDF
              </button>
              <button type="button" className="secondary-button" onClick={() => window.print()}>
                <Printer size={16} />
                Print
              </button>
              <Link to="/sales/new" className="primary-button">
                <Plus size={16} />
                New sale
              </Link>
            </>
          )}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 16 }}>
          <SummaryCard label="Sales on page" value={rows.length} caption={`${sales.data?.count ?? rows.length} total records`} icon={<ShoppingCart size={18} />} />
          <SummaryCard label="Gross on page" value={<MoneyDisplay value={grossOnPage} />} caption="Visible sale value" icon={<Banknote size={18} />} tone="blue" />
          {user?.can_view_finance && (
            <SummaryCard label="Profit on page" value={<MoneyDisplay value={profitOnPage} />} caption="Fududeeye markup" icon={<TrendingUp size={18} />} tone="amber" valueColor="var(--success)" />
          )}
          <SummaryCard label="Pending payouts" value={pendingOnPage} caption="On current page" icon={<HandCoins size={18} />} tone="red" valueColor="var(--money-owed)" />
        </div>

        <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {QUICK_FILTERS.map(filter => {
            const active = quickFilter === filter.key
            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => setQuickFilter(filter.key)}
                style={{
                  height: 34,
                  padding: '0 14px',
                  borderRadius: 999,
                  border: active ? '1px solid var(--accent-dark)' : '1px solid var(--border-strong)',
                  background: active ? 'var(--accent)' : 'var(--surface)',
                  color: active ? 'var(--accent-fg)' : 'var(--text-mid)',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background-color 150ms ease, border-color 150ms ease, transform 150ms ease',
                }}
              >
                {filter.label}
              </button>
            )
          })}
        </div>

        <DirectoryCard
          title="Sales directory"
          count={sales.data ? `${sales.data.count} total records${isClientOnlyFilter(quickFilter) ? ` · showing ${rows.length} of ${allRows.length} on this page for "${QUICK_FILTERS.find(f => f.key === quickFilter)?.label}"` : ''}` : 'Loading records'}
          toolbar={(
            <DirectoryToolbar>
              <SearchBox value={search} onChange={setSearch} placeholder="Search item, buyer, notes" />
            </DirectoryToolbar>
          )}
          footer={sales.data && (
            <PaginationFooter
              page={currentPage}
              total={sales.data.count}
              hasPrevious={!!sales.data.previous}
              hasNext={!!sales.data.next}
              onPrevious={() => setCurrentPage(page => Math.max(1, page - 1))}
              onNext={() => setCurrentPage(page => page + 1)}
            />
          )}
        >
          {sales.isLoading && <DirectorySkeleton />}
          {sales.isError && <div className="error-banner" style={{ margin: '0 18px 18px' }}>{errorMessage(sales.error)}</div>}
          {sales.data && (
            <DataTable
              columns={columns}
              rows={rows}
              variant="bare"
              empty={(
                <EmptyState
                  icon={<ShoppingCart size={18} />}
                  title="No sales found."
                  subtitle="Record your first sale or adjust the current filters."
                  action={<Link to="/sales/new" className="primary-button"><Plus size={16} />New sale</Link>}
                />
              )}
            />
          )}
        </DirectoryCard>
      </div>
    </Layout>
  )
}
