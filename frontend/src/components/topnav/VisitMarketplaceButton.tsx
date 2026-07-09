import { Globe } from 'lucide-react'

import { MARKETPLACE_URL } from '@/lib/env'

/** Opens the public marketplace site — the CRM-side counterpart to the marketplace's "Staff Login" button. */
export default function VisitMarketplaceButton() {
  return (
    <a
      href={MARKETPLACE_URL}
      target="_blank"
      rel="noreferrer noopener"
      className="gold-outline-button"
    >
      <Globe size={16} />
      Visit Marketplace
    </a>
  )
}
