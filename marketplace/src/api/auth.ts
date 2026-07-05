import { api } from '@/api/client'
import type { LoginPayload, User } from '@/types/auth'

/**
 * Real endpoint calls against the Django backend. Session-cookie based (no
 * bearer token) — `withCredentials: true` on the shared axios instance sends
 * the session cookie automatically on every subsequent request.
 *
 * Forgot/reset password have no backend endpoint yet — those two flows stay
 * on the mock store (see `services/auth.service.ts`).
 */

export async function loginRequest(payload: LoginPayload) {
  // Backend identifies staff by `username`, but accepts an email address too
  // (see apps/accounts/views.py login_view) — matches the "Email Address"
  // field the login form actually shows.
  const response = await api.post<User>('/auth/login/', {
    username: payload.email,
    password: payload.password,
  })
  return response.data
}

export async function logoutRequest() {
  await api.post('/auth/logout/')
}

export async function getMeRequest() {
  const response = await api.get<User>('/me/')
  return response.data
}
