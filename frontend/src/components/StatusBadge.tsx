const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  ACTIVE: { bg: 'var(--success-bg)', fg: 'var(--success)' },
  PAID: { bg: 'var(--success-bg)', fg: 'var(--success)' },
  RESOLVED: { bg: 'var(--success-bg)', fg: 'var(--success)' },
  MATCHED: { bg: 'var(--success-bg)', fg: 'var(--success)' },
  FULFILLED: { bg: 'var(--success-bg)', fg: 'var(--success)' },
  COMPLETED: { bg: 'var(--success-bg)', fg: 'var(--success)' },
  PENDING: { bg: 'var(--warning-bg)', fg: 'var(--warning)' },
  OPEN: { bg: 'var(--warning-bg)', fg: 'var(--warning)' },
  DRAFT: { bg: 'var(--warning-bg)', fg: 'var(--warning)' },
  NEW: { bg: 'var(--warning-bg)', fg: 'var(--warning)' },
  RESERVED: { bg: 'var(--info-bg)', fg: 'var(--info)' },
  IN_PROGRESS: { bg: 'var(--info-bg)', fg: 'var(--info)' },
  CONTACTED: { bg: 'var(--info-bg)', fg: 'var(--info)' },
  MEDIUM: { bg: 'var(--info-bg)', fg: 'var(--info)' },
  REFUNDED: { bg: 'var(--danger-bg)', fg: 'var(--danger)' },
  HIGH: { bg: 'var(--danger-bg)', fg: 'var(--danger)' },
  URGENT: { bg: 'var(--danger-bg)', fg: 'var(--danger)' },
  SOLD: { bg: 'var(--neutral-bg)', fg: 'var(--neutral)' },
  CLOSED: { bg: 'var(--neutral-bg)', fg: 'var(--neutral)' },
  WITHDRAWN: { bg: 'var(--neutral-bg)', fg: 'var(--neutral)' },
  DROPPED: { bg: 'var(--neutral-bg)', fg: 'var(--neutral)' },
  INACTIVE: { bg: 'var(--neutral-bg)', fg: 'var(--neutral)' },
  NA: { bg: 'var(--neutral-bg)', fg: 'var(--neutral)' },
  LOW: { bg: 'var(--neutral-bg)', fg: 'var(--neutral)' },
}

export default function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? { bg: 'var(--neutral-bg)', fg: 'var(--neutral)' }
  const label = status.replaceAll('_', ' ').toLowerCase()

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 11.5,
        fontWeight: 600,
        padding: '3px 11px',
        borderRadius: 999,
        background: style.bg,
        color: style.fg,
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}
