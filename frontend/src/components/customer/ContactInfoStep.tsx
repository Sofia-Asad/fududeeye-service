import { Mail, Smartphone, UserRound, Phone as PhoneIcon } from 'lucide-react'

import { FieldLabel, FormGrid, IconInput } from '@/components/FormSection'
import type { CustomerFormValues } from '@/lib/customerSchema'

type FieldErrors = Partial<Record<keyof CustomerFormValues, string>>

/** Fields only — rendered inside an accordion section, which supplies the icon/title/description chrome. */
export default function ContactInfoStep({
  form,
  errors,
  onChange,
}: {
  form: CustomerFormValues
  errors: FieldErrors
  onChange: <K extends keyof CustomerFormValues>(field: K, value: CustomerFormValues[K]) => void
}) {
  return (
    <FormGrid>
      <FieldLabel label="Full name" required error={errors.full_name} name="full_name">
        <IconInput icon={<UserRound size={15} />} value={form.full_name} onChange={event => onChange('full_name', event.target.value)} placeholder="Enter full name" />
      </FieldLabel>
      <FieldLabel label="Phone" required error={errors.phone} name="phone">
        <IconInput icon={<PhoneIcon size={15} />} value={form.phone} onChange={event => onChange('phone', event.target.value)} placeholder="Enter phone number" />
      </FieldLabel>
      <FieldLabel label="Alternate phone" error={errors.alternate_phone} name="alternate_phone">
        <IconInput icon={<Smartphone size={15} />} value={form.alternate_phone} onChange={event => onChange('alternate_phone', event.target.value)} placeholder="Enter alternate phone" />
      </FieldLabel>
      <FieldLabel label="Email" error={errors.email} name="email">
        <IconInput icon={<Mail size={15} />} type="email" value={form.email} onChange={event => onChange('email', event.target.value)} placeholder="Enter email address" />
      </FieldLabel>
    </FormGrid>
  )
}
