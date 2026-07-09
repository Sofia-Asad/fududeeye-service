import { FieldLabel } from '@/components/FormSection'
import type { CustomerFormValues } from '@/lib/customerSchema'

type FieldErrors = Partial<Record<keyof CustomerFormValues, string>>

/** Fields only — rendered inside an accordion section, which supplies the icon/title/description chrome. */
export default function AdditionalInfoStep({
  form,
  errors,
  onChange,
}: {
  form: CustomerFormValues
  errors: FieldErrors
  onChange: <K extends keyof CustomerFormValues>(field: K, value: CustomerFormValues[K]) => void
}) {
  return (
    <>
      <FieldLabel label="Notes" error={errors.notes} name="notes">
        <textarea
          className="control"
          value={form.notes}
          onChange={event => onChange('notes', event.target.value)}
          rows={3}
          placeholder="Anything the team should know about this customer..."
          style={{ width: '100%', height: 'auto', padding: 10, resize: 'vertical' }}
        />
      </FieldLabel>

      <label className="checkbox-row" style={{ marginTop: 2 }}>
        <input checked={form.is_active} onChange={event => onChange('is_active', event.target.checked)} type="checkbox" />
        Active customer
      </label>
    </>
  )
}
