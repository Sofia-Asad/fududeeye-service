/**
 * Public marketplace site the "Visit Marketplace" button opens — set
 * VITE_MARKETPLACE_URL in .env for staging/production; falls back to the
 * local marketplace dev server so this works out of the box in development.
 */
export const MARKETPLACE_URL = import.meta.env.VITE_MARKETPLACE_URL ?? 'http://localhost:5174'
