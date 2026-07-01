import Layout from '@/components/Layout'

const expenses = [
  { date: 'Jun 28', cat: 'Rent', desc: 'Shop rent — June', method: 'Bank Transfer', amount: '$450.00', by: 'Axmed' },
  { date: 'Jun 27', cat: 'Transport', desc: 'Vehicle delivery fuel', method: 'Cash', amount: '$35.00', by: 'Yuusuf' },
  { date: 'Jun 26', cat: 'Utilities', desc: 'Generator diesel', method: 'Cash', amount: '$120.00', by: 'Hodan' },
  { date: 'Jun 24', cat: 'Salaries', desc: 'Staff advance — Hodan', method: 'EVC Plus', amount: '$200.00', by: 'Axmed' },
  { date: 'Jun 22', cat: 'Marketing', desc: 'Facebook ads', method: 'EVC Plus', amount: '$40.00', by: 'Axmed' },
  { date: 'Jun 20', cat: 'Supplies', desc: 'Packaging & cleaning', method: 'Cash', amount: '$28.00', by: 'Yuusuf' },
  { date: 'Jun 18', cat: 'Repairs', desc: 'Shop shelf repair', method: 'Cash', amount: '$60.00', by: 'Hodan' },
  { date: 'Jun 15', cat: 'Utilities', desc: 'Internet — June', method: 'Zaad', amount: '$55.00', by: 'Axmed' },
]

const card = { background: 'var(--surface)', border: '1px solid var(--divider)', borderRadius: 8, boxShadow: 'var(--shadow)', padding: '15px 16px' } as const
const th = { textAlign: 'left' as const, padding: '11px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' as const, color: 'var(--muted)' }

export default function Expenses() {
  return (
    <Layout>
      <div style={{ padding: '28px 32px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-.02em' }}>Expenses</h1>
              <p style={{ margin: '5px 0 0', fontSize: 13, color: 'var(--muted)' }}>June 2026</p>
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: 7, height: 40, padding: '0 16px', border: 'none', borderRadius: 6, background: 'var(--accent)', color: '#fff', fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              New expense
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
            <div style={card}><div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Total this month</div><div style={{ fontSize: 24, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>$988.00</div></div>
            <div style={card}><div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Largest category</div><div style={{ fontSize: 24, fontWeight: 700 }}>Rent · $450.00</div></div>
            <div style={card}><div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Expenses logged</div><div style={{ fontSize: 24, fontWeight: 700 }}>14</div></div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--divider)', borderRadius: 8, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={th}>Date</th>
                  <th style={th}>Category</th>
                  <th style={th}>Description</th>
                  <th style={th}>Paid via</th>
                  <th style={{ ...th, textAlign: 'right' }}>Amount</th>
                  <th style={th}>By</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--divider)', cursor: 'pointer' }}>
                    <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'var(--muted)' }}>{e.date}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: 'var(--surface-2)', color: 'var(--muted)' }}>{e.cat}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500 }}>{e.desc}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'var(--muted)' }}>{e.method}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{e.amount}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>{e.by}</td>
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
