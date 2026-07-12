/**
 * Fududeeye's real business WhatsApp number (digits only, country code, no "+" or
 * spaces) — 0906079110 with the leading 0 dropped and Somalia's 252 country code
 * prepended. Swap via VITE_WHATSAPP_PHONE without a code change if it ever changes.
 *
 * Must be a plain phone number, not a "wa.me/message/<code>" shortcut link — those
 * shortcut links do not support the `?text=` prefill parameter, so messages built with
 * one silently open to an empty chat instead of a pre-filled draft.
 */
const DEFAULT_WHATSAPP_PHONE = '252906079110'

export const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE ?? DEFAULT_WHATSAPP_PHONE

/** Builds a click-to-chat WhatsApp URL that opens with `message` pre-filled. */
export function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
}

interface ListingWhatsAppDetails {
  id: number
  title: string
  categoryName?: string
  condition?: string
  location?: string
  priceLabel: string
}

/**
 * Builds the pre-filled WhatsApp message for a listing detail page. WhatsApp can't
 * embed the item image inline, so the message links back to the listing page instead
 * so the recipient can open it and see the photos/full details.
 */
export function buildListingWhatsAppMessage(listing: ListingWhatsAppDetails) {
  const lines = [
    'Hello Fududeeye,',
    '',
    'I am interested in the following item listed on your marketplace:',
    '',
    `Item: ${listing.title}`,
    `Listing Reference: #${listing.id}`,
  ]
  if (listing.categoryName) lines.push(`Category: ${listing.categoryName}`)
  lines.push(`Price: ${listing.priceLabel}`)
  if (listing.condition) lines.push(`Condition: ${listing.condition}`)
  if (listing.location) lines.push(`Location: ${listing.location}`)
  lines.push(
    '',
    'Is this item still available? I would like to receive more information about it.',
    '',
    `View listing: ${window.location.origin}/listings/${listing.id}`,
  )
  return lines.join('\n')
}
