import MoneyDisplay from '@/components/MoneyDisplay'

const TONES = {
  good: { bg: 'var(--success-bg)', fg: 'var(--success)' },
  low: { bg: 'var(--warning-bg)', fg: 'var(--warning)' },
  loss: { bg: 'var(--danger-bg)', fg: 'var(--danger)' },
} as const

/** Colored profit badge for table rows — same green/orange/red thresholds as PricingSummary. */
export default function ProfitBadge({ profit, saleTotal }: { profit: number; saleTotal: number }) {
  const margin = saleTotal > 0 ? (profit / saleTotal) * 100 : 0
  const tone = profit < 0 ? TONES.loss : margin < 20 ? TONES.low : TONES.good

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: tone.bg, color: tone.fg, fontSize: 12.5 }}>
      <MoneyDisplay value={profit} />
    </span>
  )
}
