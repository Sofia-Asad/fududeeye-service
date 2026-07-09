import { MapPin } from 'lucide-react'

import { FieldLabel } from '@/components/FormSection'
import type { CustomerFormValues } from '@/lib/customerSchema'

type FieldErrors = Partial<Record<keyof CustomerFormValues, string>>

/** Fields only — rendered inside an accordion section, which supplies the icon/title/description chrome. */
export default function AddressStep({
  form,
  errors,
  onChange,
}: {
  form: CustomerFormValues
  errors: FieldErrors
  onChange: <K extends keyof CustomerFormValues>(field: K, value: CustomerFormValues[K]) => void
}) {
  return (
    <FieldLabel label="Address" error={errors.address} name="address">
      <span style={{ position: 'relative', display: 'block' }}>
        <span style={{ position: 'absolute', left: 13, top: 10, color: 'var(--muted)', pointerEvents: 'none' }}>
          <MapPin size={15} />
        </span>
        <textarea
          className="control"
          value={form.address}
          onChange={event => onChange('address', event.target.value)}
          rows={4}
          placeholder="Enter full address"
          style={{ width: '100%', height: 'auto', padding: '10px 12px 10px 38px', resize: 'vertical' }}
        />
      </span>
    </FieldLabel>
  )
}
