import { Mail, Phone } from 'lucide-react'

import type { Customer } from '@/types/customer'

function initialsFor(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

function relationshipLabel(customer: Customer) {
  if (customer.is_buyer && customer.is_seller) return 'Buyer & Seller'
  if (customer.is_seller) return 'Seller'
  if (customer.is_buyer) return 'Buyer'
  return 'Contact'
}

/** Compact "who is this" card shown under a customer picker — real backend fields only, no fabricated activity feed. */
export default function CustomerPreviewCard({ customer }: { customer: Customer }) {
  return (
    <div className="fade-slide-in" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      <div style={{ width: 38, height: 38, borderRadius: 999, display: 'grid', placeItems: 'center', background: 'var(--primary-soft)', color: 'var(--primary-hover)', fontSize: 12.5, fontWeight: 800, flexShrink: 0 }}>
        {initialsFor(customer.full_name)}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'grid', gap: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <strong style={{ color: 'var(--text)', fontSize: 13.5 }}>{customer.full_name}</strong>
          <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'var(--primary-soft)', color: 'var(--primary-hover)' }}>
            {relationshipLabel(customer)}
          </span>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 999,
              background: customer.is_active ? 'var(--success-bg)' : 'var(--neutral-bg)',
              color: customer.is_active ? 'var(--success)' : 'var(--neutral)',
            }}
          >
            {customer.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', color: 'var(--muted)', fontSize: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Phone size={11.5} />
            {customer.phone}
          </span>
          {customer.email && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Mail size={11.5} />
              {customer.email}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
