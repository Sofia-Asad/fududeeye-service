import { useQuery } from '@tanstack/react-query'
import { Phone, UserRound } from 'lucide-react'

import { listCustomerPurchases } from '@/api/customers'
import SearchableSelect from '@/components/wizard/SearchableSelect'
import StatusBadge from '@/components/StatusBadge'
import type { Customer } from '@/types/customer'

function roles(customer: Customer) {
  const list = []
  if (customer.is_buyer) list.push('Buyer')
  if (customer.is_seller) list.push('Seller')
  return list.length ? list : ['New']
}

export default function BuyerPickerPanel({
  customers,
  value,
  onSelect,
  error,
}: {
  customers: Customer[]
  value: string
  onSelect: (customer: Customer) => void
  error?: boolean
}) {
  const selected = customers.find(customer => String(customer.id) === value)

  const purchases = useQuery({
    queryKey: ['customer-purchases', selected?.id],
    queryFn: () => listCustomerPurchases(selected!.id),
    enabled: Boolean(selected),
  })

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <SearchableSelect
        options={customers}
        value={value}
        getId={customer => String(customer.id)}
        getLabel={customer => customer.full_name}
        placeholder="Search customers by name or phone..."
        emptyLabel="No active customers found."
        error={error}
        onSelect={onSelect}
        renderOption={customer => (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{customer.full_name}</span>
              <span style={{ display: 'block', fontSize: 11.5, color: 'var(--muted)' }}>{customer.phone}</span>
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: 'var(--neutral-bg)', color: 'var(--neutral)', flexShrink: 0 }}>
              {roles(customer)[0]}
            </span>
          </div>
        )}
      />

      {selected && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, display: 'grid', gap: 8, background: 'var(--surface-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <span style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: 9, background: 'var(--primary-soft)', color: 'var(--primary-hover)', flexShrink: 0 }}>
                <UserRound size={15} />
              </span>
              <span style={{ minWidth: 0 }}>
                <strong style={{ display: 'block', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.full_name}</strong>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: 'var(--muted)' }}>
                  <Phone size={11} />
                  {selected.phone}
                </span>
              </span>
            </div>
            <StatusBadge status={selected.is_active ? 'ACTIVE' : 'INACTIVE'} />
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {roles(selected).map(role => (
              <span key={role} style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: 'var(--info-bg)', color: 'var(--info)' }}>{role}</span>
            ))}
          </div>

          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {purchases.isLoading ? 'Loading purchase history...' : `${purchases.data?.count ?? 0} previous purchase${purchases.data?.count === 1 ? '' : 's'}`}
          </div>
        </div>
      )}
    </div>
  )
}
