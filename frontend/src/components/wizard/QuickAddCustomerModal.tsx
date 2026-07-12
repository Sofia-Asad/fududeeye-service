import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createCustomer, listCustomers } from '@/api/customers'
import { Field } from '@/components/FormSection'
import Modal from '@/components/Modal'
import { formErrorMessage } from '@/lib/errors'
import { notifyInfo, notifySuccess } from '@/lib/toast'
import type { Customer } from '@/types/customer'

/** Minimal Full name + Phone customer creation, reused by any picker with `allowQuickAdd`. Checks for an existing customer with the same phone first so we never create a duplicate. */
export default function QuickAddCustomerModal({
  open,
  initialQuery = '',
  onClose,
  onCreated,
}: {
  open: boolean
  initialQuery?: string
  onClose: () => void
  onCreated: (customer: Customer) => void
}) {
  const queryClient = useQueryClient()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ full_name?: string; phone?: string }>({})

  useEffect(() => {
    if (!open) return
    setFieldErrors({})
    const looksLikePhone = /\d{3,}/.test(initialQuery)
    setPhone(looksLikePhone ? initialQuery : '')
    setFullName(looksLikePhone ? '' : initialQuery)
  }, [open, initialQuery])

  const submit = useMutation({
    mutationFn: async () => {
      const trimmedName = fullName.trim()
      const trimmedPhone = phone.trim()
      const existing = await listCustomers({ search: trimmedPhone })
      const match = existing.results.find(customer => customer.phone === trimmedPhone)
      if (match) return { customer: match, created: false }
      const created = await createCustomer({
        full_name: trimmedName,
        phone: trimmedPhone,
        alternate_phone: '',
        email: '',
        address: '',
        notes: '',
        is_active: true,
      })
      return { customer: created, created: true }
    },
    onSuccess: result => {
      void queryClient.invalidateQueries({ queryKey: ['customers'] })
      if (!result.created) {
        notifyInfo('A customer with this phone number already exists — selected the existing record.')
      } else {
        notifySuccess('Customer created')
      }
      onCreated(result.customer)
      onClose()
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: typeof fieldErrors = {}
    if (!fullName.trim()) nextErrors.full_name = 'Full name is required.'
    if (!phone.trim()) nextErrors.phone = 'Phone number is required.'
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    submit.mutate()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Quick Add Customer"
      description="Create a minimal record now — the rest of the profile can be completed later from the Customers module."
      width={420}
      onSubmit={handleSubmit}
      footer={(
        <>
          <button type="button" onClick={onClose} className="secondary-button">Cancel</button>
          <button type="submit" disabled={submit.isPending} className="primary-button" style={{ opacity: submit.isPending ? .7 : 1 }}>
            {submit.isPending ? 'Saving...' : 'Add customer'}
          </button>
        </>
      )}
    >
      <Field label="Full name" required error={fieldErrors.full_name} name="full_name">
        <input
          className="control"
          value={fullName}
          onChange={event => setFullName(event.target.value)}
          style={{ width: '100%', padding: '0 12px' }}
          autoFocus
        />
      </Field>
      <Field label="Phone number" required error={fieldErrors.phone} name="phone">
        <input
          className="control"
          value={phone}
          onChange={event => setPhone(event.target.value)}
          style={{ width: '100%', padding: '0 12px' }}
        />
      </Field>
      {submit.isError && <div className="error-banner">{formErrorMessage(submit.error, 'Customer could not be saved.')}</div>}
    </Modal>
  )
}
