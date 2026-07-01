import Layout from '@/components/Layout'

const users = [
  { name: 'Axmed Aweys', initials: 'AA', role: 'Owner', phone: '+252 61 111 0000', status: 'Active', lastActive: 'Online now', bg: '#f9a800', fg: '#1d3480' },
  { name: 'Maryan Faarax', initials: 'MF', role: 'Manager', phone: '+252 61 222 1111', status: 'Active', lastActive: 'Today 08:10', bg: '#e8ecf5', fg: '#1d3480' },
  { name: 'Hodan Maxamuud', initials: 'HM', role: 'Sales', phone: '+252 61 333 2222', status: 'Active', lastActive: '5 min ago', bg: '#f0f3fa', fg: '#5a6b8a' },
  { name: 'Yuusuf Cali', initials: 'YC', role: 'Sales', phone: '+252 61 444 3333', status: 'Active', lastActive: '1 hr ago', bg: '#f0f3fa', fg: '#5a6b8a' },
  { name: 'Cabdi Nuur', initials: 'CN', role: 'Sales', phone: '+252 61 555 4444', status: 'Invited', lastActive: 'Pending', bg: '#f0f3fa', fg: '#5a6b8a' },
]

const ROLE_STYLES: Record<string, { bg: string; fg: string }> = {
  Owner: { bg: '#f9a800', fg: '#1d3480' },
  Manager: { bg: '#e8ecf5', fg: '#1d3480' },
  Sales: { bg: '#f0f3fa', fg: '#5a6b8a' },
}

const th = { textAlign: 'left' as const, padding: '11px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' as const, color: 'var(--muted)' }

export default function Users() {
  return (
    <Layout>
      <div style={{ padding: '28px 32px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-.02em' }}>Users</h1>
              <p style={{ margin: '5px 0 0', fontSize: 13, color: 'var(--muted)' }}>5 team members · 1 invited</p>
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: 7, height: 40, padding: '0 16px', border: 'none', borderRadius: 6, background: 'var(--accent)', color: '#fff', fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Invite user
            </button>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--divider)', borderRadius: 8, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={th}>Name</th>
                  <th style={th}>Role</th>
                  <th style={th}>Phone</th>
                  <th style={th}>Status</th>
                  <th style={th}>Last active</th>
                  <th style={{ ...th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const r = ROLE_STYLES[u.role] ?? { bg: '#f2f6fb', fg: '#5a6b82' }
                  const isInvited = u.status === 'Invited'
                  return (
                    <tr key={i} style={{ borderTop: '1px solid var(--divider)' }}>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: u.bg, color: u.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{u.initials}</div>
                          <span style={{ fontSize: 13.5, fontWeight: 600 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: r.bg, color: r.fg }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--muted)' }}>{u.phone}</td>
                      <td style={{ padding: '13px 16px' }}>
                        {isInvited
                          ? <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: '#fbf0e0', color: '#b45309' }}>Invited</span>
                          : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: '#e7f4ec', color: '#1f7a4d' }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1f7a4d' }} />
                              Active
                            </span>
                        }
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 12.5, color: u.lastActive === 'Online now' ? 'var(--success)' : 'var(--muted)', fontWeight: u.lastActive === 'Online now' ? 600 : 400 }}>{u.lastActive}</td>
                      <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                        <button style={{ width: 32, height: 32, border: '1px solid var(--divider)', borderRadius: 6, background: 'var(--surface)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 14, fontWeight: 700 }}>···</button>
                      </td>
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
