/**
 * Placeholder link — a personal WhatsApp Business short link used for testing.
 * Swap via VITE_WHATSAPP_LINK once Fududeeye's real business number/link is ready.
 */
const DEFAULT_WHATSAPP_LINK = 'https://wa.me/message/OOVSEOXZCMD7G1'

export const WHATSAPP_LINK = import.meta.env.VITE_WHATSAPP_LINK ?? DEFAULT_WHATSAPP_LINK

/** Builds a click-to-chat WhatsApp URL that opens with `message` pre-filled. */
export function buildWhatsAppUrl(message: string) {
  const separator = WHATSAPP_LINK.includes('?') ? '&' : '?'
  return `${WHATSAPP_LINK}${separator}text=${encodeURIComponent(message)}`
}
