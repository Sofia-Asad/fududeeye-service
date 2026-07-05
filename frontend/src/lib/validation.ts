import { useEffect, type RefObject } from 'react'
import type { z } from 'zod'

export function fieldErrors(error: z.ZodError) {
  const nextErrors: Record<string, string> = {}
  error.issues.forEach(issue => {
    const field = String(issue.path[0] ?? 'form')
    if (!nextErrors[field]) nextErrors[field] = issue.message
  })
  return nextErrors
}

/**
 * Focuses the first invalid field's control inside `containerRef` whenever `errors` changes.
 * Relies on a `data-field="<key>"` wrapper around each form control.
 */
export function useFocusFirstError(errors: Record<string, string | undefined>, containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const firstField = Object.keys(errors).find(key => errors[key])
    if (!firstField || !containerRef.current) return
    const target = containerRef.current.querySelector<HTMLElement>(
      `[data-field="${firstField}"] input, [data-field="${firstField}"] select, [data-field="${firstField}"] textarea`,
    )
    target?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors])
}
