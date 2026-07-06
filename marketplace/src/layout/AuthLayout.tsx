import { Link, Outlet } from 'react-router-dom'

import AuthIllustration from '@/components/auth/AuthIllustration'
import Logo from '@/components/Logo'
import { SITE_NAME, SITE_TAGLINE } from '@/constants/nav'

/** Split layout used by Login/Register: brand + illustration on the left, form on the right. */
export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary-deep p-10 text-white lg:flex">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full blur-3xl"
          style={{ background: 'rgba(242,183,5,.18)' }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-20 h-60 w-60 rounded-full blur-3xl"
          style={{ background: 'rgba(255,255,255,.06)' }}
        />
        <Link to="/" className="relative flex items-center gap-2.5">
          <Logo size={36} />
          <span className="font-serif text-lg font-semibold">{SITE_NAME}</span>
        </Link>

        <div>
          <h2 className="font-serif text-3xl font-semibold leading-tight">{SITE_TAGLINE}</h2>
          <p className="mt-4 max-w-sm text-white/60">
            Buy and sell with confidence on Somalia&rsquo;s trusted brokerage marketplace.
          </p>
          <div className="mt-10">
            <AuthIllustration />
          </div>
        </div>

        <p className="text-xs text-white/40">&copy; {new Date().getFullYear()} {SITE_NAME} Brokerage.</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Logo size={36} />
            <span className="font-serif text-lg font-semibold text-ink">{SITE_NAME}</span>
          </Link>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
