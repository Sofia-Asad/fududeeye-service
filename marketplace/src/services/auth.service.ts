import { getMeRequest, loginRequest, logoutRequest } from '@/api/auth'
import { mockForgotPassword, mockResetPassword } from '@/lib/mockAuthStore'
import type { ForgotPasswordPayload, LoginPayload, ResetPasswordPayload, User } from '@/types/auth'

/** Single seam the rest of the app talks to for auth. */

export async function login(payload: LoginPayload): Promise<User> {
  return loginRequest(payload)
}

export async function logout(): Promise<void> {
  await logoutRequest()
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    return await getMeRequest()
  } catch {
    return null
  }
}

/** No backend endpoint yet — simulates the flow so the UI works end-to-end. */
export async function forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
  await mockForgotPassword(payload.email)
}

/** No backend endpoint yet — simulates the flow so the UI works end-to-end. */
export async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  await mockResetPassword(payload.token, payload.password)
}
