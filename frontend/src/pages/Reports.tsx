import Layout from '@/components/Layout'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const monthlyRevenue = [
  { month: 'Jan', v: 34200 },
  { month: 'Feb', v: 37800 },
  { month: 'Mar', v: 31500 },
  { month: 'Apr', v: 42100 },
  { month: 'May', v: 45300 },
  { month: 'Jun', v: 43025 },
]

const demandCats = [
  { cat: 'Electronics', pct: 100 },
  { cat: 'Furniture', pct: 75 },
  { cat: 'Vehicles', pct: 46 },
  { cat: 'Property', pct: 29 },
  { cat: 'Appliances', pct: 21 },
]

const staffTable = [
  { name: 'Hodan Maxamuud', sales: 38, revenue: '$15,420', profit: '$1,980' },
  { name: 'Axmed Aweys', sales: 22, revenue: '$14,300', profit: '$1,560' },
  { name: 'Yuusuf Cali', sales: 31, revenue: '$9,860', profit: '$1,240' },
  { name: 'Maryan Faarax', sales: 9, revenue: '$3,445', profit: '$400' },
]

const card = { background: 'var(--surface)', border: '1px solid var(--divider)', borderRadius: 8, boxShadow: 'var(--shadow)', padding: '16px 18px' } as const
const th = { textAlign: 'left' as const, padding: '11px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' as const, color: 'var(--muted)' }

export default function Reports() {
  return (
    <Layout>
      <div style={{ padding: '28px 32px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-.02em' }}>Reports</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Date range:</span>
              <div style={{ padding: '7px 14px', border: '1px solid var(--divider)', borderRadius: 6, background: 'var(--surface)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>1 – 28 Jun 2026</div>
            </div>
          </div>

          {/* KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
            {[
              { label: 'Revenue', value: '$43,025', color: 'var(--text)' },
              { label: 'Profit', value: '$5,180', color: 'var(--success)' },
              { label: 'Payouts settled', value: '$9,400', color: 'var(--text)' },
              { label: 'Expenses', value: '$988', color: 'var(--warning)' },
            ].map(k => (
              <div key={k.label} style={card}>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{k.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: k.color, fontVariantNumeric: 'tabular-nums' }}>{k.value}</div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 20 }}>
            {/* Revenue by month */}
            <div style={{ ...card, padding: '18px 20px' }}>
              <h2 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600 }}>Revenue by month</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyRevenue} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#5a6b82' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#5a6b82' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Revenue']} contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #dce4ee' }} />
                  <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                    {monthlyRevenue.map((_, i) => (
                      <Cell key={i} fill={i === monthlyRevenue.length - 1 ? '#f9a800' : '#bcc8e8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top categories by demand */}
            <div style={{ ...card, padding: '18px 20px' }}>
              <h2 style={{ margin: '0 0 18px', fontSize: 14, fontWeight: 600 }}>Top categories by demand</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {demandCats.map(cat => (
                  <div key={cat.cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{cat.cat}</span>
                      <span style={{ fontSize: 12.5, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{cat.pct}%</span>
                    </div>
                    <div style={{ height: 7, borderRadius: 4, background: 'var(--surface-2)' }}>
                      <div style={{ height: '100%', borderRadius: 4, background: 'var(--accent)', width: `${cat.pct}%`, transition: 'width .4s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Staff table */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--divider)', borderRadius: 8, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
            <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--divider)', fontSize: 14, fontWeight: 600 }}>Sales by staff</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={th}>Staff member</th>
                  <th style={{ ...th, textAlign: 'right' }}>Sales</th>
                  <th style={{ ...th, textAlign: 'right' }}>Revenue</th>
                  <th style={{ ...th, textAlign: 'right' }}>Profit contributed</th>
                </tr>
              </thead>
              <tbody>
                {staffTable.map((s, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--divider)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#f9a800', color: '#1d3480', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                          {s.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{s.sales}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{s.revenue}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'right', fontWeight: 600, color: 'var(--success)', fontVariantNumeric: 'tabular-nums' }}>{s.profit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
