import { AlertTriangle, CheckCircle2 } from 'lucide-react'

/** Compact live availability check for the quantity being sold against what's actually in stock. */
export default function InventoryPanel({ available, requested }: { available: number; requested: number }) {
  const remaining = available - requested
  const overRequested = requested > available

  return (
    <div style={{ borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--row-line)' }}>
        <div style={{ padding: '10px 12px', background: 'var(--surface)' }}>
          <div style={{ fontSize: 10, color: 'var(--text-faint)', fontWeight: 700, textTransform: 'uppercase' }}>Available</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{available}</div>
        </div>
        <div style={{ padding: '10px 12px', background: 'var(--surface)' }}>
          <div style={{ fontSize: 10, color: 'var(--text-faint)', fontWeight: 700, textTransform: 'uppercase' }}>Requested</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{requested}</div>
        </div>
        <div style={{ padding: '10px 12px', background: 'var(--surface)' }}>
          <div style={{ fontSize: 10, color: 'var(--text-faint)', fontWeight: 700, textTransform: 'uppercase' }}>Remaining</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: overRequested ? 'var(--danger)' : 'var(--text)' }}>{remaining}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px', background: overRequested ? 'var(--danger-bg)' : 'var(--success-bg)', color: overRequested ? 'var(--danger)' : 'var(--success)', fontSize: 12, fontWeight: 700 }}>
        {overRequested ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
        {overRequested ? 'Not enough stock available' : 'Sufficient stock available'}
      </div>
    </div>
  )
}
