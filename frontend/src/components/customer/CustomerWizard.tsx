import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ClipboardList, MapPin, Save, UserPlus, UserRound } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'

import { createCustomer } from '@/api/customers'
import { useAuth } from '@/auth/AuthContext'
import ActionFooter from '@/components/ActionFooter'
import Accordion, { type AccordionSection } from '@/components/wizard/Accordion'
import FormPageHeader from '@/components/wizard/FormPageHeader'
import ReviewSummary from '@/components/wizard/ReviewSummary'
import AddressStep from '@/components/customer/AddressStep'
import AdditionalInfoStep from '@/components/customer/AdditionalInfoStep'
import ContactInfoStep from '@/components/customer/ContactInfoStep'
import { emptyCustomerForm, customerSchema, type CustomerFormValues } from '@/lib/customerSchema'
import { formErrorMessage } from '@/lib/errors'
import { notifyError, notifySuccess } from '@/lib/toast'
import { useFocusFirstError } from '@/lib/validation'

type FieldErrors = Partial<Record<keyof CustomerFormValues, string>>

const STEP_FIELDS: (keyof CustomerFormValues)[][] = [
  ['full_name', 'phone', 'alternate_phone', 'email'],
  ['address'],
  ['notes', 'is_active'],
]

const DRAFT_KEY = 'fududeeye:new-customer-draft'

export default function CustomerWizard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const formRef = useRef<HTMLFormElement>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [form, setForm] = useState<CustomerFormValues>(emptyCustomerForm)
  const [errors, setErrors] = useState<FieldErrors>({})

  useFocusFirstError(errors, formRef)

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY)
    if (!saved) return
    try {
      const draft = JSON.parse(saved) as CustomerFormValues
      setForm(draft)
      notifySuccess('Restored your saved draft.')
    } catch {
      localStorage.removeItem(DRAFT_KEY)
    }
  }, [])

  const create = useMutation({
    mutationFn: createCustomer,
    onSuccess: customer => {
      localStorage.removeItem(DRAFT_KEY)
      notifySuccess('Customer created')
      navigate(`/customers/${customer.id}`)
    },
    onError: error => notifyError(formErrorMessage(error, 'Customer could not be saved.')),
  })

  function updateField<K extends keyof CustomerFormValues>(field: K, value: CustomerFormValues[K]) {
    setForm(current => ({ ...current, [field]: value }))
    setErrors(current => ({ ...current, [field]: undefined }))
  }

  function validate(): FieldErrors {
    const parsed = customerSchema.safeParse(form)
    if (parsed.success) return {}
    const nextErrors: FieldErrors = {}
    parsed.error.issues.forEach(issue => {
      const field = issue.path[0] as keyof CustomerFormValues | undefined
      if (field && !nextErrors[field]) nextErrors[field] = issue.message
    })
    return nextErrors
  }

  function saveDraft() {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
    notifySuccess('Draft saved on this device.')
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const allErrors = validate()
    const currentFields = STEP_FIELDS[stepIndex]
    const blockingErrors = Object.fromEntries(
      Object.entries(allErrors).filter(([field]) => currentFields.includes(field as keyof CustomerFormValues)),
    )

    if (Object.keys(blockingErrors).length > 0) {
      setErrors(current => ({ ...current, ...blockingErrors }))
      return
    }

    if (stepIndex < STEP_FIELDS.length - 1) {
      setStepIndex(index => index + 1)
      return
    }

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors)
      const firstErrorField = Object.keys(allErrors)[0] as keyof CustomerFormValues
      const errorStepIndex = STEP_FIELDS.findIndex(fields => fields.includes(firstErrorField))
      if (errorStepIndex >= 0) setStepIndex(errorStepIndex)
      return
    }

    create.mutate(customerSchema.parse(form))
  }

  const createdByName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username || 'Staff'
  const today = new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date())
  const isLastStep = stepIndex === STEP_FIELDS.length - 1

  function jumpToSection(index: number) {
    if (index <= stepIndex) setStepIndex(index)
  }

  const sections: AccordionSection[] = [
    {
      key: 'contact',
      icon: <UserRound size={18} />,
      title: 'Contact Information',
      description: 'Basic customer identity.',
      required: true,
      content: <ContactInfoStep form={form} errors={errors} onChange={updateField} />,
    },
    {
      key: 'address',
      icon: <MapPin size={18} />,
      title: 'Address Details',
      description: 'Where we can reach this customer.',
      required: false,
      content: <AddressStep form={form} errors={errors} onChange={updateField} />,
    },
    {
      key: 'additional',
      icon: <ClipboardList size={18} />,
      title: 'Additional Information',
      description: 'Optional notes and preferences.',
      required: false,
      content: <AdditionalInfoStep form={form} errors={errors} onChange={updateField} />,
    },
  ]

  return (
    <div className="app-page">
      <div className="app-page-narrow">
        <FormPageHeader
          backTo="/customers"
          icon={<UserPlus size={18} />}
          title="New Customer"
          breadcrumb={[{ label: 'Customers', to: '/customers' }, { label: 'New Customer' }]}
          createdBy={createdByName}
          date={today}
        />

        <form ref={formRef} onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
          <Accordion sections={sections} activeIndex={stepIndex} onSectionClick={jumpToSection} />

          {isLastStep && (
            <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px 12px' }}>
                <h2 style={{ margin: 0, fontSize: 14.5, fontWeight: 700 }}>Review your details</h2>
                <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: 12, lineHeight: 1.35 }}>
                  Double-check everything before saving this customer.
                </p>
              </div>
              <div style={{ padding: '0 16px 16px' }}>
                <ReviewSummary
                  rows={[
                    { label: 'Full name', value: form.full_name },
                    { label: 'Phone', value: form.phone },
                    { label: 'Alternate phone', value: form.alternate_phone },
                    { label: 'Email', value: form.email },
                    { label: 'Address', value: form.address },
                    { label: 'Notes', value: form.notes },
                    { label: 'Status', value: form.is_active ? 'Active' : 'Inactive' },
                  ]}
                />
              </div>
            </section>
          )}

          {create.isError && <div className="error-banner">{formErrorMessage(create.error, 'Customer could not be saved.')}</div>}

          <ActionFooter
            note={stepIndex === 0 ? (
              <Link to="/customers" className="secondary-button">Cancel</Link>
            ) : (
              <button type="button" onClick={() => setStepIndex(index => index - 1)} className="secondary-button">
                <ArrowLeft size={16} />
                Previous
              </button>
            )}
          >
            {isLastStep && (
              <button type="button" onClick={saveDraft} className="secondary-button">
                Save Draft
              </button>
            )}
            <button type="submit" disabled={create.isPending} className="wizard-gold-button" style={{ opacity: create.isPending ? .7 : 1 }}>
              {isLastStep ? (
                <>
                  <Save size={16} />
                  {create.isPending ? 'Saving...' : 'Save Customer'}
                </>
              ) : (
                <>
                  Next
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </ActionFooter>
        </form>
      </div>
    </div>
  )
}
