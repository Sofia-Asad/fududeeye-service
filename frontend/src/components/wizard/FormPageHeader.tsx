import { Link } from 'react-router-dom'
import { ArrowLeft, CalendarDays, UserRound } from 'lucide-react'
import type { ReactNode } from 'react'

export interface Breadcrumb {
  label: string
  to?: string
}

/** Page-level header for CRUD "new/edit" pages — back button, icon, title, breadcrumb trail, and a Created By / Date meta panel. */
export default function FormPageHeader({
  backTo,
  icon,
  title,
  breadcrumb,
  createdBy,
  date,
}: {
  backTo: string
  icon: ReactNode
  title: string
  breadcrumb: Breadcrumb[]
  createdBy?: string
  date?: string
}) {
  return (
    <div className="wizard-page-header">
      <div className="wizard-page-header-left">
        <Link to={backTo} className="wizard-back-button" aria-label="Back">
          <ArrowLeft size={18} />
        </Link>
        <span className="wizard-icon-badge">{icon}</span>
        <div>
          <h1 className="serif" style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{title}</h1>
          <div className="wizard-breadcrumb">
            {breadcrumb.map((crumb, index) => (
              <span key={crumb.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {index > 0 && <span aria-hidden="true">/</span>}
                {crumb.to ? (
                  <Link to={crumb.to} style={{ color: 'inherit', textDecoration: 'none' }}>{crumb.label}</Link>
                ) : (
                  <span className={index === breadcrumb.length - 1 ? 'wizard-breadcrumb-current' : undefined}>{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {(createdBy || date) && (
        <div className="wizard-meta-grid">
          {createdBy && (
            <div className="wizard-meta-chip">
              <span className="wizard-meta-icon"><UserRound size={15} /></span>
              <span>
                <div className="wizard-meta-label">Created by</div>
                <div className="wizard-meta-value">{createdBy}</div>
              </span>
            </div>
          )}
          {date && (
            <div className="wizard-meta-chip">
              <span className="wizard-meta-icon"><CalendarDays size={15} /></span>
              <span>
                <div className="wizard-meta-label">Date</div>
                <div className="wizard-meta-value">{date}</div>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
