import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'

import AuthCard from '@/components/auth/AuthCard'
import AuthHeader from '@/components/auth/AuthHeader'
import FormError from '@/components/auth/FormError'
import PasswordInput from '@/components/auth/PasswordInput'
import { PasswordRequirementsList } from '@/components/auth/PasswordStrength'
import Button from '@/components/ui/Button'
import { resetPassword } from '@/services/auth.service'

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine(value => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  })

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const password = watch('password')

  async function onSubmit(values: ResetPasswordForm) {
    setFormError(null)
    if (!token) {
      setFormError('This reset link is invalid or has expired.')
      return
    }
    try {
      await resetPassword({ token, password: values.password })
      navigate('/reset-password/success', { replace: true })
    } catch {
      setFormError('Could not reset your password. Please try again.')
    }
  }

  return (
    <AuthCard>
      <AuthHeader align="center" title="Reset Your Password" description="Enter your new password below." />

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-5" noValidate>
        <PasswordInput
          label="New Password"
          autoComplete="new-password"
          placeholder="Enter new password"
          error={errors.password?.message}
          {...register('password')}
        />
        <PasswordInput
          label="Confirm New Password"
          autoComplete="new-password"
          placeholder="Confirm new password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <div className="rounded-md bg-primary-soft/60 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Password must contain</p>
          <PasswordRequirementsList password={password} />
        </div>

        <FormError message={formError} />

        <Button variant="secondary" type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Resetting…' : 'Reset Password'}
        </Button>
      </form>
    </AuthCard>
  )
}
