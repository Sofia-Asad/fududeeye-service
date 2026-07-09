export const SITE_NAME = 'Fududeeye'
export const SITE_TAGLINE = 'The trusted brokerage marketplace for quality second-hand goods.'

export interface NavLink {
  to: string
  label: string
}

export const PRIMARY_NAV_LINKS: NavLink[] = [
  { to: '/', label: 'Home' },
  { to: '/listings', label: 'Browse Listings' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
]

export const FOOTER_QUICK_LINKS: NavLink[] = [
  { to: '/listings', label: 'Browse Listings' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About Us' },
]

export const FOOTER_SUPPORT_LINKS: NavLink[] = [
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact Us' },
]

export const CONTACT_INFO = {
  companyName: 'Fududeeye Brokerage & Marketplace',
  supportEmail: 'support@fududeeye.com',
  generalEmail: 'hello@fududeeye.com',
  phones: ['+252 61 800 000', '+252 90 800 000'],
  addressLines: ['Garsoor District', 'Galkayo', 'Mudug', 'Somalia'],
  workingHours: [
    { days: 'Saturday – Thursday', hours: '8:00 AM – 6:00 PM' },
    { days: 'Friday', hours: 'Closed' },
  ],
  averageResponse: 'Within 30 Minutes',
}

/**
 * Internal CRM (frontend/), served under /crm/ at this same origin — proxied to its
 * own dev server locally (see vite.config.ts), and behind one reverse proxy in
 * production. Staff are sent here after signing in on the public site.
 */
export const CRM_URL = import.meta.env.VITE_CRM_URL ?? '/crm/'

/** Where the "Staff Login" button sends visitors — the CRM has the only login page in the system. */
export const CRM_LOGIN_URL = `${CRM_URL}login`
