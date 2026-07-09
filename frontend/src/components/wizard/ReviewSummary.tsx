export interface ReviewRow {
  label: string
  value: string
}

/** Read-only key/value recap shown on a wizard's final step, so users can confirm before saving. */
export default function ReviewSummary({ rows }: { rows: ReviewRow[] }) {
  return (
    <div className="review-summary">
      {rows.map(row => (
        <div key={row.label} className="review-summary-row">
          <span className="review-summary-label">{row.label}</span>
          <span className="review-summary-value">{row.value || '—'}</span>
        </div>
      ))}
    </div>
  )
}
