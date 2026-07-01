import { useState } from 'react'
import Layout from '@/components/Layout'

const ownerGroups = [
  {
    owner: 'Khadija Maxamed', initials: 'KM', total: '$11,800.00',
    items: [{ name: 'Plot of land — Garsoor', amount: '$11,800.00', date: 'Jun 28', status: 'Pending' }],
  },
  {
    owner: 'Cabdiraxmaan Nuur', initials: 'CN', total: '$4,500.00',
    items: [{ name: 'Toyota Vitz 2008', amount: '$4,500.00', date: 'Jun 28', status: 'Pending' }],
  },
  {
    owner: 'Maryan Cali', initials: 'MC', total: '$350.00',
    items: [
      { name: 'Wardrobe (4-door)', amount: '$190.00', date: 'Jun 22', status: 'Pending' },
      { name: 'Bookshelf', amount: '$160.00', date: 'Jun 20', status: 'Pending' },
    ],
  },
  {
    owner: 'Saynab Cabdi', initials: 'SC', total: '$100.00',
    items: [{ name: 'Office desk (140cm)', amount: '$100.00', date: 'Jun 18', status: 'Pending' }],
  },
]

const PAYMENT_METHODS = [
  { label: 'Cash', icon: '💵' },
  { label: 'EVC Plus', icon: '📱' },
  { label: 'Zaad', icon: '📲' },
  { label: 'Bank Transfer', icon: '🏦' },
]

export default function PendingPayouts() {
  const [modalOwner, setModalOwner] = useState<(typeof ownerGroups)[0] | null>(null)
  const [selectedMethod, setSelectedMethod] = useState('Cash')

  const total = '$16,750.00'

  return (
    <Layout>
      <div style={{ padding: '28px 32px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-.02em' }}>Pending payouts</h1>
              <p style={{ margin: '5px 0 0', fontSize: 13, color: 'var(--muted)' }}>4 owners owed · total {total}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Total owed</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--warning)', fontVariantNumeric: 'tabular-nums' }}>{total}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {ownerGroups.map(group => (
              <div key={group.owner} style={{ background: 'var(--surface)', border: '1px solid var(--divider)', borderRadius: 8, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--divider)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#f9a800', color: '#1d3480', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{group.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{group.owner}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{group.items.length} item{group.items.length > 1 ? 's' : ''}</div>
                  </div>
                  <div style={{ textAlign: 'right', marginRight: 14 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--warning)', fontVariantNumeric: 'tabular-nums' }}>{group.total}</div>
                  </div>
                  <button
                    onClick={() => setModalOwner(group)}
                    style={{ height: 36, padding: '0 16px', border: 'none', borderRadius: 6, background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}
                  >
                    Mark paid
                  </button>
                </div>
                {group.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 20px 11px 72px', borderTop: i > 0 ? '1px solid var(--divider)' : undefined, background: 'var(--surface-2)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>Sold {item.date}</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{item.amount}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalOwner && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,37,64,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} onClick={() => setModalOwner(null)}>
          <div style={{ background: 'var(--surface)', borderRadius: 12, boxShadow: '0 20px 60px rgba(10,37,64,.25)', width: 440, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--divider)' }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Mark payout as paid</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{modalOwner.owner} · {modalOwner.total}</div>
            </div>

            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 10 }}>Payment method</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {PAYMENT_METHODS.map(m => (
                    <button key={m.label} onClick={() => setSelectedMethod(m.label)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', border: `2px solid ${selectedMethod === m.label ? 'var(--accent)' : 'var(--divider)'}`, borderRadius: 8, background: selectedMethod === m.label ? 'var(--accent-weak)' : 'var(--surface)', fontSize: 13.5, fontWeight: 600, color: selectedMethod === m.label ? 'var(--accent)' : 'var(--text)', fontFamily: 'inherit', cursor: 'pointer', transition: 'all .12s' }}>
                      <span style={{ fontSize: 18 }}>{m.icon}</span>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 8 }}>Payment date</div>
                <input type="date" defaultValue="2026-06-28" style={{ width: '100%', height: 42, padding: '0 12px', border: '1px solid var(--divider)', borderRadius: 6, fontSize: 14, fontFamily: 'inherit', color: 'var(--text)', background: 'var(--surface)', outline: 'none' }} />
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--divider)', display: 'flex', gap: 10 }}>
              <button onClick={() => setModalOwner(null)} style={{ flex: 1, height: 42, border: '1px solid var(--divider)', borderRadius: 6, background: 'var(--surface)', color: 'var(--muted)', fontSize: 13.5, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => setModalOwner(null)} style={{ flex: 2, height: 42, border: 'none', borderRadius: 6, background: 'var(--accent)', color: '#fff', fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>Confirm payment</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
