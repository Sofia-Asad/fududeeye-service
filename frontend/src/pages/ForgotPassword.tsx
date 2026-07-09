import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, MailCheck } from 'lucide-react'

import { requestPasswordReset } from '@/api/passwordReset'
import AuthBrandPanel from '@/components/AuthBrandPanel'
import { errorMessage } from '@/lib/errors'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await requestPasswordReset(email)
      setSent(true)
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-shell">
      <AuthBrandPanel eyebrow="ACCOUNT RECOVERY" />

      <section className="login-form-shell">
        {sent ? (
          <div className="card" style={{ width: '100%', maxWidth: 400, padding: '28px 32px', boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, margin: '0 auto', borderRadius: 999, display: 'grid', placeItems: 'center', background: 'var(--success-bg)', color: 'var(--success)' }}>
              <MailCheck size={26} />
            </div>
            <h2 className="serif" style={{ margin: '18px 0 0', fontSize: 26, fontWeight: 700 }}>Check your inbox</h2>
            <p style={{ margin: '12px 0 0', color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6 }}>
              If an account exists with this email, a password reset link has been sent. The link expires in 1 hour.
            </p>
            <Link to="/login" className="primary-button" style={{ display: 'inline-flex', width: '100%', justifyContent: 'center', marginTop: 24 }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="card" style={{ width: '100%', maxWidth: 400, padding: '28px 32px', boxShadow: 'var(--shadow-lg)' }}>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 12.5, fontWeight: 600, marginBottom: 14 }}>
              <ArrowLeft size={14} />
              Back to sign in
            </Link>

            <div style={{ marginBottom: 18 }}>
              <div style={{ color: 'var(--accent-dark)', fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>Forgot password</div>
              <h2 className="serif" style={{ margin: '6px 0 0', fontSize: 24, lineHeight: 1.15, fontWeight: 700 }}>Reset your password</h2>
              <span style={{ display: 'block', width: 36, height: 3, marginTop: 10, borderRadius: 999, background: 'var(--accent)' }} />
              <p style={{ margin: '12px 0 0', color: 'var(--muted)', fontSize: 13 }}>
                Enter the email on your staff account and we'll send you a reset link.
              </p>
            </div>

            <label className="field-label">
              <span className="field-title">Email Address</span>
              <span className="login-input-wrap">
                <Mail size={17} className="login-icon-left" />
                <input
                  className="control"
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </span>
            </label>

            {error && (
              <div className="error-banner" style={{ marginTop: 16, fontSize: 13 }}>
                {error}
              </div>
            )}

            <button disabled={isSubmitting} className="primary-button" style={{ width: '100%', marginTop: 20, opacity: isSubmitting ? 0.72 : 1 }}>
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </section>
    </main>
  )
}
