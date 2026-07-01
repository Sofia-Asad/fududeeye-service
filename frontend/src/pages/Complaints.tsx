import Layout from '@/components/Layout'

const complaints = [
  { customer: 'Cabdiraxmaan Nuur', subject: 'Vitz delivered with door scratch', related: 'Toyota Vitz 2008', priority: 'High', status: 'Open', opened: 'Jun 27', assignee: 'Hodan' },
  { customer: 'Faadumo Aweys', subject: 'Fridge not cooling properly', related: 'Samsung 2-door fridge', priority: 'High', status: 'In progress', opened: 'Jun 26', assignee: 'Axmed' },
  { customer: 'Ismaaciil Warsame', subject: 'Printer missing power cable', related: 'HP LaserJet printer', priority: 'Low', status: 'Open', opened: 'Jun 25', assignee: 'Yuusuf' },
  { customer: 'Maryan Cali', subject: 'Payout later than agreed', related: '—', priority: 'Medium', status: 'In progress', opened: 'Jun 24', assignee: 'Axmed' },
  { customer: 'Cali Jaamac', subject: 'Generator runs noisy', related: 'Generator 5kVA', priority: 'Medium', status: 'Resolved', opened: 'Jun 20', assignee: 'Hodan' },
  { customer: 'Naciima Daahir', subject: 'Wrong table colour delivered', related: 'Dining table set', priority: 'Low', status: 'Resolved', opened: 'Jun 18', assignee: 'Yuusuf' },
]

const PRIORITY: Record<string, { bg: string; fg: string }> = {
  High: { bg: '#fbe9e7', fg: '#b3261e' },
  Medium: { bg: '#fbf0e0', fg: '#b45309' },
  Low: { bg: '#eef2f7', fg: '#6b7c93' },
}

const STATUS: Record<string, { bg: string; fg: string }> = {
  Open: { bg: '#fbf0e0', fg: '#b45309' },
  'In progress': { bg: '#e8ecf5', fg: '#1d3480' },
  Resolved: { bg: '#e7f4ec', fg: '#1f7a4d' },
}

const th = { textAlign: 'left' as const, padding: '11px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' as const, color: 'var(--muted)' }

export default function Complaints() {
  return (
    <Layout>
      <div style={{ padding: '28px 32px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-.02em' }}>Complaints</h1>
              <p style={{ margin: '5px 0 0', fontSize: 13, color: 'var(--muted)' }}>3 open · 2 high priority</p>
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: 7, height: 40, padding: '0 16px', border: 'none', borderRadius: 6, background: 'var(--accent)', color: '#fff', fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              New complaint
            </button>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--divider)', borderRadius: 8, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={th}>Customer</th>
                  <th style={th}>Subject</th>
                  <th style={th}>Related</th>
                  <th style={th}>Priority</th>
                  <th style={th}>Status</th>
                  <th style={th}>Opened</th>
                  <th style={th}>Assignee</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c, i) => {
                  const p = PRIORITY[c.priority]
                  const s = STATUS[c.status] ?? { bg: '#eef2f7', fg: '#6b7c93' }
                  return (
                    <tr key={i} style={{ borderTop: '1px solid var(--divider)', cursor: 'pointer' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{c.customer}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{c.subject}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'var(--muted)' }}>{c.related}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: p.bg, color: p.fg }}>
                          {c.priority}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: s.bg, color: s.fg }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.fg }} />
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'var(--muted)' }}>{c.opened}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{c.assignee}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
