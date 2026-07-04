export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatChangeValue(value: unknown) {
  if (value === null || value === undefined || value === '') return 'empty'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export function isOldNew(value: unknown): value is { old?: unknown; new?: unknown } {
  return typeof value === 'object' && value !== null && ('old' in value || 'new' in value)
}

export function changesSummary(changes: Record<string, unknown>) {
  const entries = Object.entries(changes)
  if (entries.length === 0) return '-'

  const parts = entries.slice(0, 3).map(([field, value]) => {
    if (isOldNew(value)) {
      return `${field}: ${formatChangeValue(value.old)} -> ${formatChangeValue(value.new)}`
    }
    return `${field}: ${formatChangeValue(value)}`
  })

  if (entries.length > 3) {
    parts.push(`+${entries.length - 3} more`)
  }
  return parts.join('; ')
}

/** Human label for a single changed field, e.g. "Status changed: Open -> Resolved". */
export function changeLabel(
  field: string,
  value: unknown,
  fieldLabels: Record<string, string> = {},
  valueLabels: Record<string, string> = {},
) {
  const label = fieldLabels[field] ?? field.replaceAll('_', ' ')
  const capitalized = label.charAt(0).toUpperCase() + label.slice(1)
  const display = (raw: unknown) => {
    const formatted = formatChangeValue(raw)
    return valueLabels[formatted] ?? formatted
  }
  if (isOldNew(value)) {
    return `${capitalized} changed: ${display(value.old)} -> ${display(value.new)}`
  }
  return `${capitalized}: ${display(value)}`
}
