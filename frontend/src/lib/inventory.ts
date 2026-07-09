import type { CategoryKind, ItemAttributes, ItemCondition, ItemStatus, OwnerType } from '@/types/inventory'

export const CATEGORY_KIND_LABELS: Record<CategoryKind, string> = {
  REAL_ESTATE: 'Real estate',
  VEHICLE: 'Vehicle',
  ELECTRONICS: 'Electronics',
  FURNITURE: 'Furniture',
  GENERIC: 'Generic',
}

export const OWNER_TYPE_LABELS: Record<OwnerType, string> = {
  COMPANY: 'Company',
  CONSIGNMENT: 'Consignment',
}

export const CONDITION_LABELS: Record<ItemCondition, string> = {
  NEW: 'New',
  USED: 'Used',
  REFURBISHED: 'Refurbished',
}

export const STATUS_LABELS: Record<ItemStatus, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  RESERVED: 'Reserved',
  SOLD: 'Sold',
  COMPLETED: 'Completed',
  REFUNDED: 'Refunded',
  WITHDRAWN: 'Withdrawn',
}

export const ITEM_STATUSES: ItemStatus[] = [
  'DRAFT',
  'ACTIVE',
  'RESERVED',
  'SOLD',
  'COMPLETED',
  'REFUNDED',
  'WITHDRAWN',
]

export const ITEM_CONDITIONS: ItemCondition[] = ['USED', 'NEW', 'REFURBISHED']

export interface AttributeField {
  key: string
  label: string
  type: 'text' | 'number' | 'select'
  options?: string[]
}

export const ATTRIBUTE_FIELDS: Record<CategoryKind, AttributeField[]> = {
  REAL_ESTATE: [
    { key: 'bedrooms', label: 'Bedrooms', type: 'number' },
    { key: 'bathrooms', label: 'Bathrooms', type: 'number' },
    { key: 'floor', label: 'Floor', type: 'number' },
    { key: 'sqm', label: 'Square meters', type: 'number' },
    { key: 'parking', label: 'Parking', type: 'select', options: ['Yes', 'No'] },
    { key: 'furnished', label: 'Furnished', type: 'select', options: ['Yes', 'No'] },
    { key: 'listing_type', label: 'Listing type', type: 'select', options: ['sale', 'rent'] },
  ],
  VEHICLE: [
    { key: 'make', label: 'Brand', type: 'text' },
    { key: 'model', label: 'Model', type: 'text' },
    { key: 'year', label: 'Year', type: 'number' },
    { key: 'fuel', label: 'Fuel', type: 'select', options: ['Petrol', 'Diesel', 'Electric', 'Hybrid'] },
    { key: 'mileage', label: 'Mileage', type: 'number' },
    { key: 'transmission', label: 'Transmission', type: 'select', options: ['Manual', 'Automatic'] },
  ],
  ELECTRONICS: [
    { key: 'brand', label: 'Brand', type: 'text' },
    { key: 'model', label: 'Model', type: 'text' },
    { key: 'storage', label: 'Storage', type: 'text' },
    { key: 'ram', label: 'RAM', type: 'text' },
    { key: 'warranty', label: 'Warranty', type: 'select', options: ['Yes', 'No'] },
    { key: 'serial', label: 'Serial', type: 'text' },
  ],
  FURNITURE: [
    { key: 'material', label: 'Material', type: 'text' },
    { key: 'color', label: 'Color', type: 'text' },
    { key: 'dimensions', label: 'Dimensions', type: 'text' },
    { key: 'weight', label: 'Weight (kg)', type: 'number' },
  ],
  GENERIC: [
    { key: 'notes', label: 'Extra notes', type: 'text' },
  ],
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value))
}

export function compactAttributes(values: Record<string, string>, fields: AttributeField[]): ItemAttributes {
  return fields.reduce<ItemAttributes>((attrs, field) => {
    const rawValue = values[field.key]?.trim()
    if (!rawValue) {
      return attrs
    }
    attrs[field.key] = field.type === 'number' ? Number(rawValue) : rawValue
    return attrs
  }, {})
}

export function attributesToFormValues(attributes: ItemAttributes, fields: AttributeField[]) {
  return fields.reduce<Record<string, string>>((values, field) => {
    const value = attributes[field.key]
    values[field.key] = value === undefined || value === null ? '' : String(value)
    return values
  }, {})
}
