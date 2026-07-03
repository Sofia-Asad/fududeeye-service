import axios from 'axios'

function defaultApiBaseUrl() {
  if (typeof window === 'undefined') {
    return 'http://localhost:8000/api/v1'
  }
  return `${window.location.protocol}//${window.location.hostname}:8000/api/v1`
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? defaultApiBaseUrl(),
  withCredentials: true,
})

function getCookie(name: string) {
  const match = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.split('=')[1]) : ''
}

api.interceptors.request.use(config => {
  const method = config.method?.toUpperCase()
  if (method && !['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
    config.headers.set('X-CSRFToken', getCookie('csrftoken'))
  }
  return config
})
