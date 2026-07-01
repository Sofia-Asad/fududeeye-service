import Layout from '@/components/Layout'

const demands = [
  { customer: 'Faadumo Aweys', want: 'Looking for a 2-door fridge', cat: 'Appliances', budget: '$300.00', status: 'Open', age: '2 days', matches: 0 },
  { customer: 'Ismaaciil Warsame', want: 'Used pickup truck, diesel', cat: 'Vehicles', budget: '$6,000.00', status: 'Open', age: '1 day', matches: 0 },
  { customer: 'Naciima Daahir', want: 'Office chairs ×6', cat: 'Furniture', budget: '$180.00', status: 'Matched', age: '3 days', matches: 2 },
  { customer: 'Cali Jaamac', want: 'Solar panels 300W', cat: 'Electronics', budget: '$800.00', status: 'Open', age: '5 days', matches: 0 },
  { customer: 'Mukhtaar Siyaad', want: 'Laptop i5 / 8GB', cat: 'Electronics', budget: '$350.00', status: 'Matched', age: '4 days', matches: 3 },
  { customer: 'Khadija Maxamed', want: 'Plot of land near Garsoor', cat: 'Property', budget: '$12,000.00', status: 'Fulfilled', age: '8 days', matches: 1 },
  { customer: 'Maryan Cali', want: 'Dining set, 6-seat', cat: 'Furniture', budget: '$260.00', status: 'Open', age: '6 days', matches: 1 },
  { customer: 'Saynab Cabdi', want: 'Washing machine', cat: 'Appliances', budget: '$280.00', status: 'Closed', age: '12 days', matches: 0 },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Open: { bg: '#fbf0e0', fg: '#b45309' },
  Matched: { bg: '#e8ecf5', fg: '#1d3480' },
  Fulfilled: { bg: '#e7f4ec', fg: '#1f7a4d' },
  Closed: { bg: '#eef2f7', fg: '#6b7c93' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { bg: '#eef2f7', fg: '#6b7c93' }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: s.bg, color: s.fg }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.fg }} />
      {status}
    </span>
  )
}

const th = { textAlign: 'left' as const, padding: '11px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' as const, color: 'var(--muted)' }

export default function Demands() {
  return (
    <Layout>
      <div style={{ padding: '28px 32px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-.02em' }}>Demands</h1>
              <p style={{ margin: '5px 0 0', fontSize: 13, color: 'var(--muted)' }}>12 open requests · 4 still unmatched</p>
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: 7, height: 40, padding: '0 16px', border: 'none', borderRadius: 6, background: 'var(--accent)', color: '#fff', fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              New demand
            </button>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--divider)', borderRadius: 8, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={th}>Customer</th>
                  <th style={th}>What they want</th>
                  <th style={th}>Category</th>
                  <th style={{ ...th, textAlign: 'right' }}>Target</th>
                  <th style={th}>Status</th>
                  <th style={{ ...th, textAlign: 'right' }}>Age</th>
                  <th style={{ ...th, textAlign: 'right' }}>Matches</th>
                </tr>
              </thead>
              <tbody>
                {demands.map((d, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--divider)', cursor: 'pointer' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{d.customer}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>{d.want}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'var(--muted)' }}>{d.cat}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{d.budget}</td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={d.status} /></td>
                    <td style={{ padding: '12px 16px', fontSize: 12.5, textAlign: 'right', color: 'var(--muted)' }}>{d.age}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: d.matches > 0 ? 'var(--accent)' : 'var(--muted)', fontWeight: d.matches > 0 ? 600 : 400 }}>{d.matches}</td>
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
