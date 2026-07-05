import { useId, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface AccordionItemData {
  question: string
  answer: ReactNode
}

function AccordionItem({ item, isOpen, onToggle }: { item: AccordionItemData; isOpen: boolean; onToggle: () => void }) {
  const id = useId()

  return (
    <div className="border-b border-border last:border-b-0">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={`${id}-panel`}
          id={`${id}-trigger`}
          className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold text-ink transition-colors hover:text-primary"
        >
          {item.question}
          <ChevronDown
            size={18}
            aria-hidden="true"
            className={cn('shrink-0 text-ink-muted transition-transform', isOpen && 'rotate-180 text-primary')}
          />
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        hidden={!isOpen}
        className="pb-5 text-sm leading-relaxed text-ink-muted"
      >
        {item.answer}
      </div>
    </div>
  )
}

export default function Accordion({ items }: { items: AccordionItemData[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="rounded-lg border border-border bg-surface px-6 shadow-sm">
      {items.map((item, index) => (
        <AccordionItem
          key={item.question}
          item={item}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex(current => (current === index ? null : index))}
        />
      ))}
    </div>
  )
}
