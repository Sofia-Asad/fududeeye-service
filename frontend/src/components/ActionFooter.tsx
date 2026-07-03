import type { ReactNode } from 'react'

export default function ActionFooter({
  note,
  children,
}: {
  note?: ReactNode
  children: ReactNode
}) {
  return (
    <div
      className="card action-footer"
    >
      <div className="action-footer-note">
        {note}
      </div>
      <div className="action-footer-actions">
        {children}
      </div>
    </div>
  )
}
