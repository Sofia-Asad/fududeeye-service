import { Store } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

import AuthIllustration from '@/components/auth/AuthIllustration'
import { SITE_NAME, SITE_TAGLINE } from '@/constants/nav'

/** Split layout used by Login/Register: brand + illustration on the left, form on the right. */
export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-primary-deep p-10 text-white lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-white/10">
            <Store size={18} />
          </span>
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
            <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-white">
              <Store size={18} />
            </span>
            <span className="font-serif text-lg font-semibold text-ink">{SITE_NAME}</span>
          </Link>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
