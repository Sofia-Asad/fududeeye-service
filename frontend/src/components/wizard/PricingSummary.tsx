import { CircleDollarSign, TrendingDown, TrendingUp } from 'lucide-react'

const TONES = {
  good: { color: 'var(--success)', bg: 'var(--success-bg)', label: 'Good profit' },
  low: { color: 'var(--warning)', bg: 'var(--warning-bg)', label: 'Low margin' },
  loss: { color: 'var(--danger)', bg: 'var(--danger-bg)', label: 'Loss' },
} as const

export interface PricingExtraRow {
  label: string
  value: string
}

/** Live cost-vs-listed-price summary — reusable anywhere a margin/profit preview is useful (Items, Sales, Expenses, etc). */
export default function PricingSummary({
  basePrice,
  listedPrice,
  profitLabel = 'Expected profit',
  extraRows,
}: {
  basePrice: number
  listedPrice: number
  profitLabel?: string
  extraRows?: PricingExtraRow[]
}) {
  const profit = listedPrice - basePrice
  const margin = listedPrice > 0 ? (profit / listedPrice) * 100 : 0
  const tone = profit < 0 ? TONES.loss : margin < 20 ? TONES.low : TONES.good

  return (
    <div style={{ borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: tone.bg }}>
        <span style={{ display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,.6)', color: tone.color, flexShrink: 0 }}>
          {profit < 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
        </span>
        <span>
          <span style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: tone.color }}>{tone.label}</span>
          <span style={{ display: 'block', fontSize: 11.5, color: 'var(--muted)' }}>Updates live as you type</span>
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--row-line)' }}>
        <div style={{ padding: '12px 14px', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase' }}>
            <CircleDollarSign size={12} />
            {profitLabel}
          </div>
          <div className="serif" style={{ marginTop: 4, fontSize: 20, fontWeight: 700, color: tone.color }}>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(profit)}
          </div>
        </div>
        <div style={{ padding: '12px 14px', background: 'var(--surface)' }}>
          <div style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase' }}>Margin</div>
          <div className="serif" style={{ marginTop: 4, fontSize: 20, fontWeight: 700, color: tone.color }}>
            {listedPrice > 0 ? `${margin.toFixed(1)}%` : '—'}
          </div>
        </div>
      </div>
      {extraRows && extraRows.length > 0 && (
        <div style={{ display: 'grid', gap: 8, padding: '12px 14px', borderTop: '1px solid var(--row-line)', background: 'var(--surface)' }}>
          {extraRows.map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>{row.label}</span>
              <strong style={{ fontSize: 13 }}>{row.value}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
