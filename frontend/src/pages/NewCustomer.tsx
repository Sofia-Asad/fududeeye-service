import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, UserPlus } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { z } from 'zod'

import { createCustomer } from '@/api/customers'
import ActionFooter from '@/components/ActionFooter'
import FormSection, { FieldLabel, FormGrid } from '@/components/FormSection'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'

const customerSchema = z.object({
  full_name: z.string().trim().min(1, 'Full name is required.'),
  phone: z.string().trim().min(1, 'Phone is required.'),
  alternate_phone: z.string().trim(),
  email: z.string().trim().refine(
    value => value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    'Enter a valid email.',
  ),
  address: z.string().trim(),
  notes: z.string().trim(),
  is_active: z.boolean(),
})

type CustomerFormValues = z.infer<typeof customerSchema>
type FieldErrors = Partial<Record<keyof CustomerFormValues, string>>

const emptyForm: CustomerFormValues = {
  full_name: '',
  phone: '',
  alternate_phone: '',
  email: '',
  address: '',
  notes: '',
  is_active: true,
}

function apiErrorMessage(error: unknown) {
  if (!(error instanceof AxiosError)) {
    return 'Customer could not be saved.'
  }
  const data = error.response?.data
  if (data && typeof data === 'object') {
    return Object.entries(data)
      .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : String(messages)}`)
      .join(' ')
  }
  return error.response?.status ? `Customer could not be saved (${error.response.status}).` : 'Customer could not be saved.'
}

export default function NewCustomer() {
  const navigate = useNavigate()
  const [form, setForm] = useState<CustomerFormValues>(emptyForm)
  const [errors, setErrors] = useState<FieldErrors>({})

  const create = useMutation({
    mutationFn: createCustomer,
    onSuccess: customer => {
      navigate(`/customers/${customer.id}`)
    },
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

          <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
            <FormSection icon={<UserPlus size={18} />} title="Contact profile" description="Primary customer identity and reachable contact details.">
              <FormGrid>
                <FieldLabel label="Full name" required error={errors.full_name}>
                  <input className="control" value={form.full_name} onChange={event => updateField('full_name', event.target.value)} style={{ width: '100%', padding: '0 12px', borderColor: errors.full_name ? 'var(--danger)' : undefined, background: errors.full_name ? '#fffbfa' : undefined }} />
                </FieldLabel>
                <FieldLabel label="Phone" required error={errors.phone}>
                  <input className="control" value={form.phone} onChange={event => updateField('phone', event.target.value)} style={{ width: '100%', padding: '0 12px', borderColor: errors.phone ? 'var(--danger)' : undefined, background: errors.phone ? '#fffbfa' : undefined }} />
                </FieldLabel>
                <FieldLabel label="Alternate phone" error={errors.alternate_phone}>
                  <input className="control" value={form.alternate_phone} onChange={event => updateField('alternate_phone', event.target.value)} style={{ width: '100%', padding: '0 12px' }} />
                </FieldLabel>
                <FieldLabel label="Email" error={errors.email}>
                  <input className="control" value={form.email} onChange={event => updateField('email', event.target.value)} style={{ width: '100%', padding: '0 12px', borderColor: errors.email ? 'var(--danger)' : undefined, background: errors.email ? '#fffbfa' : undefined }} />
                </FieldLabel>
              </FormGrid>

              <FieldLabel label="Address" error={errors.address}>
                <textarea className="control" value={form.address} onChange={event => updateField('address', event.target.value)} rows={3} style={{ width: '100%', height: 'auto', padding: 12, resize: 'vertical' }} />
              </FieldLabel>

              <FieldLabel label="Notes" error={errors.notes}>
                <textarea className="control" value={form.notes} onChange={event => updateField('notes', event.target.value)} rows={4} style={{ width: '100%', height: 'auto', padding: 12, resize: 'vertical' }} />
              </FieldLabel>

              <label className="checkbox-row" style={{ marginTop: 2 }}>
                <input checked={form.is_active} onChange={event => updateField('is_active', event.target.checked)} type="checkbox" />
                Active customer
              </label>
            </FormSection>

            {create.isError && <div className="error-banner">{apiErrorMessage(create.error)}</div>}

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
