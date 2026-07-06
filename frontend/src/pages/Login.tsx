import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import type { FormEvent } from 'react'
import type { Location } from 'react-router-dom'
import { AxiosError } from 'axios'
import { Eye, Lock, ShieldCheck, UserRound } from 'lucide-react'

import { useAuth } from '@/auth/AuthContext'
import Logo from '@/components/Logo'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
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
      await login(username, password)
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
      <section className="login-brand">
        <span className="login-brand-glow" aria-hidden="true" style={{ top: -90, right: -70, width: 260, height: 260, background: 'rgba(242,183,5,.18)' }} />
        <span className="login-brand-glow" aria-hidden="true" style={{ bottom: -110, left: -80, width: 240, height: 240, background: 'rgba(255,255,255,.06)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo size={44} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Fududeeye</div>
            <div style={{ marginTop: 3, fontSize: 10.5, fontWeight: 700, letterSpacing: '.16em', color: 'rgba(255,255,255,.62)' }}>BROKERAGE CRM</div>
          </div>
        </div>

        <div>
          <h1 className="serif" style={{ margin: 0, fontSize: 40, lineHeight: 1.1, fontWeight: 700 }}>
            You bring the item.<br />
            We find the buyer.<br />
            You get your price.
          </h1>
          <p style={{ maxWidth: 330, margin: '18px 0 0', color: 'rgba(255,255,255,.68)', fontSize: 14, lineHeight: 1.55 }}>
            A calm operating desk for consignment inventory, owner payouts, customer demands, and accountable sales.
          </p>
        </div>

        <div className="login-stat-grid">
          {[
            ['24h', 'audit trail'],
            ['USD', 'profit math'],
            ['3', 'roles'],
          ].map(([value, label]) => (
            <div key={label} style={{ borderTop: '1px solid rgba(255,255,255,.18)', paddingTop: 12 }}>
              <div className="serif" style={{ fontSize: 26, fontWeight: 700 }}>{value}</div>
              <div style={{ color: 'rgba(255,255,255,.62)', fontSize: 11.5 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="login-form-shell">
        <form onSubmit={submit} style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600 }}>Welcome back</div>
            <h2 className="serif" style={{ margin: '5px 0 0', fontSize: 32, lineHeight: 1.1, fontWeight: 700 }}>Sign in</h2>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: 13.5 }}>Use your staff account to continue.</p>
          </div>

          <label className="field-label" style={{ marginBottom: 15 }}>
            <span className="field-title">Username</span>
            <span className="login-input-wrap">
              <UserRound size={17} className="login-icon-left" />
              <input className="control" value={username} onChange={event => setUsername(event.target.value)} autoComplete="username" />
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

          <label className="checkbox-row" style={{ marginTop: 16 }}>
            <input type="checkbox" />
            Keep me signed in
          </label>

          {error && (
            <div className="error-banner" style={{ marginTop: 16, fontSize: 13 }}>
              {error}
            </div>
          )}

          <button disabled={isSubmitting} className="primary-button" style={{ width: '100%', marginTop: 20, opacity: isSubmitting ? 0.72 : 1 }}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 18, border: '1px solid var(--border)', borderRadius: 999, background: '#fff', padding: '9px 12px', color: 'var(--muted)', fontSize: 12.5 }}>
            <ShieldCheck size={16} color="var(--primary)" />
            Every staff action is captured in the audit log.
          </div>
        </form>
      </section>
    </main>
  )
}
