import { FieldLabel, FormGrid, MoneyInput, SegmentedControl } from '@/components/FormSection'
import CustomerSelector from '@/components/wizard/CustomerSelector'
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
  onSearchCustomers,
  onQuickAddCustomer,
}: {
  values: OwnershipValues
  errors: FieldErrors
  customers: Customer[]
  onChange: (field: keyof OwnershipValues, value: string) => void
  onSearchCustomers?: (query: string) => void
  onQuickAddCustomer?: (query: string) => void
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
                <CustomerSelector
                  customers={customers}
                  value={values.owner}
                  onSelect={customer => onChange('owner', String(customer.id))}
                  onSearch={onSearchCustomers}
                  allowQuickAdd
                  onQuickAdd={onQuickAddCustomer}
                  error={!!errors.owner}
                />
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
