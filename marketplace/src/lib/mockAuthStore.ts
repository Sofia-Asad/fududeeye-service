const MOCK_LATENCY_MS = 500

function delay<T>(value: T, ms = MOCK_LATENCY_MS): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms))
}

/**
 * Forgot/reset password have no backend endpoint yet — these simulate the
 * flow (with artificial latency) so the UI can be exercised end-to-end.
 * Login/logout/session now go through the real Django backend instead
 * (see api/auth.ts).
 */
export async function mockForgotPassword(_email: string): Promise<void> {
  await delay(undefined)
}

export async function mockResetPassword(_token: string, _password: string): Promise<void> {
  await delay(undefined)
}
