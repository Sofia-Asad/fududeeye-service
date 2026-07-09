/** Builds a click-to-chat WhatsApp URL to a customer's number, with `message` pre-filled. */
export function buildWhatsAppUrl(phone: string, message: string) {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
