import { AxiosError } from 'axios'

export function errorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const data = error.response?.data as { detail?: string } | undefined
    if (data?.detail) return data.detail
    if (status === 403) return 'You do not have permission to do that.'
    if (status === 401) return 'Please sign in again.'
    if (status === 404) return 'That record could not be found.'
    return status ? `Request failed (${status}).` : 'Request failed.'
  }
  return 'Request failed.'
}

/** Formats DRF field-level validation errors (e.g. `{ field: ["message"] }`) into one banner string. */
export function formErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof AxiosError)) return fallback
  const data = error.response?.data
  if (data && typeof data === 'object') {
    return Object.entries(data)
      .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : String(messages)}`)
      .join(' ')
  }
  return error.response?.status ? `${fallback} (${error.response.status}).` : fallback
}
