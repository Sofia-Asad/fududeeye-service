import type { Category } from '@/types/inventory'
import type { ItemCondition } from '@/types/inventory'

import { FieldLabel, FormGrid } from '@/components/FormSection'
import { CATEGORY_KIND_LABELS, CONDITION_LABELS, ITEM_CONDITIONS } from '@/lib/inventory'

export interface ItemBasicsValues {
  title: string
  category: string
  quantity: string
  condition: ItemCondition
  location: string
  description: string
}

type FieldErrors = Partial<Record<keyof ItemBasicsValues, string>>

export default function ItemBasicsFields({
  values,
  errors,
  categories,
  onChange,
}: {
  values: ItemBasicsValues
  errors: FieldErrors
  categories: Category[]
  onChange: (field: keyof ItemBasicsValues, value: string) => void
}) {
  return (
    <>
      <FormGrid>
        <FieldLabel label="Title" required error={errors.title} name="title">
          <input className="control" value={values.title} onChange={event => onChange('title', event.target.value)} placeholder="Enter item title" style={{ width: '100%', padding: '0 12px' }} />
        </FieldLabel>
        <FieldLabel label="Category" required error={errors.category} name="category">
          <select className="control" value={values.category} onChange={event => onChange('category', event.target.value)} style={{ width: '100%', padding: '0 12px' }}>
            <option value="">Choose category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name} - {CATEGORY_KIND_LABELS[category.kind]}</option>
            ))}
          </select>
        </FieldLabel>
        <FieldLabel label="Quantity" required error={errors.quantity} name="quantity">
          <input className="control" value={values.quantity} onChange={event => onChange('quantity', event.target.value)} inputMode="numeric" style={{ width: '100%', padding: '0 12px' }} />
        </FieldLabel>
        <FieldLabel label="Condition">
          <select className="control" value={values.condition} onChange={event => onChange('condition', event.target.value as ItemCondition)} style={{ width: '100%', padding: '0 12px' }}>
            {ITEM_CONDITIONS.map(condition => (
              <option key={condition} value={condition}>{CONDITION_LABELS[condition]}</option>
            ))}
          </select>
        </FieldLabel>
        <FieldLabel label="Location">
          <input className="control" value={values.location} onChange={event => onChange('location', event.target.value)} placeholder="Showroom shelf, warehouse row..." style={{ width: '100%', padding: '0 12px' }} />
        </FieldLabel>
      </FormGrid>
      <FieldLabel label="Description" helper="Optional customer-facing notes for this item.">
        <textarea className="control" value={values.description} onChange={event => onChange('description', event.target.value)} rows={3} style={{ width: '100%', height: 'auto', padding: 10, resize: 'vertical' }} />
      </FieldLabel>
    </>
  )
}
