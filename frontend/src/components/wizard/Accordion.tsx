import { ChevronDown, Check } from 'lucide-react'
import type { ReactNode } from 'react'

export interface AccordionSection {
  key: string
  icon: ReactNode
  title: string
  description: string
  /** Whether this section has required fields — shown as a status word ("Required"/"Optional") before the section is reached. */
  required?: boolean
  content: ReactNode
}

/**
 * Hybrid wizard + accordion: all sections stack vertically, but only the
 * active one is expanded. Completed sections collapse with a checkmark;
 * clicking a completed section's header jumps back to it. Upcoming
 * sections are locked (reached only via the wizard's own Next button) so
 * step validation can't be skipped by clicking ahead.
 */
export default function Accordion({
  sections,
  activeIndex,
  onSectionClick,
}: {
  sections: AccordionSection[]
  activeIndex: number
  onSectionClick: (index: number) => void
}) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {sections.map((section, index) => {
        const state = index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'upcoming'
        const clickable = state !== 'upcoming'
        const caption = state === 'done'
          ? 'Completed'
          : state === 'active'
            ? section.description
            : section.required ? 'Required' : 'Optional'

        return (
          <div key={section.key} className="accordion-section" data-state={state}>
            <button
              type="button"
              className="accordion-header"
              onClick={() => clickable && onSectionClick(index)}
              disabled={!clickable}
              aria-expanded={state === 'active'}
            >
              <span className="accordion-header-icon">{state === 'done' ? <Check size={15} /> : section.icon}</span>
              <span className="accordion-header-text">
                <strong>{section.title}</strong>
                <span data-tone={state}>{caption}</span>
              </span>
              <ChevronDown size={17} className="accordion-chevron" />
            </button>
            <div className="accordion-body-wrap">
              <div className="accordion-body-inner">
                <div className="accordion-body">{section.content}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
