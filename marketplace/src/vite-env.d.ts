/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  /** Origin of the internal CRM (frontend/) app. Staff land here after signing in. */
  readonly VITE_CRM_URL?: string
  /** Fududeeye's WhatsApp click-to-chat link. Swap for the real business number/link when ready. */
  readonly VITE_WHATSAPP_LINK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
