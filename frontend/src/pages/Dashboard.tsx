import Layout from '@/components/Layout'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'

const revenueData = [
  { month: 'Jan', v: 34200 },
  { month: 'Feb', v: 37800 },
  { month: 'Mar', v: 31500 },
  { month: 'Apr', v: 42100 },
  { month: 'May', v: 45300 },
  { month: 'Jun', v: 43025 },
]

const demandData = [
  { cat: 'Electronics', n: 44 },
  { cat: 'Furniture', n: 37 },
  { cat: 'Vehicles', n: 18 },
  { cat: 'Appliances', n: 18 },
  { cat: 'Property', n: 11 },
]

const recentSales = [
  { item: 'Toyota Vitz 2008', buyer: 'Cabdiraxmaan Nuur', amount: '$4,800.00', date: 'Jun 18', staff: 'Axmed' },
  { item: 'iPhone 11 64GB', buyer: 'Mukhtaar Siyaad', amount: '$290.00', date: 'Jun 11', staff: 'Hodan' },
  { item: 'Generator 5kVA', buyer: 'Cali Jaamac', amount: '$540.00', date: 'Jun 8', staff: 'Hodan' },
  { item: 'Dining table set', buyer: 'Naciima Daahir', amount: '$260.00', date: 'Jun 10', staff: 'Yuusuf' },
  { item: 'Dell Latitude 5490', buyer: 'Cabdullahi Faarax', amount: '$230.00', date: 'Jun 22', staff: 'Axmed' },
]

const pendingPayouts = [
  { owner: 'Khadija Maxamed', initials: 'KM', item: 'Plot of land — Garsoor', amount: '$11,800.00', age: '4 days' },
  { owner: 'Cabdiraxmaan Nuur', initials: 'CN', item: 'Toyota Vitz 2008', amount: '$4,500.00', age: '4 days' },
  { owner: 'Maryan Cali', initials: 'MC', item: '2 items', amount: '$350.00', age: '3 days' },
]

const unmatchedDemands = [
  { customer: 'Faadumo Aweys', want: 'Looking for a 2-door fridge', cat: 'Appliances', budget: '$300.00', age: '2 days' },
  { customer: 'Ismaaciil Warsame', want: 'Used pickup truck, diesel', cat: 'Vehicles', budget: '$6,000.00', age: '1 day' },
  { customer: 'Cali Jaamac', want: 'Solar panels 300W', cat: 'Electronics', budget: '$800.00', age: '5 days' },
  { customer: 'Maryan Cali', want: 'Dining set, 6-seat', cat: 'Furniture', budget: '$260.00', age: '6 days' },
]

const card = {
  background: 'var(--surface)', border: '1px solid var(--divider)',
  borderRadius: 8, boxShadow: 'var(--shadow)', padding: '15px 16px',
} as const

const th = {
  textAlign: 'left' as const, padding: '11px 16px',
  fontSize: 11, fontWeight: 600, letterSpacing: '.04em',
  textTransform: 'uppercase' as const, color: 'var(--muted)',
}

export default function Dashboard() {
  return (
    <Layout>
      <div style={{ padding: '24px 28px' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-.02em' }}>Dashboard</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>June 2026 · month to date</p>
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Revenue', value: '$43,025', color: 'var(--text)' },
            { label: 'Profit', value: '$5,180', color: 'var(--success)' },
            { label: 'Pending payouts', value: '$16,750', color: 'var(--warning)' },
            { label: 'Items listed', value: '128', color: 'var(--text)' },
          ].map(k => (
            <div key={k.label} style={card}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: k.color, fontVariantNumeric: 'tabular-nums' }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 20 }}>
          <div style={{ ...card, padding: '18px 20px' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600 }}>Revenue trend</h2>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1d3480" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#1d3480" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11.5, fill: '#5a6b82' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#5a6b82' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Revenue']} labelStyle={{ fontSize: 12 }} contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #dce4ee' }} />
                <Area type="monotone" dataKey="v" stroke="#1d3480" strokeWidth={2} fill="url(#revGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ ...card, padding: '18px 20px' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600 }}>Demand by category</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={demandData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#5a6b82' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="cat" tick={{ fontSize: 12, fill: '#0b1f3a' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip formatter={(v) => [Number(v), 'Requests']} contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #dce4ee' }} />
                <Bar dataKey="n" radius={[0, 4, 4, 0]}>
                  {demandData.map((_, i) => <Cell key={i} fill={i === 0 ? '#1d3480' : `rgba(29,52,128,${0.55 - i * 0.08})`} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tables row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 20 }}>
          {/* Recent sales */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--divider)', borderRadius: 8, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
            <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--divider)', fontSize: 14, fontWeight: 600 }}>Recent sales</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={th}>Item</th>
                  <th style={th}>Buyer</th>
                  <th style={{ ...th, textAlign: 'right' }}>Amount</th>
                  <th style={th}>Staff</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((s, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--divider)' }}>
                    <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 500 }}>{s.item}</td>
                    <td style={{ padding: '10px 16px', fontSize: 12.5, color: 'var(--muted)' }}>{s.buyer}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{s.amount}</td>
                    <td style={{ padding: '10px 16px', fontSize: 12.5, color: 'var(--muted)' }}>{s.staff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pending payouts */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--divider)', borderRadius: 8, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
            <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Pending payouts</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--warning)', fontVariantNumeric: 'tabular-nums' }}>$16,750</span>
            </div>
            {pendingPayouts.map((p, i) => (
              <div key={i} style={{ padding: '12px 18px', borderTop: i > 0 ? '1px solid var(--divider)' : undefined, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#f9a800', color: '#1d3480', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{p.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.owner}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.item}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{p.amount}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{p.age}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Unmatched demands */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--divider)', borderRadius: 8, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--divider)', fontSize: 14, fontWeight: 600 }}>Unmatched demands <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginLeft: 6 }}>4 open</span></div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)' }}>
                <th style={th}>Customer</th>
                <th style={th}>Wanting</th>
                <th style={th}>Category</th>
                <th style={{ ...th, textAlign: 'right' }}>Budget</th>
                <th style={{ ...th, textAlign: 'right' }}>Age</th>
              </tr>
            </thead>
            <tbody>
              {unmatchedDemands.map((d, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--divider)' }}>
                  <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600 }}>{d.customer}</td>
                  <td style={{ padding: '10px 16px', fontSize: 13 }}>{d.want}</td>
                  <td style={{ padding: '10px 16px', fontSize: 12.5, color: 'var(--muted)' }}>{d.cat}</td>
                  <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{d.budget}</td>
                  <td style={{ padding: '10px 16px', fontSize: 12.5, textAlign: 'right', color: 'var(--muted)' }}>{d.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
