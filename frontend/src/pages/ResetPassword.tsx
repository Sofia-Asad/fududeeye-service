import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AxiosError } from 'axios'
import { CheckCircle2, Eye, Lock } from 'lucide-react'

import { confirmPasswordReset } from '@/api/passwordReset'
import AuthBrandPanel from '@/components/AuthBrandPanel'
import { errorMessage } from '@/lib/errors'
import PasswordRequirements, { checkPassword, isPasswordValid } from '@/components/PasswordRequirements'

function extractError(error: unknown) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as Record<string, string[]> | undefined
    const fieldError = data?.token?.[0] ?? data?.new_password?.[0] ?? data?.confirm_password?.[0]
    if (fieldError) return fieldError
  }
  return errorMessage(error)
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const uid = searchParams.get('uid') ?? ''
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const checks = useMemo(() => checkPassword(password, confirmPassword), [password, confirmPassword])
  const valid = isPasswordValid(checks)

  if (!uid || !token) {
    return (
      <main className="login-shell">
        <AuthBrandPanel eyebrow="ACCOUNT RECOVERY" />
        <section className="login-form-shell">
          <div className="card" style={{ width: '100%', maxWidth: 400, padding: 36, boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}>
            <h2 className="serif" style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Invalid reset link</h2>
            <p style={{ margin: '12px 0 0', color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6 }}>
              This password reset link is missing required information. Request a new one below.
            </p>
            <Link to="/forgot-password" className="primary-button" style={{ display: 'inline-flex', width: '100%', justifyContent: 'center', marginTop: 24 }}>
              Request a new link
            </Link>
          </div>
        </section>
      </main>
    )
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!valid) return
    setError('')
    setIsSubmitting(true)
    try {
      await confirmPasswordReset({ uid, token, new_password: password, confirm_password: confirmPassword })
      setSuccess(true)
    } catch (resetError) {
      setError(extractError(resetError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-shell">
      <AuthBrandPanel eyebrow="ACCOUNT RECOVERY" />

      <section className="login-form-shell">
        {success ? (
          <div className="card" style={{ width: '100%', maxWidth: 400, padding: 36, boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, margin: '0 auto', borderRadius: 999, display: 'grid', placeItems: 'center', background: 'var(--success-bg)', color: 'var(--success)' }}>
              <CheckCircle2 size={26} />
            </div>
            <h2 className="serif" style={{ margin: '18px 0 0', fontSize: 26, fontWeight: 700 }}>Password changed successfully</h2>
            <p style={{ margin: '12px 0 0', color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6 }}>
              You can now sign in with your new password.
            </p>
            <Link to="/login" className="primary-button" style={{ display: 'inline-flex', width: '100%', justifyContent: 'center', marginTop: 24 }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="card" style={{ width: '100%', maxWidth: 400, padding: '28px 32px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ marginBottom: 18 }}>
              <div style={{ color: 'var(--accent-dark)', fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>Create new password</div>
              <h2 className="serif" style={{ margin: '6px 0 0', fontSize: 24, lineHeight: 1.15, fontWeight: 700 }}>Choose a new password</h2>
              <span style={{ display: 'block', width: 36, height: 3, marginTop: 10, borderRadius: 999, background: 'var(--accent)' }} />
            </div>

            <label className="field-label" style={{ marginBottom: 12 }}>
              <span className="field-title">New Password</span>
              <span className="login-input-wrap">
                <Lock size={17} className="login-icon-left" />
                <input
                  className="control"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(current => !current)}
                  aria-label="Toggle password visibility"
                  className="login-icon-button"
                >
                  <Eye size={17} />
                </button>
              </span>
            </label>

            <label className="field-label">
              <span className="field-title">Confirm New Password</span>
              <span className="login-input-wrap">
                <Lock size={17} className="login-icon-left" />
                <input
                  className="control"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={event => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                />
              </span>
            </label>

            <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 10, background: 'var(--surface-2)' }}>
              <PasswordRequirements checks={checks} />
            </div>

            {error && (
              <div className="error-banner" style={{ marginTop: 12, fontSize: 13 }}>
                {error}
              </div>
            )}

            <button disabled={isSubmitting || !valid} className="primary-button" style={{ width: '100%', marginTop: 16, opacity: isSubmitting || !valid ? 0.6 : 1 }}>
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </section>
    </main>
  )
}
