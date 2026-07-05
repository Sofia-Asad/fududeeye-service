import { Fragment } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export interface BreadcrumbItem {
  label: string
  to?: string
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <Fragment key={item.label}>
              <li className="flex items-center gap-1.5">
                {item.to && !isLast ? (
                  <Link to={item.to} className="hover:text-primary hover:underline">
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={isLast ? 'page' : undefined} className={isLast ? 'font-medium text-ink' : undefined}>
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && <ChevronRight size={14} aria-hidden="true" />}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
