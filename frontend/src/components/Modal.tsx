import { type FormEvent, type ReactNode, type RefObject } from 'react'
import { X } from 'lucide-react'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  footer?: ReactNode
  width?: number
  formRef?: RefObject<HTMLFormElement | null>
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void
  children: ReactNode
}

export default function Modal({ open, onClose, title, description, footer, width = 560, formRef, onSubmit, children }: ModalProps) {
  if (!open) return null

  const body = (
    <>
      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '20px 22px', borderBottom: '1px solid var(--row-line)' }}>
        <div>
          <h2 className="serif" style={{ margin: 0, fontSize: 23, lineHeight: 1.15 }}>{title}</h2>
          {description && <p style={{ margin: '5px 0 0', color: 'var(--muted)', fontSize: 13 }}>{description}</p>}
        </div>
        <button type="button" onClick={onClose} className="secondary-button" style={{ width: 38, height: 38, padding: 0, flexShrink: 0 }} aria-label="Close">
          <X size={16} />
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 22, display: 'grid', gap: 16 }}>
        {children}
      </div>
      {footer && (
        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 22px', borderTop: '1px solid var(--row-line)' }}>
          {footer}
        </div>
      )}
    </>
  )

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50, display: 'grid', placeItems: 'center',
        background: 'rgba(16, 20, 40, .45)', backdropFilter: 'blur(2px)', padding: 20,
      }}
      onClick={onClose}
    >
      {onSubmit ? (
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="card"
          style={{ width: `min(${width}px, 100%)`, maxHeight: '88vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)' }}
          onClick={event => event.stopPropagation()}
        >
          {body}
        </form>
      ) : (
        <div
          className="card"
          style={{ width: `min(${width}px, 100%)`, maxHeight: '88vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)' }}
          onClick={event => event.stopPropagation()}
        >
          {body}
        </div>
      )}
    </div>
  )
}
