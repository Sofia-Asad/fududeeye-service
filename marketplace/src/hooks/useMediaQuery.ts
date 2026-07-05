import { useSyncExternalStore } from 'react'

function subscribe(query: string, onChange: () => void) {
  const mediaQueryList = window.matchMedia(query)
  mediaQueryList.addEventListener('change', onChange)
  return () => mediaQueryList.removeEventListener('change', onChange)
}

/** Reactively tracks whether a CSS media query currently matches. */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    onChange => subscribe(query, onChange),
    () => window.matchMedia(query).matches,
    () => false,
  )
}
