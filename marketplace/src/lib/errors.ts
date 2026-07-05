import { AxiosError } from 'axios'

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { detail?: string } | undefined
    if (data?.detail) return data.detail
  }
  return fallback
}
