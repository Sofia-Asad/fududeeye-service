import { useState } from 'react'
import Layout from '@/components/Layout'

const STATUS: Record<string, { bg: string; fg: string }> = {
  Active: { bg: '#e7f4ec', fg: '#1f7a4d' },
  Reserved: { bg: '#fbf0e0', fg: '#b45309' },
  Sold: { bg: '#e8ecf5', fg: '#1d3480' },
}

const itemsOwned = [
  { name: 'Leather sofa (3-seat)', listed: '$410.00', ask: '$350.00', status: 'Reserved', note: '' },
  { name: 'Dining chairs (set of 4)', listed: '$180.00', ask: '$150.00', status: 'Active', note: '' },
  { name: 'Wardrobe (4-door)', listed: '$220.00', ask: '$190.00', status: 'Sold', note: 'Payout pending' },
  { name: 'Coffee table', listed: '$95.00', ask: '$80.00', status: 'Sold', note: 'Paid Jun 12' },
]

const TABS = ['Profile', 'Items owned', 'Purchases', 'Demands', 'Complaints']

const th = { textAlign: 'left' as const, padding: '11px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' as const, color: 'var(--muted)' }

export default function CustomerDetail() {
  const [tab, setTab] = useState('Items owned')

  return (
    <Layout>
      <div style={{ padding: '28px 32px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          {/* HEADER */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--divider)', borderRadius: 8, boxShadow: 'var(--shadow)', padding: '24px 28px', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
              <div style={{ width: 58, height: 58, borderRadius: '50%', background: '#f9a800', color: '#1d3480', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, flexShrink: 0 }}>MC</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.01em' }}>Maryan Cali</span>
                  <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: '#e7f4ec', color: '#1f7a4d', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1f7a4d' }} /> Active
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: 'var(--accent-weak)', color: 'var(--accent)' }}>Buyer</span>
                  <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: 'var(--surface-2)', color: 'var(--muted)' }}>Seller</span>
                </div>
                <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--muted)' }}>
                  <span>+252 61 234 5678</span>
                  <span>Mogadishu</span>
                  <span>Customer since Mar 2024</span>
                </div>
              </div>
              <button style={{ height: 36, padding: '0 14px', border: '1px solid var(--divider)', borderRadius: 6, background: 'var(--surface)', fontSize: 13, fontFamily: 'inherit', color: 'var(--text)', fontWeight: 500, cursor: 'pointer' }}>Edit</button>
            </div>
          </div>

          {/* STAT CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
            {[
              { label: 'Items on consignment', value: '4', color: 'var(--text)' },
              { label: 'Lifetime sold', value: '$1,240', color: 'var(--text)' },
              { label: 'Pending payout', value: '$350.00', color: 'var(--warning)' },
              { label: 'Purchases', value: '3', color: 'var(--text)' },
            ].map(k => (
              <div key={k.label} style={{ background: 'var(--surface)', border: '1px solid var(--divider)', borderRadius: 8, boxShadow: 'var(--shadow)', padding: '14px 16px' }}>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 5 }}>{k.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: k.color, fontVariantNumeric: 'tabular-nums' }}>{k.value}</div>
              </div>
            ))}
          </div>

          {/* TABS */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--divider)', borderRadius: 8, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--divider)', padding: '0 20px' }}>
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ height: 48, padding: '0 16px', border: 'none', background: 'none', fontSize: 13.5, fontFamily: 'inherit', fontWeight: tab === t ? 600 : 400, color: tab === t ? 'var(--accent)' : 'var(--muted)', cursor: 'pointer', borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent', marginBottom: -1 }}>
                  {t}
                </button>
              ))}
            </div>

            {tab === 'Items owned' && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-2)' }}>
                    <th style={th}>Item</th>
                    <th style={{ ...th, textAlign: 'right' }}>Listed price</th>
                    <th style={{ ...th, textAlign: 'right' }}>Owner asking</th>
                    <th style={th}>Status</th>
                    <th style={th}>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsOwned.map((item, i) => {
                    const s = STATUS[item.status] ?? { bg: '#eef2f7', fg: '#6b7c93' }
                    return (
                      <tr key={i} style={{ borderTop: '1px solid var(--divider)' }}>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{item.name}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{item.listed}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--muted)' }}>{item.ask}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: s.bg, color: s.fg }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.fg }} />
                            {item.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12.5, color: item.note.includes('pending') ? 'var(--warning)' : item.note.includes('Paid') ? 'var(--success)' : 'var(--muted)' }}>{item.note || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}

            {tab !== 'Items owned' && (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
                No {tab.toLowerCase()} records yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
