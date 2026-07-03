import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function PaginationFooter({
  page,
  total,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: {
  page: number
  total?: number
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, color: 'var(--muted)', fontSize: 13 }}>
      <span>{total !== undefined ? `Page ${page} of ${total} records` : `Page ${page}`}</span>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          disabled={!hasPrevious}
          onClick={onPrevious}
          className="secondary-button"
          style={{ width: 34, height: 34, padding: 0, opacity: hasPrevious ? 1 : .45, cursor: hasPrevious ? 'pointer' : 'not-allowed' }}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          disabled
          style={{ width: 34, height: 34, border: '1px solid var(--primary)', borderRadius: 10, background: 'var(--primary)', color: '#fff', fontWeight: 700 }}
          aria-label={`Current page ${page}`}
        >
          {page}
        </button>
        <button
          type="button"
          disabled={!hasNext}
          onClick={onNext}
          className="secondary-button"
          style={{ width: 34, height: 34, padding: 0, opacity: hasNext ? 1 : .45, cursor: hasNext ? 'pointer' : 'not-allowed' }}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
