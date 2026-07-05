import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import AuthHeader from '@/components/auth/AuthHeader'
import FormError from '@/components/auth/FormError'
import PasswordInput from '@/components/auth/PasswordInput'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { CRM_URL } from '@/constants/nav'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/lib/errors'
import { notifySuccess } from '@/lib/toast'

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email.'),
  password: z.string().min(1, 'Password is required.'),
  rememberMe: z.boolean(),
})

type LoginForm = z.infer<typeof loginSchema>

export default function Login() {
  const { login } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const [signedIn, setSignedIn] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  useEffect(() => {
    if (signedIn) {
      window.location.href = CRM_URL
    }
  }, [signedIn])

  async function onSubmit(values: LoginForm) {
    setFormError(null)
    try {
      await login(values)
      notifySuccess('Welcome back!')
      setSignedIn(true)
    } catch (error) {
      setFormError(getErrorMessage(error, 'Could not sign in. Please try again.'))
    }
  }

  return (
    <div>
      <AuthHeader title="Staff Sign In" description="Sign in to access the Fududeeye management console." />

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-5" noValidate>
        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordInput
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="flex items-center gap-2 font-medium text-ink">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="h-4 w-4 rounded border-border-strong text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/30"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        <FormError message={formError} />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>
    </div>
  )
}
