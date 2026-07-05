import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import SectionHeading from '@/components/ui/SectionHeading'
import Textarea from '@/components/ui/Textarea'
import { useCreateInquiry } from '@/features/inquiries/useCreateInquiry'
import Container from '@/layout/Container'
import Section from '@/layout/Section'

const requestItemSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name.'),
  phone: z.string().trim().min(6, 'Enter a valid phone number.'),
  itemNeeded: z.string().trim().min(2, 'Tell us what you need.'),
  description: z.string().trim().max(1000, 'Keep it under 1000 characters.').optional(),
})

type RequestItemForm = z.infer<typeof requestItemSchema>

export default function RequestItemSection() {
  const { mutateAsync, isPending, isSuccess } = useCreateInquiry()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequestItemForm>({
    resolver: zodResolver(requestItemSchema),
    defaultValues: { fullName: '', phone: '', itemNeeded: '', description: '' },
  })

  async function onSubmit(values: RequestItemForm) {
    await mutateAsync({
      kind: 'ITEM_REQUEST',
      fullName: values.fullName,
      phone: values.phone,
      itemNeeded: values.itemNeeded,
      message: values.description,
    })
    reset()
  }

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Can't find it?"
          title="What Do You Need?"
          subtitle="Tell us what you're looking for and our team will reach out if we can source it for you."
        />

        <Card className="mx-auto mt-10 max-w-2xl">
          <CardContent>
            {isSuccess ? (
              <div className="flex items-start gap-2.5 rounded-md bg-success-soft px-4 py-3 text-sm text-success">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                <p>Thanks! We&rsquo;ve received your request and will be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
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
                </div>
                <Input
                  label="Item Needed"
                  placeholder="e.g. 55-inch Smart TV"
                  error={errors.itemNeeded?.message}
                  {...register('itemNeeded')}
                />
                <Textarea
                  label="Description (optional)"
                  placeholder="Any details that help us find the right match — budget, condition, brand…"
                  error={errors.description?.message}
                  {...register('description')}
                />
                <Button type="submit" disabled={isPending} className="w-full sm:w-auto sm:justify-self-start">
                  {isPending ? 'Sending…' : 'Submit Request'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </Container>
    </Section>
  )
}
