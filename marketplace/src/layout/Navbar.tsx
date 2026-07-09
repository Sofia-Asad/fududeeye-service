import { Menu, MessageCircle, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/Button'
import Logo from '@/components/Logo'
import { CRM_LOGIN_URL, PRIMARY_NAV_LINKS, SITE_NAME } from '@/constants/nav'
import { useDisclosure } from '@/hooks/useDisclosure'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import Container from '@/layout/Container'
import MobileMenu from '@/layout/MobileMenu'

const NAVBAR_WHATSAPP_MESSAGE = "Hi Fududeeye, I'd like to know more about your listings."

export default function Navbar() {
  const mobileMenu = useDisclosure()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-6">
        <NavLink to="/" className="flex shrink-0 items-center gap-2.5 text-ink">
          <Logo size={36} />
          <span>
            <span className="block font-serif text-lg font-semibold leading-tight">{SITE_NAME}</span>
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
              Marketplace
            </span>
          </span>
        </NavLink>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {PRIMARY_NAV_LINKS.map(link => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'relative rounded-md px-3.5 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-primary-soft hover:text-primary',
                      isActive && 'bg-primary-soft text-primary after:absolute after:bottom-0.5 after:left-1/2 after:h-0.5 after:w-4 after:-translate-x-1/2 after:rounded-full after:bg-gold after:content-[\'\']',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href={buildWhatsAppUrl(NAVBAR_WHATSAPP_MESSAGE)}
            target="_blank"
            rel="noreferrer noopener"
            className={buttonVariants({ variant: 'primary', size: 'sm' })}
          >
            <MessageCircle size={15} />
            Chat on WhatsApp
          </a>
          <a href={CRM_LOGIN_URL} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Staff Login
          </a>
        </div>

        <button
          type="button"
          onClick={mobileMenu.toggle}
          aria-expanded={mobileMenu.isOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenu.isOpen ? 'Close menu' : 'Open menu'}
          className="grid h-10 w-10 place-items-center rounded-md border border-border-strong text-ink lg:hidden"
        >
          {mobileMenu.isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </Container>

      <MobileMenu isOpen={mobileMenu.isOpen} onClose={mobileMenu.close} />
    </header>
  )
}
