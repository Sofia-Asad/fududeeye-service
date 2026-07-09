import { Package, ShoppingCart, Tag } from 'lucide-react'

import SearchableSelect from '@/components/wizard/SearchableSelect'
import MoneyDisplay from '@/components/MoneyDisplay'
import type { Item } from '@/types/inventory'

export default function ItemPickerPanel({
  items,
  value,
  onSelect,
  error,
}: {
  items: Item[]
  value: string
  onSelect: (item: Item) => void
  error?: boolean
}) {
  const selected = items.find(item => String(item.id) === value)

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <SearchableSelect
        options={items}
        value={value}
        getId={item => String(item.id)}
        getLabel={item => item.title}
        placeholder="Search items by name..."
        emptyLabel="No active items with stock available."
        error={error}
        onSelect={onSelect}
        renderOption={item => (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{item.title}</span>
              <span style={{ display: 'block', fontSize: 11.5, color: 'var(--muted)' }}>{item.category_name} · {item.quantity_available} available</span>
            </span>
            <strong style={{ fontSize: 13, color: 'var(--primary-hover)', flexShrink: 0 }}>${item.listed_price}</strong>
          </div>
        )}
      />

      {selected && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, display: 'grid', gap: 8, background: 'var(--surface-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <span style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: 9, background: 'var(--primary-soft)', color: 'var(--primary-hover)', flexShrink: 0 }}>
                <Package size={15} />
              </span>
              <span style={{ minWidth: 0 }}>
                <strong style={{ display: 'block', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.title}</strong>
                <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{selected.category_name}</span>
              </span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: selected.owner_type === 'CONSIGNMENT' ? 'var(--warning-bg)' : 'var(--info-bg)', color: selected.owner_type === 'CONSIGNMENT' ? 'var(--warning)' : 'var(--info)', flexShrink: 0 }}>
              {selected.owner_type === 'CONSIGNMENT' ? 'Consignment' : 'Company Stock'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <div>
              <div style={{ fontSize: 10.5, color: 'var(--text-faint)', fontWeight: 700, textTransform: 'uppercase' }}>Available</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{selected.quantity_available}</div>
            </div>
            <div>
              <div style={{ fontSize: 10.5, color: 'var(--text-faint)', fontWeight: 700, textTransform: 'uppercase' }}>Listed</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}><MoneyDisplay value={selected.listed_price} /></div>
            </div>
            <div>
              <div style={{ fontSize: 10.5, color: 'var(--text-faint)', fontWeight: 700, textTransform: 'uppercase' }}>
                {selected.owner_type === 'CONSIGNMENT' ? 'Asking' : 'Cost'}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>
                <MoneyDisplay value={selected.owner_type === 'CONSIGNMENT' ? (selected.owner_asking_price ?? '0') : (selected.cost_price ?? '0')} />
              </div>
            </div>
          </div>

          {selected.owner_type === 'CONSIGNMENT' && selected.owner_name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
              <Tag size={13} />
              Owner: {selected.owner_name}
            </div>
          )}
        </div>
      )}

      {!selected && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-faint)', fontSize: 12 }}>
          <ShoppingCart size={14} />
          Search and select an item to see its details.
        </div>
      )}
    </div>
  )
}
