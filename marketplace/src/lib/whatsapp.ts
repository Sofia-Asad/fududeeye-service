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
