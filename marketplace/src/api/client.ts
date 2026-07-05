import axios from 'axios'

/**
 * Shared axios instance for the marketplace site. Points at the same Django
 * backend used by the internal CRM. No endpoints are wired up yet — this is
 * foundation only.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1',
  withCredentials: true,
})
