import Layout from '@/components/Layout'

const MODULE_STYLES: Record<string, { bg: string; fg: string }> = {
  Sale: { bg: '#fff8e6', fg: '#c07800' },
  Payout: { bg: '#e7f4ec', fg: '#1f7a4d' },
  Item: { bg: '#e8ecf5', fg: '#1d3480' },
  Customer: { bg: '#fbf0e0', fg: '#b45309' },
  Match: { bg: '#f0f3fa', fg: '#5a6b8a' },
  Expense: { bg: '#fbf0e0', fg: '#b45309' },
  Complaint: { bg: '#e8ecf5', fg: '#1d3480' },
  Demand: { bg: '#e7f4ec', fg: '#1f7a4d' },
  User: { bg: '#fbe9e7', fg: '#b3261e' },
}

const groups = [
  {
    date: 'Today, 28 Jun 2026',
    entries: [
      { time: '09:42', actor: 'Axmed', action: 'created sale', detail: 'Toyota Vitz → Cabdiraxmaan', module: 'Sale' },
      { time: '09:30', actor: 'Hodan', action: 'marked payout paid', detail: 'Coffee table · $80', module: 'Payout' },
      { time: '09:12', actor: 'Yuusuf', action: 'created item', detail: 'HP EliteBook 840', module: 'Item' },
      { time: '08:55', actor: 'Axmed', action: 'edited customer', detail: 'Maryan Cali', module: 'Customer' },
      { time: '08:40', actor: 'System', action: 'auto-matched demand', detail: 'Office chairs × 6', module: 'Match' },
    ],
  },
  {
    date: 'Yesterday, 27 Jun 2026',
    entries: [
      { time: '17:20', actor: 'Hodan', action: 'created sale', detail: 'Generator → Cali', module: 'Sale' },
      { time: '15:02', actor: 'Axmed', action: 'added expense', detail: 'Generator diesel · $120', module: 'Expense' },
      { time: '11:48', actor: 'Yuusuf', action: 'resolved complaint', detail: 'Dining table', module: 'Complaint' },
      { time: '09:15', actor: 'Hodan', action: 'created demand', detail: 'Solar panels', module: 'Demand' },
    ],
  },
  {
    date: '26 Jun 2026',
    entries: [
      { time: '16:30', actor: 'Axmed', action: 'invited user', detail: 'Cabdi Nuur', module: 'User' },
      { time: '14:10', actor: 'Yuusuf', action: 'withdrew item', detail: 'Land Cruiser', module: 'Item' },
      { time: '10:05', actor: 'Axmed', action: 'marked payout paid', detail: 'iPhone · $255', module: 'Payout' },
    ],
  },
]

const ACTOR_INITIALS: Record<string, string> = {
  Axmed: 'AA',
  Hodan: 'HM',
  Yuusuf: 'YC',
  Maryan: 'MF',
  System: '⚙',
}

const ACTOR_BG: Record<string, string> = {
  Axmed: '#f9a800',
  Hodan: '#e7f4ec',
  Yuusuf: '#e8ecf5',
  Maryan: '#fbf0e0',
  System: '#f0f3fa',
}

const ACTOR_FG: Record<string, string> = {
  Axmed: '#1d3480',
  Hodan: '#1f7a4d',
  Yuusuf: '#1d3480',
  Maryan: '#b45309',
  System: '#5a6b8a',
}

export default function AuditLog() {
  return (
    <Layout>
      <div style={{ padding: '28px 32px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-.02em' }}>Audit log</h1>
            <p style={{ margin: '5px 0 0', fontSize: 13, color: 'var(--muted)' }}>All system and staff activity</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {groups.map(group => (
              <div key={group.date}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>{group.date}</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--divider)' }} />
                </div>

                <div style={{ background: 'var(--surface)', border: '1px solid var(--divider)', borderRadius: 8, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
                  {group.entries.map((entry, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', borderTop: i > 0 ? '1px solid var(--divider)' : undefined }}>
                      <span style={{ fontSize: 12.5, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums', minWidth: 42, flexShrink: 0 }}>{entry.time}</span>

                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: ACTOR_BG[entry.actor] ?? '#f9a800', color: ACTOR_FG[entry.actor] ?? '#1d3480', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: entry.actor === 'System' ? 14 : 11.5, fontWeight: 700, flexShrink: 0 }}>
                        {ACTOR_INITIALS[entry.actor] ?? entry.actor.slice(0, 2).toUpperCase()}
                      </div>

                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{entry.actor}</span>
                        <span style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 5px' }}>{entry.action}</span>
                        <span style={{ fontSize: 13.5, fontWeight: 500 }}>{entry.detail}</span>
                      </div>

                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: MODULE_STYLES[entry.module]?.bg ?? '#eef2f7', color: MODULE_STYLES[entry.module]?.fg ?? '#6b7c93', flexShrink: 0 }}>
                        {entry.module}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
