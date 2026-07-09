import { ChevronDown, Check } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * Single free-form collapsible section — unlike `Accordion` (linear wizard,
 * locked until reached), any AccordionCard can be opened or closed at any
 * time. The parent page owns which one is open and which are "done".
 */
export default function AccordionCard({
  icon,
  title,
  description,
  isOpen,
  isDone,
  onToggle,
  children,
}: {
  icon: ReactNode
  title: string
  description: string
  isOpen: boolean
  isDone?: boolean
  onToggle: () => void
  children: ReactNode
}) {
  const state = isOpen ? 'active' : isDone ? 'done' : 'idle'

  return (
    <div className="accordion-section" data-state={state}>
      <button type="button" className="accordion-header" onClick={onToggle} aria-expanded={isOpen}>
        <span className="accordion-header-icon">{isDone && !isOpen ? <Check size={15} /> : icon}</span>
        <span className="accordion-header-text">
          <strong>{title}</strong>
          <span data-tone={isDone && !isOpen ? 'done' : isOpen ? 'active' : undefined}>
            {isDone && !isOpen ? 'Completed' : description}
          </span>
        </span>
        <ChevronDown size={17} className="accordion-chevron" />
      </button>
      <div className="accordion-body-wrap">
        <div className="accordion-body-inner">
          <div className="accordion-body">{children}</div>
        </div>
      </div>
    </div>
  )
}
