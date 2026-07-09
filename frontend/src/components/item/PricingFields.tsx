import { FieldLabel, FormGrid, MoneyInput } from '@/components/FormSection'
import PricingSummary from '@/components/wizard/PricingSummary'
import type { OwnerType } from '@/types/inventory'

export default function PricingFields({
  ownerType,
  basePriceField,
  basePriceValue,
  basePriceError,
  listedPrice,
  listedPriceError,
  onChangeBasePrice,
  onChangeListedPrice,
}: {
  ownerType: OwnerType
  basePriceField: 'cost_price' | 'owner_asking_price'
  basePriceValue: string
  basePriceError?: string
  listedPrice: string
  listedPriceError?: string
  onChangeBasePrice: (value: string) => void
  onChangeListedPrice: (value: string) => void
}) {
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <FormGrid>
        <FieldLabel label={ownerType === 'CONSIGNMENT' ? 'Owner asking price' : 'Cost price'} required error={basePriceError} name={basePriceField}>
          <MoneyInput value={basePriceValue} onChange={event => onChangeBasePrice(event.target.value)} />
        </FieldLabel>
        <FieldLabel label="Selling price" required error={listedPriceError} name="listed_price">
          <MoneyInput value={listedPrice} onChange={event => onChangeListedPrice(event.target.value)} />
        </FieldLabel>
      </FormGrid>

      <PricingSummary basePrice={Number(basePriceValue || 0)} listedPrice={Number(listedPrice || 0)} />
    </div>
  )
}
