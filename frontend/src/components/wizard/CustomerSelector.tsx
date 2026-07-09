import { User } from 'lucide-react'

import CustomerPreviewCard from '@/components/wizard/CustomerPreviewCard'
import SearchableSelect from '@/components/wizard/SearchableSelect'
import type { Customer } from '@/types/customer'

/** Searchable customer picker with a live preview card underneath — shared by every module that links a record to a customer. */
export default function CustomerSelector({
  customers,
  value,
  onSelect,
  error,
  placeholder = 'Search by name or phone...',
}: {
  customers: Customer[]
  value: string
  onSelect: (customer: Customer) => void
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
        placeholder={placeholder}
        emptyLabel="No customers found."
        error={error}
      />
      {selected && <CustomerPreviewCard customer={selected} />}
    </div>
  )
}
