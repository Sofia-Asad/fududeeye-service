import { api } from '@/api/client'

export async function requestPasswordReset(email: string) {
  const response = await api.post<{ detail: string }>('/auth/password-reset/', { email })
  return response.data
}

export interface ConfirmPasswordResetPayload {
  uid: string
  token: string
  new_password: string
  confirm_password: string
}

export async function confirmPasswordReset(payload: ConfirmPasswordResetPayload) {
  const response = await api.post<{ detail: string }>('/auth/password-reset-confirm/', payload)
  return response.data
}
