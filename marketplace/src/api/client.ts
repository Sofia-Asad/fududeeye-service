import axios from 'axios'

/**
 * Shared axios instance for the marketplace site. Points at the same Django
 * backend used by the internal CRM.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1',
  withCredentials: true,
})

function getCookie(name: string) {
  const match = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.split('=')[1] ?? '') : ''
}

// Django's CSRF check only fires for requests carrying an authenticated session
// cookie (e.g. a staff member also signed into the CRM), but when it does, the
// header is required — mirrors frontend/src/api/client.ts in the CRM app.
api.interceptors.request.use(config => {
  const method = config.method?.toUpperCase()
  if (method && !['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
    config.headers.set('X-CSRFToken', getCookie('csrftoken'))
  }
  return config
})
