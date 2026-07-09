import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

import Logo from '@/components/Logo'
import { FacebookIcon, TikTokIcon } from '@/components/ui/SocialIcons'
import {
  CONTACT_INFO,
  CRM_LOGIN_URL,
  FOOTER_QUICK_LINKS,
  FOOTER_SUPPORT_LINKS,
  SITE_NAME,
  SITE_TAGLINE,
  SOCIAL_LINKS,
} from '@/constants/nav'
import { useCategoriesQuery } from '@/features/listings/queries'
import Container from '@/layout/Container'

const SOCIAL_ICONS: Record<string, typeof FacebookIcon> = {
  Facebook: FacebookIcon,
  TikTok: TikTokIcon,
}

export default function Footer() {
  const year = new Date().getFullYear()
  const categories = useCategoriesQuery()
  const footerCategories = (categories.data ?? []).filter(category => category.parent === null).slice(0, 6)

  return (
    <footer className="bg-primary-deep text-white/80">
      <Container className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2.5 text-white">
            <Logo size={36} />
            <span className="font-serif text-lg font-semibold">{SITE_NAME}</span>
          </Link>
          <p className="mt-3 text-sm font-semibold text-white/80">{CONTACT_INFO.companyName}</p>
          <p className="mt-2 max-w-xs text-sm text-white/60">{SITE_TAGLINE}</p>
          <ul className="mt-6 flex gap-3">
            {SOCIAL_LINKS.map(social => {
              const Icon = SOCIAL_ICONS[social.label]
              if (!Icon) return null
              return (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={social.label}
                    className="grid h-9 w-9 place-items-center rounded-md bg-white/10 text-white/70 transition-colors hover:bg-gold hover:text-ink"
                  >
                    <Icon />
                  </a>
                </li>
              )
            })}
          </ul>
        </div>

        <nav aria-label="Quick links">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50">Quick Links</h3>
          <ul className="mt-4 grid gap-2.5">
            {FOOTER_QUICK_LINKS.map(link => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm text-white/70 hover:text-gold">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Categories">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50">Categories</h3>
          <ul className="mt-4 grid gap-2.5">
            {footerCategories.map(category => (
              <li key={category.id}>
                <Link to={`/listings?category=${category.id}`} className="text-sm text-white/70 hover:text-gold">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Support">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50">Support</h3>
          <ul className="mt-4 grid gap-2.5">
            {FOOTER_SUPPORT_LINKS.map(link => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm text-white/70 hover:text-gold">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={CRM_LOGIN_URL} className="text-sm text-white/70 hover:text-gold">
                Staff Login
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50">Contact</h3>
          <ul className="mt-4 grid gap-3 text-sm text-white/70">
            <li className="flex items-start gap-2.5">
              <Mail size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-gold" />
              <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-gold">{CONTACT_INFO.email}</a>
            </li>
            <li className="flex items-start gap-2.5">
              <Phone size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-gold" />
              <span className="grid gap-0.5">
                {CONTACT_INFO.phones.map(phone => (
                  <a key={phone} href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-gold">{phone}</a>
                ))}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-gold" />
              <span>{CONTACT_INFO.addressLines.join(', ')}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-gold" />
              <span className="grid gap-0.5">
                {CONTACT_INFO.workingHours.map(row => (
                  <span key={row.days}>{row.days}: {row.hours}</span>
                ))}
              </span>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10 py-6">
        <Container className="flex flex-col items-center justify-between gap-3 text-xs text-white/50 sm:flex-row">
          <p>&copy; {year} {SITE_NAME} Brokerage. All rights reserved.</p>
          <ul className="flex items-center gap-5">
            <li>
              <Link to="/privacy" className="hover:text-gold">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-gold">
                Terms
              </Link>
            </li>
          </ul>
        </Container>
      </div>
    </footer>
  )
}
