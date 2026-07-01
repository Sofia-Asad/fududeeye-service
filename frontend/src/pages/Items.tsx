import { useState } from 'react'
import Layout from '@/components/Layout'

const allItems = [
  { name: 'Dell Latitude 5490', cat: 'Electronics', owner: 'Company', listed: '$230.00', qty: 1, status: 'Active', created: 'Jun 3' },
  { name: 'Leather sofa (3-seat)', cat: 'Furniture', owner: 'Maryan Cali', ownerType: 'Consignment', listed: '$410.00', qty: 1, status: 'Reserved', created: 'Jun 4' },
  { name: 'Toyota Vitz 2008', cat: 'Vehicles', owner: 'Khadija Maxamed', ownerType: 'Consignment', listed: '$4,800.00', qty: 1, status: 'Sold', created: 'May 28' },
  { name: 'Samsung 2-door fridge', cat: 'Appliances', owner: 'Company', listed: '$310.00', qty: 1, status: 'Active', created: 'Jun 5' },
  { name: 'HP LaserJet printer', cat: 'Electronics', owner: 'Company', listed: '$95.00', qty: 2, status: 'Active', created: 'Jun 6' },
  { name: 'Plot of land — Garsoor', cat: 'Property', owner: 'Khadija Maxamed', ownerType: 'Consignment', listed: '$12,500.00', qty: 1, status: 'Reserved', created: 'Jun 8' },
  { name: 'Office desk (140cm)', cat: 'Furniture', owner: 'Saynab Cabdi', ownerType: 'Consignment', listed: '$120.00', qty: 1, status: 'Active', created: 'Jun 9' },
  { name: 'iPhone 11 64GB', cat: 'Electronics', owner: 'Company', listed: '$290.00', qty: 1, status: 'Sold', created: 'Jun 2' },
  { name: 'Dining table set (6-seat)', cat: 'Furniture', owner: 'Maryan Cali', ownerType: 'Consignment', listed: '$260.00', qty: 1, status: 'Active', created: 'Jun 7' },
  { name: 'Generator 5kVA', cat: 'Electronics', owner: 'Company', listed: '$540.00', qty: 1, status: 'Completed', created: 'May 20' },
  { name: 'HP EliteBook 840 G6', cat: 'Electronics', owner: 'Company', listed: '$355.00', qty: 1, status: 'Draft', created: 'Jun 28' },
  { name: 'Land Cruiser Prado 2012', cat: 'Vehicles', owner: 'Cabdiraxmaan Nuur', ownerType: 'Consignment', listed: '$18,900.00', qty: 1, status: 'Withdrawn', created: 'Jun 15' },
]

const STATUS: Record<string, { bg: string; fg: string }> = {
  Active: { bg: '#e7f4ec', fg: '#1f7a4d' },
  Reserved: { bg: '#fbf0e0', fg: '#b45309' },
  Sold: { bg: '#e8ecf5', fg: '#1d3480' },
  Completed: { bg: '#eaeef6', fg: '#1d3480' },
  Draft: { bg: '#eef2f7', fg: '#6b7c93' },
  Withdrawn: { bg: '#eef2f7', fg: '#93a1b5' },
}

const CATS = ['All categories', 'Electronics', 'Furniture', 'Vehicles', 'Appliances', 'Property']
const STATUSES = ['All statuses', 'Active', 'Reserved', 'Sold', 'Completed', 'Draft', 'Withdrawn']

const th = { textAlign: 'left' as const, padding: '11px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' as const, color: 'var(--muted)' }

export default function Items() {
  const [catFilter, setCatFilter] = useState('All categories')
  const [statusFilter, setStatusFilter] = useState('All statuses')

  const filtered = allItems.filter(item => {
    const catMatch = catFilter === 'All categories' || item.cat === catFilter
    const statusMatch = statusFilter === 'All statuses' || item.status === statusFilter
    return catMatch && statusMatch
  })

  const active = allItems.filter(i => i.status === 'Active').length
  const reserved = allItems.filter(i => i.status === 'Reserved').length

  const filterStyle = { height: 36, padding: '0 10px', border: '1px solid var(--divider)', borderRadius: 6, background: 'var(--surface)', fontSize: 12.5, color: 'var(--text)', fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }

  return (
    <Layout>
      <div style={{ display: 'flex', height: '100%' }}>
        {/* FILTER RAIL */}
        <aside style={{ width: 236, flexShrink: 0, borderRight: '1px solid var(--divider)', background: 'var(--surface)', padding: '22px 18px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700 }}>Items</h1>
            <p style={{ margin: 0, fontSize: 12.5, color: 'var(--muted)' }}>{allItems.length} total · {active} active · {reserved} reserved</p>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--muted)', marginBottom: 10 }}>Status</div>
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 6, border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: statusFilter === s ? 600 : 400, color: statusFilter === s ? 'var(--accent)' : 'var(--text)', background: statusFilter === s ? 'var(--accent-weak)' : 'transparent', cursor: 'pointer', marginBottom: 2 }}>
                {s}
              </button>
            ))}
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--muted)', marginBottom: 10 }}>Category</div>
            {CATS.map(c => (
              <button key={c} onClick={() => setCatFilter(c)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 6, border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: catFilter === c ? 600 : 400, color: catFilter === c ? 'var(--accent)' : 'var(--text)', background: catFilter === c ? 'var(--accent-weak)' : 'transparent', cursor: 'pointer', marginBottom: 2 }}>
                {c}
              </button>
            ))}
          </div>
        </aside>

        {/* TABLE */}
        <div style={{ flex: 1, minWidth: 0, padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1 }} />
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={filterStyle}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={filterStyle}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <button style={{ display: 'flex', alignItems: 'center', gap: 7, height: 36, padding: '0 14px', border: 'none', borderRadius: 6, background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Add item
            </button>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--divider)', borderRadius: 8, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  <th style={th}>Item</th>
                  <th style={th}>Category</th>
                  <th style={th}>Owner</th>
                  <th style={{ ...th, textAlign: 'right' }}>Listed price</th>
                  <th style={{ ...th, textAlign: 'right' }}>Qty</th>
                  <th style={th}>Status</th>
                  <th style={th}>Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => {
                  const s = STATUS[item.status] ?? { bg: '#eef2f7', fg: '#6b7c93' }
                  return (
                    <tr key={i} style={{ borderTop: '1px solid var(--divider)', cursor: 'pointer' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{item.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'var(--muted)' }}>{item.cat}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12.5 }}>
                        {item.ownerType === 'Consignment'
                          ? <span><span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: 'var(--surface-2)', color: 'var(--muted)', marginRight: 6 }}>Consignment</span>{item.owner}</span>
                          : <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: '#eaeef6', color: '#1d3480' }}>Company</span>
                        }
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{item.listed}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{item.qty}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: s.bg, color: s.fg }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.fg }} />
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'var(--muted)' }}>{item.created}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>No items match the current filters.</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
