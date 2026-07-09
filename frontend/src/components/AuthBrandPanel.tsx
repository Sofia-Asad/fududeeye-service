import { Sparkles } from 'lucide-react'

import Logo from '@/components/Logo'

/** Left-hand brand panel shared by every auth screen (login, forgot/reset password). */
export default function AuthBrandPanel({
  eyebrow = 'SECURE STAFF SIGN-IN',
}: {
  eyebrow?: string
}) {
  return (
    <section className="login-brand">
      <span className="login-brand-glow" aria-hidden="true" style={{ top: -90, right: -70, width: 260, height: 260, background: 'rgba(242,183,5,.18)' }} />
      <span className="login-brand-glow" aria-hidden="true" style={{ bottom: -110, left: -80, width: 240, height: 240, background: 'rgba(255,255,255,.06)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Logo size={36} />
        <div>
          <div style={{ fontSize: 15.5, fontWeight: 700 }}>Fududeeye</div>
          <div style={{ marginTop: 2, fontSize: 9.5, fontWeight: 700, letterSpacing: '.16em', color: 'rgba(255,255,255,.62)' }}>BROKERAGE CRM</div>
        </div>
      </div>

      <div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 11px', borderRadius: 999, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', color: 'var(--accent)', fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em' }}>
          <Sparkles size={12} />
          {eyebrow}
        </span>
        <h1 className="serif" style={{ margin: '14px 0 0', fontSize: 26, lineHeight: 1.2, fontWeight: 700 }}>
          You bring the item.<br />
          We find the buyer.<br />
          You get <span style={{ color: 'var(--accent)' }}>your price</span>.
        </h1>
        <p style={{ maxWidth: 300, margin: '12px 0 0', color: 'rgba(255,255,255,.68)', fontSize: 12.5, lineHeight: 1.5 }}>
          A calm operating desk for consignment inventory, owner payouts, customer demands, and accountable sales.
        </p>
      </div>

      <div className="login-stat-grid">
        {[
          ['24h', 'audit trail'],
          ['USD', 'profit math'],
          ['3', 'roles'],
        ].map(([value, label]) => (
          <div key={label} style={{ borderTop: '2px solid var(--accent)', paddingTop: 10 }}>
            <div className="serif" style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{value}</div>
            <div style={{ color: 'rgba(255,255,255,.62)', fontSize: 10.5 }}>{label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
