import { z } from 'zod'

export const customerSchema = z.object({
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

export type CustomerFormValues = z.infer<typeof customerSchema>

export const emptyCustomerForm: CustomerFormValues = {
  full_name: '',
  phone: '',
  alternate_phone: '',
  email: '',
  address: '',
  notes: '',
  is_active: true,
}
