import { FieldLabel, FormGrid } from '@/components/FormSection'

export interface DynamicField {
  key: string
  label: string
  type: 'text' | 'number' | 'select'
  options?: string[]
}

/** Renders a category's dynamic attribute fields into the shared generic `attributes` JSON bag — reusable for any module with category-specific fields. */
export default function CategoryFieldRenderer({
  fields,
  values,
  onChange,
}: {
  fields: DynamicField[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
}) {
  return (
    <FormGrid>
      {fields.map(field => (
        <FieldLabel key={field.key} label={field.label}>
          {field.type === 'select' ? (
            <select className="control" value={values[field.key] ?? ''} onChange={event => onChange(field.key, event.target.value)} style={{ width: '100%', padding: '0 12px' }}>
              <option value="">Choose</option>
              {(field.options ?? []).map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <input
              className="control"
              value={values[field.key] ?? ''}
              onChange={event => onChange(field.key, event.target.value)}
              inputMode={field.type === 'number' ? 'numeric' : undefined}
              style={{ width: '100%', padding: '0 12px' }}
            />
          )}
        </FieldLabel>
      ))}
    </FormGrid>
  )
}
