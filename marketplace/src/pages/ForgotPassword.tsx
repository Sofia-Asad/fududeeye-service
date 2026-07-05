import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import AuthCard from '@/components/auth/AuthCard'
import AuthHeader from '@/components/auth/AuthHeader'
import FormError from '@/components/auth/FormError'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { forgotPassword } from '@/services/auth.service'

const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email.'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({ resolver: zodResolver(forgotPasswordSchema) })

  async function onSubmit(values: ForgotPasswordForm) {
    setFormError(null)
    try {
      await forgotPassword(values)
      navigate('/forgot-password/sent', { state: { email: values.email }, replace: true })
    } catch {
      setFormError('Something went wrong. Please try again.')
    }
  }

  return (
    <AuthCard>
      <AuthHeader
        align="center"
        title="Reset Your Password"
        description="No worries! Enter your email address and we'll send you a link to reset your password."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-5" noValidate>
        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="Enter your email address"
          error={errors.email?.message}
          {...register('email')}
        />

        <FormError message={formError} />

        <Button variant="secondary" type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Sending link…' : 'Send Reset Link'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  )
}
