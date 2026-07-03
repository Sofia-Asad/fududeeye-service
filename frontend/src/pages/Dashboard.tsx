import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import {
  Area,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Banknote, ClipboardList, HandCoins, Package, ShoppingCart, TrendingUp } from 'lucide-react'

import { api } from '@/api/client'
import { useAuth } from '@/auth/AuthContext'
import DataTable, { type Column } from '@/components/DataTable'
import DirectoryCard from '@/components/DirectoryCard'
import Layout from '@/components/Layout'
import MoneyDisplay from '@/components/MoneyDisplay'
import PageHeader from '@/components/PageHeader'
import PermissionGate from '@/components/PermissionGate'
import StatusBadge from '@/components/StatusBadge'
import SummaryCard from '@/components/SummaryCard'

interface PeriodSummary {
  sales_count: number
  income: string
  profit: string
  refunds: string
}

interface RecentSale {
  id: number
  item: string
  buyer: string
  quantity_sold: number
  sale_price: string
  company_profit: string
  sale_date: string
  payment_method: string
  handled_by: string
}

interface DashboardResponse {
  counts: {
    customers: number
    active_items: number
    open_demands: number
    open_complaints: number
    pending_payouts: number
  }
  today_sales_count: number
  today_profit: string
  today: PeriodSummary
  week: PeriodSummary
  month: PeriodSummary
  pending_payouts_total: string
  open_complaints: number
  open_demands: number
  recent_sales: RecentSale[]
}

function moneyShort(value: string | number) {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return '$0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    notation: Math.abs(numberValue) >= 10000 ? 'compact' : 'standard',
  }).format(numberValue)
}

const saleColumns: Column<RecentSale>[] = [
  {
    key: 'item',
    header: 'Item',
    render: sale => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 38, height: 38, borderRadius: 999, display: 'grid', placeItems: 'center', background: 'var(--primary-soft)', color: 'var(--primary-hover)' }}>
          <ShoppingCart size={16} />
        </span>
        <span>
          <strong style={{ display: 'block', color: 'var(--text)', fontWeight: 700 }}>{sale.item}</strong>
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>Buyer: {sale.buyer}</span>
        </span>
      </div>
    ),
  },
  { key: 'method', header: 'Method', render: sale => sale.payment_method },
  { key: 'sale_price', header: 'Amount', align: 'right', render: sale => <MoneyDisplay value={sale.sale_price} /> },
  { key: 'handled_by', header: 'Staff', render: sale => sale.handled_by },
]

function MiniCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--primary)' }} />
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const dashboard = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get<DashboardResponse>('/reports/dashboard/')
      return response.data
    },
    enabled: !!user?.can_view_finance,
  })

  const restrictedFallback = (
    <Layout>
      <div className="app-page">
        <PageHeader
          eyebrow="Overview"
          title="Dashboard"
          subtitle="Your role cannot view finance dashboard data."
        />
        <div className="card" style={{ padding: 22, color: 'var(--muted)' }}>
          Sales staff can continue from Items, Customers, Sales, Demands, or Complaints.
        </div>
      </div>
    </Layout>
  )

  const errorStatus = dashboard.error instanceof AxiosError
    ? dashboard.error.response?.status
    : undefined

  return (
    <PermissionGate minRole="MANAGER" fallback={restrictedFallback}>
      <Layout>
        <div className="app-page">
          <PageHeader
            eyebrow="Overview"
            title="Dashboard"
            subtitle="Live brokerage performance, inventory movement, and owner payout pressure."
          />

          {dashboard.isLoading && (
            <div className="card" style={{ padding: 22 }}>
              <div style={{ display: 'grid', gap: 14 }}>
                <span className="skeleton-row" style={{ width: '34%' }} />
                <span className="skeleton-row" style={{ width: '76%' }} />
                <span className="skeleton-row" style={{ width: '58%' }} />
              </div>
            </div>
          )}

          {dashboard.isError && (
            <div className="error-banner">
              Dashboard request failed{errorStatus ? ` (${errorStatus})` : ''}.
            </div>
          )}

          {dashboard.data && (
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
                <SummaryCard
                  label="Month income"
                  value={moneyShort(dashboard.data.month.income)}
                  caption={<span style={{ color: 'var(--success)' }}>+ {dashboard.data.month.sales_count} sales this month</span>}
                  icon={<Banknote size={19} />}
                />
                <SummaryCard
                  label="Fududeeye profit"
                  value={moneyShort(dashboard.data.month.profit)}
                  caption={<span style={{ color: 'var(--success)' }}>Today profit {moneyShort(dashboard.data.today_profit)}</span>}
                  icon={<TrendingUp size={19} />}
                  tone="amber"
                  valueColor="var(--success)"
                />
                <SummaryCard
                  label="Pending payouts"
                  value={moneyShort(dashboard.data.pending_payouts_total)}
                  caption={`${dashboard.data.counts.pending_payouts} owner payouts need attention`}
                  icon={<HandCoins size={19} />}
                  tone="red"
                  valueColor="var(--money-owed)"
                />
                <SummaryCard
                  label="Active items"
                  value={dashboard.data.counts.active_items}
                  caption={`${dashboard.data.open_demands} open demands waiting`}
                  icon={<Package size={19} />}
                  tone="blue"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: 16 }}>
                <section className="card" style={{ padding: 20, minHeight: 330 }}>
                  <h2 style={{ margin: '0 0 2px', fontSize: 16.5, fontWeight: 700 }}>Income vs profit</h2>
                  <p style={{ margin: '0 0 16px', color: 'var(--muted)', fontSize: 12.5 }}>Today, week, and month trend from the backend summary.</p>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart
                      data={[
                        { label: 'Today', income: Number(dashboard.data.today.income), profit: Number(dashboard.data.today.profit) },
                        { label: 'Week', income: Number(dashboard.data.week.income), profit: Number(dashboard.data.week.profit) },
                        { label: 'Month', income: Number(dashboard.data.month.income), profit: Number(dashboard.data.month.profit) },
                      ]}
                      margin={{ top: 8, right: 18, left: 0, bottom: 4 }}
                    >
                      <defs>
                        <linearGradient id="incomeFill" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#17795C" stopOpacity={0.07} />
                          <stop offset="100%" stopColor="#17795C" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#EFEDE4" vertical={false} />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#75806F', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#75806F', fontSize: 12 }} tickFormatter={moneyShort} width={64} />
                      <Tooltip formatter={value => moneyShort(Number(value ?? 0))} contentStyle={{ borderRadius: 12, borderColor: '#ECEADF', fontFamily: 'Jost' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 12.5 }} />
                      <Area type="monotone" dataKey="income" fill="url(#incomeFill)" stroke="none" />
                      <Line type="monotone" dataKey="income" name="Income" stroke="#17795C" strokeWidth={3} dot={{ r: 4, fill: '#17795C' }} />
                      <Line type="monotone" dataKey="profit" name="Profit" stroke="#E8A33D" strokeWidth={3} strokeDasharray="7 6" dot={{ r: 4, fill: '#E8A33D' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </section>

                <section className="card" style={{ padding: 20, minHeight: 330 }}>
                  <h2 style={{ margin: '0 0 2px', fontSize: 16.5, fontWeight: 700 }}>Inventory mix</h2>
                  <p style={{ margin: '0 0 8px', color: 'var(--muted)', fontSize: 12.5 }}>Active items compared with open demand pressure.</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Active', value: dashboard.data.counts.active_items },
                          { name: 'Open demand', value: Math.max(dashboard.data.open_demands, 1) },
                        ]}
                        innerRadius={62}
                        outerRadius={86}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        <Cell fill="#17795C" />
                        <Cell fill="#E8DDC4" />
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#ECEADF', fontFamily: 'Jost' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ marginTop: -128, textAlign: 'center', pointerEvents: 'none' }}>
                    <div className="serif" style={{ fontSize: 27, fontWeight: 700 }}>{dashboard.data.counts.active_items}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12 }}>listed & live</div>
                  </div>
                  <div className="dashboard-mini-grid" style={{ gap: 10, marginTop: 94 }}>
                    <div style={{ borderTop: '1px solid var(--row-line)', paddingTop: 12 }}>
                      <div style={{ color: 'var(--muted)', fontSize: 12 }}>Active</div>
                      <strong>{dashboard.data.counts.active_items}</strong>
                    </div>
                    <div style={{ borderTop: '1px solid var(--row-line)', paddingTop: 12 }}>
                      <div style={{ color: 'var(--muted)', fontSize: 12 }}>Complaints</div>
                      <strong>{dashboard.data.open_complaints}</strong>
                    </div>
                  </div>
                </section>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                <MiniCard title="Overdue payouts">
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <span style={{ color: 'var(--text-mid)', fontWeight: 700 }}>Owner payouts pending</span>
                      <span className="money" style={{ color: 'var(--money-owed)' }}>{moneyShort(dashboard.data.pending_payouts_total)}</span>
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: 12.5 }}>{dashboard.data.counts.pending_payouts} payout records waiting for Manager/Admin action.</div>
                  </div>
                </MiniCard>

                <MiniCard title="Recent sales">
                  <DataTable columns={saleColumns.slice(0, 3)} rows={dashboard.data.recent_sales.slice(0, 3)} empty="No recent sales yet." variant="bare" />
                </MiniCard>

                <MiniCard title="Open demands">
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontWeight: 700 }}>
                        <ClipboardList size={17} color="var(--primary)" />
                        Demand queue
                      </span>
                      <StatusBadge status={dashboard.data.open_demands > 0 ? 'OPEN' : 'MATCHED'} />
                    </div>
                    <div className="serif" style={{ fontSize: 27, fontWeight: 700 }}>{dashboard.data.open_demands}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12.5 }}>Open requests that may match live inventory.</div>
                  </div>
                </MiniCard>
              </div>

              <DirectoryCard title="Recent sale directory" count={`${dashboard.data.recent_sales.length} latest records`}>
                <DataTable columns={saleColumns} rows={dashboard.data.recent_sales} empty="No recent sales yet." variant="bare" />
              </DirectoryCard>
            </div>
          )}
        </div>
      </Layout>
    </PermissionGate>
  )
}
