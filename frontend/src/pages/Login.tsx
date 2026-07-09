import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import type { FormEvent } from 'react'
import type { Location } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Eye, Lock, Mail, ShieldCheck } from 'lucide-react'

import { useAuth } from '@/auth/AuthContext'
import AuthBrandPanel from '@/components/AuthBrandPanel'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const from = (location.state as { from?: Location })?.from?.pathname ?? '/'

  if (user) {
    return <Navigate to={from} replace />
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (loginError) {
      const detail = loginError instanceof AxiosError
        ? loginError.response?.data?.detail
        : undefined
      setError(typeof detail === 'string' ? detail : 'Could not log in.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-shell">
      <AuthBrandPanel />

      <section className="login-form-shell">
        <form onSubmit={submit} className="card" style={{ width: '100%', maxWidth: 400, padding: '28px 32px', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ color: 'var(--accent-dark)', fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>Welcome back</div>
            <h2 className="serif" style={{ margin: '6px 0 0', fontSize: 26, lineHeight: 1.15, fontWeight: 700 }}>Sign in</h2>
            <span style={{ display: 'block', width: 36, height: 3, marginTop: 10, borderRadius: 999, background: 'var(--accent)' }} />
            <p style={{ margin: '12px 0 0', color: 'var(--muted)', fontSize: 13 }}>Use your staff account to continue.</p>
          </div>

          <label className="field-label" style={{ marginBottom: 12 }}>
            <span className="field-title">Email</span>
            <span className="login-input-wrap">
              <Mail size={17} className="login-icon-left" />
              <input
                className="control"
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                autoComplete="email"
              />
            </span>
          </label>

          <label className="field-label">
            <span className="field-title">Password</span>
            <span className="login-input-wrap">
              <Lock size={17} className="login-icon-left" />
              <input
                className="control"
                value={password}
                onChange={event => setPassword(event.target.value)}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
            <label className="checkbox-row">
              <input type="checkbox" style={{ accentColor: 'var(--accent-dark)' }} />
              Keep me signed in
            </label>
            <Link to="/forgot-password" style={{ color: 'var(--primary-hover)', fontSize: 13, fontWeight: 600 }}>
              Forgot password?
            </Link>
          </div>

          {error && (
            <div className="error-banner" style={{ marginTop: 16, fontSize: 13 }}>
              {error}
            </div>
          )}

          <button disabled={isSubmitting} className="primary-button" style={{ width: '100%', marginTop: 20, opacity: isSubmitting ? 0.72 : 1 }}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 18, border: '1px solid var(--accent-weak)', borderRadius: 999, background: 'var(--accent-weak)', padding: '9px 12px', color: 'var(--accent-dark)', fontSize: 12.5, fontWeight: 600 }}>
            <ShieldCheck size={16} color="var(--accent-dark)" />
            Every staff action is captured in the audit log.
          </div>
        </form>
      </section>
    </main>
  )
}
