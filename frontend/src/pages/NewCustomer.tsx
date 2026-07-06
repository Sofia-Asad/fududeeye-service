import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, MapPin, Phone, Save, Smartphone, UserPlus } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'

import { createCustomer } from '@/api/customers'
import ActionFooter from '@/components/ActionFooter'
import FormSection, { FieldLabel, FormGrid, IconInput } from '@/components/FormSection'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import { emptyCustomerForm, customerSchema, type CustomerFormValues } from '@/lib/customerSchema'
import { formErrorMessage } from '@/lib/errors'
import { notifyError, notifySuccess } from '@/lib/toast'
import { useFocusFirstError } from '@/lib/validation'

type FieldErrors = Partial<Record<keyof CustomerFormValues, string>>

export default function NewCustomer() {
  const navigate = useNavigate()
  const formRef = useRef<HTMLFormElement>(null)
  const [form, setForm] = useState<CustomerFormValues>(emptyCustomerForm)
  const [errors, setErrors] = useState<FieldErrors>({})

  useFocusFirstError(errors, formRef)

  const create = useMutation({
    mutationFn: createCustomer,
    onSuccess: customer => {
      notifySuccess('Customer created')
      navigate(`/customers/${customer.id}`)
    },
    onError: error => notifyError(formErrorMessage(error, 'Customer could not be saved.')),
  })

  function updateField<K extends keyof CustomerFormValues>(field: K, value: CustomerFormValues[K]) {
    setForm(current => ({ ...current, [field]: value }))
    setErrors(current => ({ ...current, [field]: undefined }))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = customerSchema.safeParse(form)
    if (!parsed.success) {
      const nextErrors: FieldErrors = {}
      parsed.error.issues.forEach(issue => {
        const field = issue.path[0] as keyof CustomerFormValues | undefined
        if (field && !nextErrors[field]) nextErrors[field] = issue.message
      })
      setErrors(nextErrors)
      return
    }
    create.mutate(parsed.data)
  }

  return (
    <Layout>
      <div className="app-page">
        <div className="app-page-narrow">
          <Link to="/customers" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--primary-hover)', fontSize: 13, fontWeight: 700, textDecoration: 'none', marginBottom: 14 }}>
            <ArrowLeft size={16} />
            Customers
          </Link>

          <PageHeader
            eyebrow="Manage"
            title="New customer"
            subtitle="Create a buyer, seller, or consignment owner profile."
          />

          <form ref={formRef} onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
            <FormSection icon={<UserPlus size={18} />} title="Contact profile" description="Primary customer identity and reachable contact details.">
              <FormGrid>
                <FieldLabel label="Full name" required error={errors.full_name} name="full_name">
                  <input className="control" value={form.full_name} onChange={event => updateField('full_name', event.target.value)} style={{ width: '100%', padding: '0 12px' }} />
                </FieldLabel>
                <FieldLabel label="Phone" required error={errors.phone} name="phone">
                  <IconInput icon={<Phone size={15} />} value={form.phone} onChange={event => updateField('phone', event.target.value)} />
                </FieldLabel>
                <FieldLabel label="Alternate phone" error={errors.alternate_phone} name="alternate_phone">
                  <IconInput icon={<Smartphone size={15} />} value={form.alternate_phone} onChange={event => updateField('alternate_phone', event.target.value)} />
                </FieldLabel>
                <FieldLabel label="Email" error={errors.email} name="email">
                  <IconInput icon={<Mail size={15} />} type="email" value={form.email} onChange={event => updateField('email', event.target.value)} />
                </FieldLabel>
              </FormGrid>

              <FieldLabel label="Address" error={errors.address} name="address">
                <span style={{ position: 'relative', display: 'block' }}>
                  <span style={{ position: 'absolute', left: 13, top: 12, color: 'var(--muted)', pointerEvents: 'none' }}>
                    <MapPin size={15} />
                  </span>
                  <textarea className="control" value={form.address} onChange={event => updateField('address', event.target.value)} rows={3} style={{ width: '100%', height: 'auto', padding: '11px 12px 11px 38px', resize: 'vertical' }} />
                </span>
              </FieldLabel>

              <FieldLabel label="Notes" error={errors.notes} name="notes">
                <textarea className="control" value={form.notes} onChange={event => updateField('notes', event.target.value)} rows={4} style={{ width: '100%', height: 'auto', padding: 12, resize: 'vertical' }} />
              </FieldLabel>

              <label className="checkbox-row" style={{ marginTop: 2 }}>
                <input checked={form.is_active} onChange={event => updateField('is_active', event.target.checked)} type="checkbox" />
                Active customer
              </label>
            </FormSection>

            {create.isError && <div className="error-banner">{formErrorMessage(create.error, 'Customer could not be saved.')}</div>}

            <ActionFooter>
              <Link to="/customers" className="secondary-button">Cancel</Link>
              <button type="submit" disabled={create.isPending} className="primary-button" style={{ opacity: create.isPending ? .7 : 1 }}>
                <Save size={16} />
                {create.isPending ? 'Saving...' : 'Save customer'}
              </button>
            </ActionFooter>
          </form>
        </div>
      </div>
    </Layout>
  )
}
