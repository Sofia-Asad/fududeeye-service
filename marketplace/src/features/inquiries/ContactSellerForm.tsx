import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { useCreateInquiry } from '@/features/inquiries/useCreateInquiry'
import { getErrorMessage } from '@/lib/errors'
import { notifyError } from '@/lib/toast'

const contactSellerSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name.'),
  phone: z.string().trim().min(6, 'Enter a valid phone number.'),
  message: z.string().trim().min(1, 'Enter a message.').max(1000, 'Keep it under 1000 characters.'),
})

type ContactSellerForm = z.infer<typeof contactSellerSchema>

export default function ContactSellerForm({ itemId }: { itemId: string }) {
  const { mutateAsync, isPending, isSuccess } = useCreateInquiry()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactSellerForm>({
    resolver: zodResolver(contactSellerSchema),
    defaultValues: { fullName: '', phone: '', message: '' },
  })

  async function onSubmit(values: ContactSellerForm) {
    try {
      await mutateAsync({
        kind: 'ITEM_INTEREST',
        itemId,
        fullName: values.fullName,
        phone: values.phone,
        message: values.message,
      })
    } catch (error) {
      notifyError(getErrorMessage(error, 'Something went wrong sending your message. Please try again in a moment.'))
    }
  }

  if (isSuccess) {
    return (
      <div className="flex items-start gap-2.5 rounded-md bg-success-soft px-4 py-3 text-sm text-success">
        <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p>
          <strong className="block">Thank you!</strong>
          Your inquiry has been sent successfully. Our team will contact you shortly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3" noValidate>
      <Input
        label="Full Name"
        placeholder="Your name"
        error={errors.fullName?.message}
        {...register('fullName')}
      />
      <Input
        label="Phone Number"
        type="tel"
        placeholder="e.g. +252 61 800 0000"
        error={errors.phone?.message}
        {...register('phone')}
      />
      <Textarea
        label="Message"
        placeholder="Is this still available?"
        rows={3}
        error={errors.message?.message}
        {...register('message')}
      />
      <Button type="submit" variant="outline" disabled={isPending} className="w-full">
        {isPending ? 'Sending…' : 'Send Message'}
      </Button>
    </form>
  )
}
