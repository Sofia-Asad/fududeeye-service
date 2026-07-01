import { useState } from 'react'
import Layout from '@/components/Layout'

const ITEMS = [
  { label: 'Toyota Vitz 2008', value: 'vitz', listed: 4800, ownerAsk: 4500, owner: 'Khadija Maxamed' },
  { label: 'Leather sofa (3-seat)', value: 'sofa', listed: 410, ownerAsk: 350, owner: 'Maryan Cali' },
  { label: 'Dell Latitude 5490', value: 'dell', listed: 230, ownerAsk: null, owner: 'Company' },
]

const BUYERS = ['Cabdiraxmaan Nuur', 'Faadumo Aweys', 'Ismaaciil Warsame', 'Naciima Daahir']
const STAFF = ['Axmed Aweys', 'Maryan Faarax', 'Hodan Maxamuud', 'Yuusuf Cali']
const PAYMENT_METHODS = ['Cash', 'EVC Plus', 'Zaad', 'Bank Transfer']

const labelStyle = { display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 6 } as const
const inputStyle = { width: '100%', height: 42, padding: '0 12px', border: '1px solid var(--divider)', borderRadius: 6, fontSize: 14, fontFamily: 'inherit', color: 'var(--text)', background: 'var(--surface)', outline: 'none' } as const
const selectStyle = { ...inputStyle, cursor: 'pointer' } as const

export default function NewSale() {
  const [selectedItem, setSelectedItem] = useState(ITEMS[0])
  const [buyer, setBuyer] = useState(BUYERS[0])
  const [qty, setQty] = useState(1)
  const [salePrice, setSalePrice] = useState(4800)
  const [payment, setPayment] = useState('Cash')
  const [staff] = useState(STAFF[0])
  const [notes, setNotes] = useState('')

  const ownerPayout = selectedItem.ownerAsk !== null ? selectedItem.ownerAsk * qty : null
  const profit = ownerPayout !== null ? salePrice * qty - ownerPayout : salePrice * qty
  const margin = salePrice > 0 ? ((profit / (salePrice * qty)) * 100).toFixed(2) : '0.00'

  return (
    <Layout>
      <div style={{ padding: '28px 32px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ marginBottom: 22 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-.02em' }}>New sale</h1>
            <p style={{ margin: '5px 0 0', fontSize: 13, color: 'var(--muted)' }}>Record a completed or in-progress sale</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 372px', gap: 24, alignItems: 'start' }}>
            {/* FORM */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--divider)', borderRadius: 8, boxShadow: 'var(--shadow)', padding: '28px 28px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Item</label>
                  <select
                    style={selectStyle}
                    value={selectedItem.value}
                    onChange={e => {
                      const found = ITEMS.find(i => i.value === e.target.value) ?? ITEMS[0]
                      setSelectedItem(found)
                      setSalePrice(found.listed)
                    }}
                  >
                    {ITEMS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Buyer</label>
                  <select style={selectStyle} value={buyer} onChange={e => setBuyer(e.target.value)}>
                    {BUYERS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Quantity</label>
                    <input type="number" min={1} value={qty} onChange={e => setQty(Math.max(1, +e.target.value))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Sale price (per unit)</label>
                    <input type="number" min={0} value={salePrice} onChange={e => setSalePrice(+e.target.value)} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Date</label>
                    <input type="date" defaultValue="2026-06-28" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Payment method</label>
                    <select style={selectStyle} value={payment} onChange={e => setPayment(e.target.value)}>
                      {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Handled by</label>
                  <select style={selectStyle} defaultValue={staff}>
                    {STAFF.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Notes (optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Add any relevant notes about this sale…"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    style={{ ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>

            {/* SUMMARY PANEL */}
            <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--divider)', borderRadius: 8, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--divider)' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 2 }}>Sale summary</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{selectedItem.label}</div>
                </div>

                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                    <span style={{ color: 'var(--muted)' }}>Item listed at</span>
                    <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>${selectedItem.listed.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                    <span style={{ color: 'var(--muted)' }}>Sale price × {qty}</span>
                    <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>${(salePrice * qty).toLocaleString()}</span>
                  </div>

                  {ownerPayout !== null && (
                    <div style={{ background: 'var(--warning-bg)', border: '1px solid #f0d3a4', borderRadius: 6, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                      <span style={{ color: 'var(--warning)', fontWeight: 500 }}>Owner payout</span>
                      <span style={{ fontWeight: 700, color: 'var(--warning)', fontVariantNumeric: 'tabular-nums' }}>${ownerPayout.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div style={{ background: '#1d3480', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 13.5, color: '#9fb2cc' }}>Company profit</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>${profit.toLocaleString()}</div>
                      <div style={{ fontSize: 12, color: '#f9a800', marginTop: 2 }}>{margin}% margin</div>
                    </div>
                  </div>
                </div>
              </div>

              <button style={{ width: '100%', height: 48, border: 'none', borderRadius: 8, background: 'var(--accent)', color: '#ffffff', fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>
                Save sale
              </button>

              <button style={{ width: '100%', height: 38, border: '1px solid var(--divider)', borderRadius: 6, background: 'var(--surface)', color: 'var(--muted)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
