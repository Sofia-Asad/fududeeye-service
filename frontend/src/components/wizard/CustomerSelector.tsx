import { Plus, User } from 'lucide-react'

import CustomerPreviewCard from '@/components/wizard/CustomerPreviewCard'
import SearchableSelect from '@/components/wizard/SearchableSelect'
import type { Customer } from '@/types/customer'

/** Searchable customer picker with a live preview card underneath — shared by every module that links a record to a customer. */
export default function CustomerSelector({
  customers,
  value,
  onSelect,
  onSearch,
  allowQuickAdd,
  onQuickAdd,
  error,
  placeholder = 'Search by name or phone...',
}: {
  customers: Customer[]
  value: string
  onSelect: (customer: Customer) => void
  /** Fires on every keystroke so the parent can drive a server-side search. */
  onSearch?: (query: string) => void
  /** Shows a "+ Quick Add Customer" action when no results match — Items and Demands only, never Complaints. */
  allowQuickAdd?: boolean
  onQuickAdd?: (query: string) => void
  error?: boolean
  placeholder?: string
}) {
  const selected = customers.find(customer => String(customer.id) === value)

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <SearchableSelect
        options={customers}
        value={value}
        getId={customer => String(customer.id)}
        getLabel={customer => `${customer.full_name} - ${customer.phone}`}
        renderOption={customer => (
          <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ width: 26, height: 26, borderRadius: 999, display: 'grid', placeItems: 'center', background: 'var(--primary-soft)', color: 'var(--primary-hover)', flexShrink: 0 }}>
              <User size={12.5} />
            </span>
            <span>
              <strong style={{ display: 'block', fontSize: 13 }}>{customer.full_name}</strong>
              <span style={{ color: 'var(--muted)', fontSize: 11.5 }}>{customer.phone}</span>
            </span>
          </span>
        )}
        onSelect={onSelect}
        onQueryChange={onSearch}
        placeholder={placeholder}
        emptyLabel="No customers found."
        error={error}
        renderEmpty={allowQuickAdd ? query => (
          <div style={{ padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ color: 'var(--muted)', fontSize: 12.5, marginBottom: 8 }}>No customers found.</div>
            <button
              type="button"
              onMouseDown={event => event.preventDefault()}
              onClick={() => onQuickAdd?.(query)}
              className="secondary-button"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Plus size={14} />
              Quick Add Customer
            </button>
          </div>
        ) : undefined}
      />
      {selected && <CustomerPreviewCard customer={selected} />}
    </div>
  )
}
