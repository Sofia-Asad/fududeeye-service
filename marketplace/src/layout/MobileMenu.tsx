import { MessageCircle } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/Button'
import { PRIMARY_NAV_LINKS } from '@/constants/nav'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'

const MOBILE_MENU_WHATSAPP_MESSAGE = "Hi Fududeeye, I'd like to know more about your listings."

export default function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <div
      id="mobile-menu"
      className={cn(
        'grid overflow-hidden border-b border-border bg-surface transition-[grid-template-rows] duration-200 lg:hidden',
        isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
      )}
    >
      <nav aria-label="Mobile" className="min-h-0">
        <ul className="flex flex-col gap-1 p-4">
          {PRIMARY_NAV_LINKS.map(link => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'block rounded-md px-3 py-2.5 text-sm font-medium text-ink hover:bg-primary-soft',
                    isActive && 'bg-primary-soft text-primary',
                  )
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="grid gap-3 border-t border-border p-4">
          <a
            href={buildWhatsAppUrl(MOBILE_MENU_WHATSAPP_MESSAGE)}
            target="_blank"
            rel="noreferrer noopener"
            onClick={onClose}
            className={cn(buttonVariants({ variant: 'primary' }), 'w-full')}
          >
            <MessageCircle size={16} />
            Chat on WhatsApp
          </a>
          <NavLink to="/login" onClick={onClose} className={cn(buttonVariants({ variant: 'ghost' }), 'w-full')}>
            Staff Login
          </NavLink>
        </div>
      </nav>
    </div>
  )
}
