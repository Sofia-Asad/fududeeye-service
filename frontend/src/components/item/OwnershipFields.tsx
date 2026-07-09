import { FieldLabel, FormGrid, MoneyInput, SegmentedControl } from '@/components/FormSection'
import type { Customer } from '@/types/customer'
import type { OwnerType } from '@/types/inventory'

export interface OwnershipValues {
  owner_type: OwnerType
  owner: string
  owner_asking_price: string
  cost_price: string
}

type FieldErrors = Partial<Record<keyof OwnershipValues, string>>

export default function OwnershipFields({
  values,
  errors,
  customers,
  onChange,
}: {
  values: OwnershipValues
  errors: FieldErrors
  customers: Customer[]
  onChange: (field: keyof OwnershipValues, value: string) => void
}) {
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <FieldLabel label="Owner type">
        <SegmentedControl
          value={values.owner_type}
          onChange={value => onChange('owner_type', value)}
          options={[
            { value: 'COMPANY', label: 'Company Stock' },
            { value: 'CONSIGNMENT', label: 'Consignment' },
          ]}
        />
      </FieldLabel>

      <div key={values.owner_type} className="fade-slide-in">
        <FormGrid>
          {values.owner_type === 'CONSIGNMENT' ? (
            <>
              <FieldLabel label="Owner" required error={errors.owner} name="owner">
                <select className="control" value={values.owner} onChange={event => onChange('owner', event.target.value)} style={{ width: '100%', padding: '0 12px' }}>
                  <option value="">Choose customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.full_name} - {customer.phone}</option>
                  ))}
                </select>
              </FieldLabel>
              <FieldLabel label="Owner asking price" required error={errors.owner_asking_price} name="owner_asking_price">
                <MoneyInput value={values.owner_asking_price} onChange={event => onChange('owner_asking_price', event.target.value)} />
              </FieldLabel>
            </>
          ) : (
            <FieldLabel label="Cost price" required error={errors.cost_price} name="cost_price">
              <MoneyInput value={values.cost_price} onChange={event => onChange('cost_price', event.target.value)} />
            </FieldLabel>
          )}
        </FormGrid>
      </div>
    </div>
  )
}
