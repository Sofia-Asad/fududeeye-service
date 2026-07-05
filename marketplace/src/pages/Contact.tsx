import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import Button, { buttonVariants } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import PageTitle from '@/components/ui/PageTitle'
import Textarea from '@/components/ui/Textarea'
import { CONTACT_INFO } from '@/constants/nav'
import { useCreateInquiry } from '@/features/inquiries/useCreateInquiry'
import Container from '@/layout/Container'
import Section from '@/layout/Section'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'

const contactSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name.'),
  phone: z.string().trim().min(6, 'Enter a valid phone number.'),
  email: z.string().trim().email('Enter a valid email.').optional().or(z.literal('')),
  message: z.string().trim().min(5, 'Tell us how we can help.'),
})

type ContactForm = z.infer<typeof contactSchema>

const CONTACT_WHATSAPP_MESSAGE = "Hi Fududeeye, I'd like to get in touch."

export default function Contact() {
  const { mutateAsync, isPending, isSuccess } = useCreateInquiry()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { fullName: '', phone: '', email: '', message: '' },
  })

  async function onSubmit(values: ContactForm) {
    await mutateAsync({
      kind: 'GENERAL',
      fullName: values.fullName,
      phone: values.phone,
      email: values.email || undefined,
      message: values.message,
    })
  }

  return (
    <Container className="py-10">
      <PageTitle
        eyebrow="Get in touch"
        title="Contact us"
        subtitle="Questions about buying, selling, or anything else — send us a message and our team will get back to you."
      />

      <Section className="py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          <div className="grid gap-4">
            <Card>
              <CardContent className="grid gap-4">
                <div className="flex items-start gap-3">
                  <Mail size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-ink">Email</p>
                    <a href={`mailto:${CONTACT_INFO.email}`} className="text-sm text-ink-muted hover:text-primary">
                      {CONTACT_INFO.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-ink">Phone</p>
                    <a href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`} className="text-sm text-ink-muted hover:text-primary">
                      {CONTACT_INFO.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-ink">Address</p>
                    <p className="text-sm text-ink-muted">{CONTACT_INFO.address}</p>
                  </div>
                </div>
                <a
                  href={buildWhatsAppUrl(CONTACT_WHATSAPP_MESSAGE)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={cn(buttonVariants({ size: 'md' }), 'w-full')}
                >
                  <MessageCircle size={16} />
                  Chat on WhatsApp
                </a>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent>
              {isSuccess ? (
                <div className="flex items-start gap-2.5 rounded-md bg-success-soft px-4 py-3 text-sm text-success">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <p>Thanks for reaching out! Our team will get back to you shortly.</p>
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
                    label="Email (optional)"
                    type="email"
                    placeholder="you@example.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                  <Textarea
                    label="Message"
                    placeholder="How can we help?"
                    rows={5}
                    error={errors.message?.message}
                    {...register('message')}
                  />
                  <Button type="submit" disabled={isPending} className="w-full sm:w-auto sm:justify-self-start">
                    {isPending ? 'Sending…' : 'Send Message'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </Section>
    </Container>
  )
}
