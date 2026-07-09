import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Send } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import SectionHeading from '@/components/ui/SectionHeading'
import Textarea from '@/components/ui/Textarea'
import ContactCta from '@/components/contact/ContactCta'
import ContactFaqPreview from '@/components/contact/ContactFaqPreview'
import ContactHero from '@/components/contact/ContactHero'
import ContactInfoCards from '@/components/contact/ContactInfoCards'
import ContactMap from '@/components/contact/ContactMap'
import WhyContactSection from '@/components/contact/WhyContactSection'
import { useCreateInquiry } from '@/features/inquiries/useCreateInquiry'
import Container from '@/layout/Container'
import Section from '@/layout/Section'
import { cn } from '@/lib/utils'

// Same backend contract as before (kind: GENERAL, fullName/phone/email/message) — "Subject"
// has no field on the Inquiry model, so it's folded into the message text client-side
// rather than adding a new field to the API.
const contactSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name.'),
  phone: z.string().trim().min(6, 'Enter a valid phone number.'),
  email: z.string().trim().email('Enter a valid email.').optional().or(z.literal('')),
  subject: z.string().trim().min(2, 'Enter a subject.'),
  message: z.string().trim().min(5, 'Tell us how we can help.'),
})

type ContactForm = z.infer<typeof contactSchema>

const inputClassName = 'h-[52px] rounded-lg border-border-strong text-[15px] focus-visible:outline-gold/40 focus-visible:border-gold'
const textareaClassName = 'rounded-lg border-border-strong text-[15px] focus-visible:outline-gold/40 focus-visible:border-gold'

export default function Contact() {
  const { mutateAsync, isPending, isSuccess } = useCreateInquiry()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { fullName: '', phone: '', email: '', subject: '', message: '' },
  })

  async function onSubmit(values: ContactForm) {
    await mutateAsync({
      kind: 'GENERAL',
      fullName: values.fullName,
      phone: values.phone,
      email: values.email || undefined,
      message: `Subject: ${values.subject}\n\n${values.message}`,
    })
  }

  return (
    <>
      <ContactHero />

      <Container className="py-10">
        <Section id="contact-form" className="scroll-mt-24 py-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-start">
            <ContactInfoCards />

            <Card className="overflow-hidden rounded-xl border-white/40 bg-white/70 shadow-lg backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <SectionHeading
                  align="left"
                  title="Send us a Message"
                  subtitle="Complete the form below and our team will respond as quickly as possible."
                  className="gap-2"
                />

                {isSuccess ? (
                  <div className="mt-6 flex items-start gap-3 rounded-lg bg-success-soft px-5 py-4 text-success animate-fade-in">
                    <CheckCircle2 size={22} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <p className="text-sm">
                      <strong className="block text-base">Thank you!</strong>
                      Your message has been sent successfully. Our team will get back to you shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-5" noValidate>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Input
                        label="Full Name"
                        placeholder="Your name"
                        error={errors.fullName?.message}
                        className={inputClassName}
                        {...register('fullName')}
                      />
                      <Input
                        label="Phone Number"
                        type="tel"
                        placeholder="e.g. +252 61 800 0000"
                        error={errors.phone?.message}
                        className={inputClassName}
                        {...register('phone')}
                      />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Input
                        label="Email Address (optional)"
                        type="email"
                        placeholder="you@example.com"
                        error={errors.email?.message}
                        className={inputClassName}
                        {...register('email')}
                      />
                      <Input
                        label="Subject"
                        placeholder="What's this about?"
                        error={errors.subject?.message}
                        className={inputClassName}
                        {...register('subject')}
                      />
                    </div>
                    <Textarea
                      label="Message"
                      placeholder="How can we help?"
                      rows={7}
                      error={errors.message?.message}
                      className={textareaClassName}
                      {...register('message')}
                    />
                    <Button
                      type="submit"
                      disabled={isPending}
                      className={cn(
                        'w-full bg-gradient-to-b from-gold to-gold-hover text-ink shadow-gold hover:-translate-y-px sm:w-auto sm:justify-self-start',
                      )}
                    >
                      <Send size={16} />
                      {isPending ? 'Sending…' : 'Send Message'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </Section>
      </Container>

      <ContactMap />
      <WhyContactSection />
      <ContactFaqPreview />
      <ContactCta />
    </>
  )
}
