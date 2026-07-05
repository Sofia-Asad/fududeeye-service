import { ChevronLeft, ChevronRight } from 'lucide-react'

import Button from '@/components/ui/Button'

export interface PaginationProps {
  page: number
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
  total?: number
}

export default function Pagination({ page, hasPrevious, hasNext, onPrevious, onNext, total }: PaginationProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-ink-muted">
        Page {page}
        {total !== undefined && ` · ${total} total`}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onPrevious} disabled={!hasPrevious}>
          <ChevronLeft size={16} />
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={onNext} disabled={!hasNext}>
          Next
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}
