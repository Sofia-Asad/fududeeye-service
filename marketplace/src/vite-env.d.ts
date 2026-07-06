/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  /** Origin of the internal CRM (frontend/) app. Staff land here after signing in. */
  readonly VITE_CRM_URL?: string
  /** Fududeeye's WhatsApp number (digits only, country code, no "+" or spaces). Swap for the real business number when ready. */
  readonly VITE_WHATSAPP_PHONE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
